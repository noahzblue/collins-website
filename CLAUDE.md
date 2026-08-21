# Collins Website — project notes for AI sessions

Astro 7 static site for **Collins Equipments LLC** — industrial & heavy
machinery sales and rental in the UAE (generators, forklifts, air compressors,
cranes, tower lights, spare parts), to buy or rent.

---

## 1. Toolchain lives in a container, NOT on the host

This machine has **no `node`, `bun`, `npm`, or `npx` on the host PATH**. The full
toolchain lives inside the OrbStack dev container **`devbox`**, which mounts this
repo at **`/workspace/paid-to-type/collins-website`** (the container mirrors the
host `code-lab/` tree, so the path is nested — not `/workspace/collins-website`).
Node 22 + bun 1.3 are inside. **This repo uses `bun`, not npm.**

Do not conclude the project "can't be built/tested" because `node` is missing —
run it inside the container.

### Canonical way to run anything

One-shot, non-interactive (preferred for agents — shell state does not persist
between commands, so an interactive shell won't hold):

```bash
docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && bun run build'
docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && bun run check'
docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && bun run format'
```

Interactive equivalent (human at a terminal): `orb` (alias → `cd ~/code-lab/.orbstack`)
→ `make sh` → `cd paid-to-type/collins-website` → run `bun …`.

**Always pass `-u node`.** A bare `docker exec devbox …` runs as root and writes
root-owned files into `node_modules/.vite` / `.astro`, which then break the next
`node`-user run with `EACCES`. Heal with `make -C ~/code-lab/.orbstack fix-perms`
(the entrypoint also self-heals on container start).

## 2. Dev server (for browser checks)

A dev server bound to `localhost` inside the container is **not** reachable from
the host or from the Playwright MCP container. Bind `0.0.0.0` and reach it via the
`devbox` container IP:

```bash
docker inspect devbox --format '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}'
# → browse / navigate Playwright to http://<devbox-ip>:3001/
```

Do **not** use `host.docker.internal` or `*.orb.local` for the dev server — Astro
rejects the unknown Host header with a bare 403. Use numeric IPs.

## 3. Working preferences

- **The user runs the dev server, not the assistant.** Do NOT auto-start `bun run dev` /
  `astro dev` in the background. Ask the user to start it (ideally with `--host 0.0.0.0` so
  screenshots via the Playwright container still work at the devbox IP). Work from code +
  screenshots the user shares when their server is down.
- **Design work moves one section at a time** — build it, show it, get it confirmed,
  then move on. Never a speculative full-page restyle.
- **Verify before claiming done:** `bun run check` (0 errors) **and** `bun run build`.
  Run `bun run format` before finishing so the diff is only real changes.

---

# Code structure & conventions

The rules below are what keep this codebase legible. Follow them; when something
genuinely doesn't fit, say so rather than quietly inventing a second pattern.

## Where things live

```
src/
├── config/site.ts         Company facts: phone, email, address, hours, social,
│                          SEO defaults. Single source of truth — never hardcode
│                          a phone number or address in a component.
├── data/                  Editable content, plain TS. No markup, no logic.
│   ├── content.ts         Section headings, eyebrows, intro paragraphs.
│   ├── navigation.ts      Header nav + footer link columns.
│   ├── services.ts        The three services in the homepage accordion.
│   ├── proof.ts           "Why Collins" points, partner wordmarks, stats, quotes.
│   └── industries.ts      The eight industries + their /industries/<slug> pages.
├── content/equipment/     The equipment catalogue (content collection).
│   └── categories.json    All twelve categories + their size/rating ranges.
├── content.config.ts      Zod schema for the above. A typo fails the build.
├── lib/equipment.ts       Equipment display strings + helpers (availability
│                          labels, badges, WhatsApp enquiry links).
├── scripts/rotator.ts     Shared client behaviour for rotating panels.
├── styles/global.css      The ENTIRE design system: @theme tokens, base layer,
│                          and four component classes. Nothing else.
├── layouts/Base.astro     <head>, Header, <main><slot/></main>, Footer,
│                          FloatingButtons. Every page renders inside it.
├── components/
│   ├── layout/            Header, Footer, FloatingButtons. Used by Base only.
│   ├── ui/                Design-system primitives. Reusable, page-agnostic.
│   ├── sections/          One component per homepage section.
│   └── equipment/         Components for the equipment slice only.
└── pages/
    ├── index.astro        Composes the homepage sections. Nothing else.
    ├── equipment/         index.astro (hub) + [slug].astro (category page)
    └── industries/        [slug].astro
```

## Imports: always `@/`

`@/*` maps to `src/*` (tsconfig `paths`). Use it for every cross-folder import.
Only same-directory imports use `./`.

<!-- prettier-ignore -->
```text
import Button  from "@/components/ui/Button.astro";      // yes
import Button  from "../../components/ui/Button.astro";  // no
import Eyebrow from "./Eyebrow.astro";                   // fine — same folder
```

## Styling: tokens, not magic numbers

`src/styles/global.css` `@theme` is the whole design system. Every colour, text
size, and header offset is a token that generates a Tailwind utility.

**Tailwind's default text sizes are deliberately cleared** (`--text-*: initial`),
so the scale in `global.css` is the site's complete text vocabulary. If you write
`text-lg` it silently does nothing — that is the point. Pick a rung:

| Token                                              | px    | Use for                            |
| -------------------------------------------------- | ----- | ---------------------------------- |
| `text-micro`                                       | 11    | tracked caps, index-rail numbers   |
| `text-tag`                                         | 11.5  | table heads, family labels         |
| `text-label`                                       | 12    | eyebrow caps, pills                |
| `text-caption`                                     | 12.5  | form hints, method labels          |
| `text-meta`                                        | 13    | breadcrumbs, footer headings       |
| `text-note`                                        | 13.5  | dense supporting copy              |
| `text-sm`                                          | 14    | footer links, buttons              |
| `text-detail`                                      | 14.5  | card body, stat labels             |
| `text-base`                                        | 15    | **default body copy — start here** |
| `text-cell`                                        | 15.5  | table cells, list items            |
| `text-lead`                                        | 16    | section intros                     |
| `text-lead-lg`                                     | 16.5  | larger intros, banner spec lines   |
| `text-intro`                                       | 17    | page intro paragraphs              |
| `text-subhead`                                     | 18    | accordion titles, tile names       |
| `text-h3` / `text-h2` / `text-h1` / `text-display` | fluid | headings, smallest → largest       |

Rules:

- **A size token may never share a name with a colour token.** Both generate
  `text-<name>` and the colour silently wins. (`--text-base` is named that
  precisely because `--color-body` already owns `text-body`.)
- Arbitrary values (`text-[19px]`, `p-[13px]`) are for **genuine one-offs inside a
  single component**. The moment a second component needs the same value, it
  becomes a token.
- Anything that must clear the fixed header uses `--spacing-header` /
  `--spacing-header-gap`, never a raw px.
- `.wrap` (max-width container), `.card`, `.scrim-banner` are the only component
  classes. Anything with markup belongs in an `.astro` file, not a CSS class.

## Reuse before you write markup

Check `components/ui/` first — these exist because the pattern was already
duplicated:

| Component        | Use for                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| `Button`         | every CTA (`primary` / `outline` / `outline-white`)                      |
| `Pill`           | every rounded chip: badges, power types, tags                            |
| `Icon`           | every SVG glyph — add new ones to `ui/icons.ts`, never inline an `<svg>` |
| `Eyebrow`        | the small accent label above a heading                                   |
| `Section`        | the standard padded page section (`light` / `gray` / `dark`)             |
| `SectionHeading` | eyebrow + heading + optional intro                                       |
| `Breadcrumb`     | the trail above any subpage heading                                      |
| `PageBanner`     | the full-bleed photo banner opening a subpage                            |
| `BgImage`        | a decorative full-cover background layer                                 |
| `ContactRows`    | icon + line lists of contact details                                     |
| `Logo`           | the wordmark                                                             |

Client-side rotating panels (tab cards, accordions, sliders) use
`@/scripts/rotator.ts` — do not hand-roll another timer/hover/reduced-motion loop.

## Common tasks

- **Change a phone number, address, hours, social link** → `src/config/site.ts`.
- **Change section copy** → `src/data/content.ts`.
- **Add an equipment category** → one object in `src/content/equipment/categories.json`.
  The homepage grid (`featured: true`), the `/equipment` hub, its own page, the
  quote-form dropdown and the index rail all pick it up. The Zod schema in
  `content.config.ts` fails the build on a typo or a bad `related` slug.
- **Add an industry** → one object in `src/data/industries.ts`; the homepage grid
  and `/industries/<slug>` both follow.
- **Add a page** → create it in `src/pages/`, wrap in `<Base>`. Header, footer and
  floating buttons come with it — never import chrome per page.
- **Add an icon** → a new entry in `src/components/ui/icons.ts`, then
  `<Icon name="…" />`. Keep bodies free of hardcoded `fill`/`stroke` so
  `currentColor` theming keeps working.

## Accessibility & motion

Every animated block must honour `prefers-reduced-motion` — `rotator.ts` does it
for you; bespoke CSS animations need their own `@media` guard. Decorative images
are `aria-hidden`; anything meaningful needs real alt text.
