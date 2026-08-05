# Collins Website — Build Status & Handoff

_Last updated: 2026-08-05 (home-page build)._

Single-page → multi-page Astro rebuild of **collinscouae.com** in the visual style of
**spheavyrental.ae**. Design direction is locked and the **home page is fully built**.
Inner pages, the lead-form backend, and the impeccable "finish" close (DESIGN.md + review)
remain.

## Locked design decisions
- **Direction — "The Working Drawing":** the catalog rendered as an engineer's dimensioned
  working drawings on a black blueprint ground. (impeccable seed `08c5912a`, mode `persuade`.)
  The full contract lives as an HTML comment at the top of `src/layouts/Base.astro`'s `<body>`.
- **Palette — SP black + safety-yellow** (verified from the live SP DOM): ground `#000000`,
  primary CTA `#FFDD04` (sharp 0px corners), secondary `#DF790D`, WhatsApp `#25D366`; Collins
  navy `#081459` / blue `#0050F0` kept for linework tint + logo only; white/greys for text.
- **Type (self-hosted @fontsource):** Anton (display caps) · Spline Sans Mono
  (labels/spec numerals) · Archivo (body).
- **Design system recorded:** `DESIGN.md` (tokens + 8 sections) + `.impeccable/design.json`
  sidecar (component snippets, ramps, motion) — written from the built code.
- Product truth: `PRODUCT.md`. Home-page strategy: `.impeccable/surfaces/src-pages-index-astro.md`.

## Done
- Container toolchain + design-detector hook (container-routed) — see `CLAUDE.md`.
- `PRODUCT.md`, home surface brief, `src/styles/tokens.css`, `src/layouts/Base.astro`
  (carries the direction contract), `src/components/Footer.astro`.
- **Home page** (`src/pages/index.astro`): nav, hero (dimensioned generator drawing +
  Buy/Hire title-block toggle + dimension-lines draw-on motion), catalog "drawing sheets"
  (6 categories → their routes), services, partners strip, "We are Collins" + stats,
  two-branch showcase, inline lead form, footer, twin Call/WhatsApp FABs. Responsive;
  no horizontal overflow on desktop or mobile.

## Left to do (rough order)
1. **Finish review** of the home page (`impeccable-finish-reviewer`) — verify the built page
   against the direction contract; apply any material fixes. (DESIGN.md is already written.)
2. **Consolidate the type scale** (`/impeccable typeset`, verify live). The build grew ~25
   hand-tuned font-sizes; `DESIGN.md` documents ~4 roles. Define an `--fs-*` ladder in
   `tokens.css`, snap the literals to it, and document it in `DESIGN.md` typography. Until
   then the detector flags `design-system-font-size` on `index.astro` + `Footer.astro` (not
   bugs — a documentation/consolidation gap).
3. **Inner pages**, each inheriting the world: product pages `/generators/ /forklifts/
   /air-compressors/ /heavy-equipment/ /tower-lights/ /industrial-equipments/` + new dedicated
   Cranes / Excavators / Backhoe Loaders / Boom Loaders / `/oil-and-gas-equipments/`;
   `/rental/`, `/trading/`, `/request-a-quote/`, `/about/`, `/services/` (replace the
   leftover roofing-template Lorem Ipsum), `/branches/`, `/contact-us/`, `/spare-parts/`
   (VIN form), `/used-cars/`.
4. **Lead-form backend** — pick an endpoint (Formspree / Netlify Forms / API). Currently `action="#"`.
5. **Replace placeholders:** 2nd branch address, official Collins logo SVG, a real dusk
   jobsite photo (in "We are Collins"), Google Maps embed, verify stats (4,000+/3+/50+),
   confirm/omit Facebook·YouTube·LinkedIn.
6. Persist the `codex-grid-background` hook ignore on the blueprint surfaces (false positive).
7. **Light theme is now the DEFAULT** ("drafting on paper", navy ink on paper); the dark
   blueprint is opt-in via `data-theme="dark"`. **Verify contrast live** — yellow *fills*
   read fine on paper; thin accents switched to construction-orange (`--accent-line`). Some
   `DESIGN.md` prose still describes the dark ground and should be refreshed alongside the
   type-scale pass.

## Resuming design work in a new session
1. Read this file + `CLAUDE.md`.
2. Start the skill: type `/impeccable` (context menu) or a command below. It runs
   `context.mjs` (through the container) which auto-loads `PRODUCT.md` + `DESIGN.md` +
   the surface brief — so the design context carries over.
3. All impeccable node scripts run inside `devbox`:
   `docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && node .claude/skills/impeccable/scripts/<script>'`.
4. **You** start the dev server; the assistant will not auto-start it.

### Impeccable commands you'll likely use
| Command | For |
|---|---|
| `/impeccable document` | Write/refresh `DESIGN.md` from the built code |
| `/impeccable` → "build the Generators page" | A new page that inherits the locked world |
| `/impeccable live` | In-browser variant iteration (needs a running dev server) |
| `/impeccable audit src/pages/index.astro` | Technical quality pass (a11y/perf/responsive) |
| `/impeccable polish <target>` | Final pass before shipping |
| `/impeccable colorize` / `adapt` / `typeset` … | Targeted design edits |
