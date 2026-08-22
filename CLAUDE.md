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
├── lib/forms.ts           `Option` + `scopedId` — what every input primitive
│                          needs. Generic; no feature knows about it.
├── lib/quote/             The quote form's contract: schema, options (every
│                          chip list + all its copy), compose, validate, submit.
│                          `submit.ts` is the only fetch and the only env read.
├── scripts/rotator.ts     Shared client behaviour for rotating panels.
├── scripts/quote/         The quote form's behaviour. `dialog.ts` owns
│                          open/close; `form.ts` owns state, steps,
│                          conditionals, validation and submit;
│                          `draft.ts` owns sessionStorage.
├── styles/global.css      The ENTIRE design system: @theme tokens, base layer,
│                          and its component classes. Nothing else.
├── layouts/Base.astro     <head>, Header, <main><slot/></main>, Footer,
│                          FloatingButtons, QuoteDialog. Every page renders
│                          inside it.
├── components/
│   ├── layout/            Header, Footer, FloatingButtons. Used by Base only.
│   ├── ui/                Design-system primitives. Reusable, page-agnostic.
│   ├── sections/          One component per homepage section.
│   ├── equipment/         Components for the equipment slice only.
│   └── quote/             The quote request form (see docs/site-expansion/14).
│                          Mounted once, in Base — anything carrying
│                          `data-quote-open`, and `?quote=1` on any URL,
│                          opens it.
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
- `.wrap` (max-width container), `.card`, `.mesh` (the hairline lattice a dense
  selection grid draws — a deliberate alternative to `.card`, not a variant of
  it), `.scrim-banner` are the only component
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
| `ParallaxImage`  | every photo — it drifts as the page scrolls; one exception, below        |
| `ContactRows`    | icon + line lists of contact details                                     |
| `Logo`           | the wordmark                                                             |

Form controls — all take an `instance` prop and generate every id through
`scopedId`, because two copies of a form can share one document:

| Component    | Use for                                                                   |
| ------------ | ------------------------------------------------------------------------- |
| `Field`      | label + control + hint + error. Underline only — there is one field style |
| `ChipGroup`  | any radio group as chips: `rule` / `bar` / `segment` / `display`          |
| `ChoiceTile` | photo + radio selection cell; `layout="responsive"` steps tile → row      |
| `Dropdown`   | `<details>` shell, underline trigger, panel is a slot                     |
| `Checkbox`   | one square box and a label — the form's only non-radio choice             |

And one that is not a form control but belongs to the same reserve:

| Component | Use for                                                                 |
| --------- | ----------------------------------------------------------------------- |
| `Dialog`  | every modal — native `<dialog>`, centred panel ≥900px, full sheet below |

`Dialog` is presentation only: open, close, history, focus and the body scroll
lock live in a script that takes the element as its root
(`scripts/quote/dialog.ts` today). Never hand-roll a second overlay — the top
layer, the focus trap, Escape and `inert` are all things the native element
already gets right.

**A rating's `label` is not unique inside its category** — forklifts list
"3 ton" twice, diesel and electric. Anything that keys, ids or stores a range
uses `rangeKey()` from `lib/equipment.ts`; the label is for display and for the
quotation, never for identity.

**Nothing in a form is rounded.** `rounded-full` still means a badge or a dot
(`Pill`), never a control — see `docs/site-expansion/14 §14.3`.

**The one photo that does not drift** is `ChoiceTile`'s: a selection control
that moves while you are trying to click it is a bug, not a detail. It uses a
plain lazy `<img>`. That is the only sanctioned exception to `ParallaxImage`;
anything else that wants a still photo should say why here first.

Client-side rotating panels (tab cards, accordions, sliders) use
`@/scripts/rotator.ts` — do not hand-roll another timer/hover/reduced-motion loop.

## Component contracts: keep them dumb

Five layers, and **only the composition layer may read data**:

| Layer            | Where                             | May contain                            | May **not** contain         |
| ---------------- | --------------------------------- | -------------------------------------- | --------------------------- |
| **Facts**        | `content/`, `data/`, `config/`    | plain data                             | markup, logic               |
| **Logic**        | `lib/`                            | pure functions, types, derived strings | DOM, markup                 |
| **Presentation** | `components/ui/`, feature folders | markup, styling, props                 | data imports, copy literals |
| **Composition**  | `pages/`, `components/sections/`  | reads data, binds it to components     | markup beyond layout        |
| **Behaviour**    | `scripts/`                        | event wiring, state, a root element    | `document.*` queries, copy  |

`components/equipment/` is the exemplar — all six take everything through
props and import nothing from `data/` or `config/`, which is why `RangeTable`
renders on a category page, a hub row and inside the quote form untouched.
Every file in `sections/` imports data, because binding data is their job.

The rules that keep a component reusable:

- **No copy literals in a leaf component.** Labels, legends, placeholders and
  option lists arrive as props or come from `data/`. A component containing the
  string `"Under a week"` can't be reused, and the person who needs to change
  it has to go looking.
- **Options are data, not markup.** Six hand-written `<input type="radio">`
  blocks become one `options={DURATIONS}` prop. Adding one is then a one-line
  data edit that can't break markup.
- **Values are stable keys, not display strings.** `"1-3-months"`, not
  `"1–3 months"` — display text belongs in the label.
- **Variants are lookup maps, not conditionals** — see `Pill.astro`'s `tones`.
- **Every component declares a documented `Props` interface**, defaults in the
  destructure, `class: extra = ""` passthrough. See `Section.astro`.
- **Scripts take a root element and never touch `document`.** Query through
  `root`, so two instances of a component on one page can't collide. Generate
  ids from an instance prefix for the same reason.
- **A file earns its existence when it has a name someone would search for.**
  Past ~150 lines a component is usually doing two jobs; under ~20 it usually
  belongs inline.

The test for all of it: **for any change someone might want to make, there
should be exactly one obvious file to open.** If a change needs two files open
at once, the boundary is in the wrong place.

## Common tasks

- **Change a phone number, address, hours, social link** → `src/config/site.ts`.
- **Change section copy** → `src/data/content.ts`.
- **Change a quote-form option, label or hint** → `src/lib/quote/options.ts`.
  Every chip list and every string the form shows is there.
- **Make a button open the quote form** → `{...quoteTrigger(categoryId, mode, range)}`
  from `lib/equipment.ts`, or a bare `data-quote-open` where nothing is known
  yet. Keep the `href` — it is the no-JS fallback. On `/contact` the same
  attribute scrolls to the inline form instead of opening a second copy.
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

## Two ways an `.astro` file breaks silently

Both sever `interface Props` from `Astro.props`. Every prop then degrades to
`any`, the component still builds and still renders, and the only trace is a
soft `ts(6196) 'Props' is declared but never used` hint — which reads like dead
code, so the instinct is to delete the interface rather than fix the cause.

1. **A bare `<` in a frontmatter comment.** The compiler's scanner reads it as
   the start of markup. Write comparisons in words ("fits inside", "at most"),
   and never write an unclosed tag name in prose — `<select>` in a comment
   costs an hour.
2. **A prop named `as`.** It becomes a destructuring binding named `as`, which
   defeats the detection. Name it `element` — see `ui/Field.astro`.

Both can be present at once and each is independently sufficient, so fixing one
leaves the file broken. If `bun run check` reports ts(6196) on a `Props`
interface, check for both before touching the interface.

## Accessibility & motion

Every animated block must honour `prefers-reduced-motion` — `rotator.ts` does it
for you; bespoke CSS animations need their own `@media` guard. Decorative images
are `aria-hidden`; anything meaningful needs real alt text.
