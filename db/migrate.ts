/**
 * Applies every `db/migrations/*.sql` file, in name order, to the database in
 * `DATABASE_URL` (the local `db/compose.yml` container, or Neon). Each
 * migration is written to be safe to run again, so there is no bookkeeping
 * table: run it after adding a migration, or on a new database.
 *
 *   bun run db:migrate
 *
 * Each file runs as one simple query, so it may hold several statements.
 */

import { readdir, readFile } from "node:fs/promises";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
const dir = new URL("./migrations/", import.meta.url);
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

try {
  for (const file of files) {
    await sql.unsafe(await readFile(new URL(file, dir), "utf8"));
    console.log(`applied ${file}`);
  }
} finally {
  await sql.end();
}
