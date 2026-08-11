# Collins Website — project notes for AI sessions

## Toolchain lives in a container, NOT on the host

This machine has **no `node`, `bun`, `npm`, or `npx` on the host PATH**. The full
toolchain lives inside the OrbStack dev container **`devbox`**, which mounts this
repo at **`/workspace/paid-to-type/collins-website`** (the container mirrors the
host `code-lab/` tree, so the path is nested — not `/workspace/collins-website`).
Node 22 + bun 1.3 are inside. **This repo uses `bun`, not npm.**

Do not conclude the project "can't be built/tested" because `node` is missing —
run it inside the container.

### Canonical way to run anything (node/bun)

One-shot, non-interactive (preferred for agents — shell state does not persist
between commands, so an interactive shell won't hold):

```bash
docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && bun run build'
docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && bun install'
```

Interactive equivalent (human at a terminal): `orb` (alias → `cd ~/code-lab/.orbstack`)
→ `make sh` → `cd paid-to-type/collins-website` → run `bun …`.

**Always pass `-u node`.** A bare `docker exec devbox …` runs as root and writes
root-owned files into `node_modules/.vite` / `.astro`, which then break the next
`node`-user run with `EACCES`. Heal with `make -C ~/code-lab/.orbstack fix-perms`
(the entrypoint also self-heals on container start).

## Dev server (for browser checks)

A dev server bound to `localhost` inside the container is **not** reachable from
the host or from the Playwright MCP container. Bind `0.0.0.0` and reach it via the
`devbox` container IP:

```bash
docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && bun run dev --host 0.0.0.0 --port 3001'
docker inspect devbox --format '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}'
# → browse / navigate Playwright to http://<devbox-ip>:3001/
```

Do **not** use `host.docker.internal` or `*.orb.local` for the dev server — Astro
rejects the unknown Host header with a bare 403. Use numeric IPs.

## Working preferences

- **The user runs the dev server, not the assistant.** Do NOT auto-start `bun run dev` /
  `astro dev` in the background. Ask the user to start it (ideally with `--host 0.0.0.0` so
  screenshots via the Playwright container still work at the devbox IP). Work from code +
  screenshots the user shares when their server is down.

## Project

Astro 7 static site for Collins Equipments LLC — industrial & heavy machinery
sales and rental in the UAE (generators, forklifts, air compressors, cranes,
tower lights, spare parts), to buy or rent.

Current visual direction: **blue theme** — white background, `#0050F0` / `#2F6FFF`
blue accents, black (`#000000`) dark sections, Bebas Neue display + Inter body
(loaded from Google Fonts). The design is a faithful build of the client-provided
reference prototype `Collins_Website_Blue_Theme.html`.

### Structure

- `src/styles/global.css` — the entire design system + all component styles (`:root`
  variables, reset, section styles, responsive breakpoints). One global stylesheet.
- `src/layouts/Base.astro` — `<head>` (meta, fonts, favicon), imports `global.css`,
  renders the page `<slot/>` and the fixed call/WhatsApp floating buttons.
- `src/components/Header.astro` — utility bar + sticky header/nav.
- `src/components/Footer.astro` — footer.
- `src/pages/index.astro` — the single-page site: hero, trust strip, product grid,
  capabilities, partners, buy/rent demo, quote band, branches, about teaser, plus
  the Buy/Rent toggle script.
- `public/images/` — `hero-bg.jpg` and `about-photo.jpg` (extracted from the
  reference prototype's inline base64 backgrounds).
