/**
 * Keeps a copy of every quote request in Postgres. Server only.
 *
 * The table is `db/migrations/0001_quote_requests.sql`. The endpoint saves
 * the request before it emails it and records the outcome after, so the
 * database is the record of what arrived and whether Collins was told.
 *
 * `DATABASE_URL` is Neon in production and the `db/compose.yml` container
 * locally. postgres.js talks plain Postgres to both; Neon's own HTTP driver
 * cannot reach a local database, which is why it is not used.
 *
 * Storage is a safety net, not a requirement: with `DATABASE_URL` unset, or
 * the database unreachable, these log and return, and the email still goes.
 */

import postgres from "postgres";
import { DATABASE_URL } from "astro:env/server";
import type { QuotePayload } from "./schema";

// One connection per function instance is plenty for one insert and one
// update. `prepare: false` because Neon's pooled URL (PgBouncer, transaction
// mode) does not keep named prepared statements between transactions.
const sql = DATABASE_URL
  ? postgres(DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 5,
      prepare: false,
    })
  : null;

/**
 * Saves the request as 'pending'. Resolves with its id, or null if not saved.
 *
 * `message` is the server's own text of the request (`email.ts` `toText`),
 * and `ipHash` the SHA-256 of the sender's address — the raw IP is never
 * stored; the hash exists only so `recentFrom` can count.
 */
export async function saveRequest(
  payload: QuotePayload,
  message: string,
  ipHash: string | null = null,
): Promise<string | null> {
  if (!sql) return null;
  const { request, contact } = payload;
  try {
    // postgres.js rejects `undefined`, so every optional value is `?? null`.
    // `sql.json`, not `JSON.stringify(…)::jsonb`: a string parameter cast to
    // jsonb is stored as one JSON *string*, not an object, and every query
    // into `payload` then finds nothing.
    const rows = await sql`
      insert into quote_requests (
        payload_version, payload, message,
        mode, category, contact_name, contact_phone, contact_email,
        reply_channel, source_page, ip_hash
      ) values (
        ${payload.v}, ${sql.json(payload as unknown as postgres.JSONValue)}, ${message},
        ${request.mode ?? null}, ${request.category?.id ?? request.otherItem ?? null},
        ${contact.name}, ${contact.phone}, ${contact.email ?? null},
        ${contact.channel}, ${payload.source.page}, ${ipHash}
      )
      returning id`;
    return (rows[0]?.id as string) ?? null;
  } catch (error) {
    console.error("[quote] could not save request:", (error as Error).message);
    return null;
  }
}

/**
 * How many requests this address hash has stored in the last `minutes`.
 * The rate limit in `pages/api/quote.ts` reads it. Resolves 0 when there is
 * no database or it cannot be reached: a limit that fails closed would turn a
 * database outage into a lost customer, and the email is the point.
 */
export async function recentFrom(
  ipHash: string,
  minutes: number,
): Promise<number> {
  if (!sql) return 0;
  try {
    const rows = await sql`
      select count(*)::int as n from quote_requests
      where ip_hash = ${ipHash}
        and created_at > now() - make_interval(mins => ${minutes})`;
    return (rows[0]?.n as number) ?? 0;
  } catch (error) {
    console.error("[quote] rate check skipped:", (error as Error).message);
    return 0;
  }
}

/** Records what happened to the email. */
export async function recordOutcome(
  id: string | null,
  outcome:
    | { sent: true; messageId: string; attempts: number }
    | { sent: false; error: string; attempts: number },
): Promise<void> {
  if (!sql || !id) return;
  try {
    if (outcome.sent) {
      await sql`
        update quote_requests set
          email_status = 'sent', email_attempts = ${outcome.attempts},
          email_message_id = ${outcome.messageId}, email_last_error = null,
          email_sent_at = now(), updated_at = now()
        where id = ${id}`;
    } else {
      await sql`
        update quote_requests set
          email_status = 'failed', email_attempts = ${outcome.attempts},
          email_last_error = ${outcome.error.slice(0, 1000)},
          updated_at = now()
        where id = ${id}`;
    }
  } catch (error) {
    console.error(
      "[quote] could not record outcome:",
      (error as Error).message,
    );
  }
}
