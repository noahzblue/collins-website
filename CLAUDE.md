# Collins Website — project notes for AI sessions

## Toolchain lives in a container, NOT on the host

This machine has **no `node`, `bun`, `npm`, or `npx` on the host PATH**. The full
toolchain lives inside the OrbStack dev container **`devbox`**, which mounts this
repo at **`/workspace/paid-to-type/collins-website`** (the container mirrors the
host `code-lab/` tree, so the path is nested — not `/workspace/collins-website`).
Node 22 + bun 1.3 are inside. **This repo uses `bun`, not npm.**

Do not conclude the project "can't be built/tested" because `node` is missing —
run it inside the container.

### Canonical way to run anything (node/bun/impeccable)

One-shot, non-interactive (preferred for agents — shell state does not persist
between commands, so an interactive shell won't hold):

```bash
docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && bun run build'
docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && node <script.mjs>'
```

Interactive equivalent (human at a terminal): `orb` (alias → `cd ~/code-lab/.orbstack`)
→ `make sh` → `cd paid-to-type/collins-website` → run `bun …`.

**Always pass `-u node`.** A bare `docker exec devbox …` runs as root and writes
root-owned files into `node_modules/.vite` / `.astro`, which then break the next
`node`-user run with `EACCES`. Heal with `make -C ~/code-lab/.orbstack fix-perms`
(the entrypoint also self-heals on container start).

## Running impeccable

Impeccable's own scripts are node, so every `node .claude/skills/impeccable/scripts/*.mjs`
step (context.mjs, concept-seed.mjs, serve-question.mjs, surface-brief.mjs,
live.mjs, detect.mjs, …) runs through the container wrapper above. Example:

```bash
docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && node .claude/skills/impeccable/scripts/context.mjs'
```

The design-detector **hook** in `.claude/settings.local.json` is already wired to
exec into `devbox` (it also `sed`-rewrites the host paths in its stdin payload to
`/workspace/…`). It is verified working — leave it unless it starts erroring.

## Dev server (for browser checks / impeccable live mode)

A dev server bound to `localhost` inside the container is **not** reachable from
the host or from the Playwright MCP container. Bind `0.0.0.0` and reach it via the
`devbox` container IP:

```bash
docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && bun run dev --host 0.0.0.0 --port 3001'
docker inspect devbox --format '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}'
# → browse / navigate Playwright to http://<devbox-ip>:3001/
```

(`repos.list` in `.orbstack/` reserves port 3001 for this repo but has it
commented out; `make dev REPO=paid-to-type/collins-website` works once uncommented.)
Do **not** use `host.docker.internal` or `*.orb.local` for the dev server — Astro
rejects the unknown Host header with a bare 403. Use numeric IPs.

## Working preferences

- **The user runs the dev server, not the assistant.** Do NOT auto-start `bun run dev` /
  `astro dev` in the background. Ask the user to start it (ideally with `--host 0.0.0.0` so
  screenshots via the Playwright container still work at the devbox IP). Work from code +
  screenshots the user shares when their server is down.
- **No global project memory.** Keep durable knowledge in the repo (`CLAUDE.md`,
  `docs/BUILD_STATUS.md`, and impeccable's own files), not in `~/.claude/.../memory/`.

## Resuming design work (impeccable)

This project uses the `impeccable` skill; its context lives in-repo: `PRODUCT.md` (product
truth), `DESIGN.md` (design system — write via `/impeccable document`), `.impeccable/surfaces/*.md`
(per-route strategy), `.impeccable/config.local.json`, and the design-detector hook.
A new session: run `/impeccable` — it executes `context.mjs` (through the container) to load
these automatically. Current progress + what's left: **`docs/BUILD_STATUS.md`**. Every
impeccable node script runs inside `devbox` via the `docker exec -u node` wrapper above.

## Project

Astro 7 static site. Rebuild of collinscouae.com in the visual style of
spheavyrental.ae. Product/design brief: `docs/Collins_Website_Rebuild_Brief.md`.
Locked visual direction: "The Working Drawing" (blueprint world, SP black+yellow palette).
