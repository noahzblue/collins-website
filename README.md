# Collins Equipments — Website

Static marketing site for **Collins Equipments LLC**, an industrial & heavy
machinery sales and rental company in the UAE. Built with **Astro 7** and
**Tailwind CSS v4**.

22 pages: a homepage, an equipment hub with twelve category pages, and eight
industry pages — all generated from data files, no CMS.

---

## Development

The toolchain runs inside the OrbStack **`devbox`** container (Node 22 + Bun) —
there is no `node`/`bun` on the host. See [`CLAUDE.md`](./CLAUDE.md) for details.

```sh
# inside the container, from /workspace/paid-to-type/collins-website
bun install                          # install dependencies
bun run dev --host 0.0.0.0           # dev server (bind 0.0.0.0 for browser access)
bun run build                        # production build to ./dist/
bun run preview                      # preview the build
bun run check                        # type-check .astro files
bun run format                       # Prettier (incl. Tailwind class sorting)
bun run format:check                 # verify formatting without writing
```

Run `check` and `build` before committing; `format` keeps diffs to real changes.

## Editing content

Almost everything you'll want to change lives in data files — you rarely need to
touch markup:

| To change…                                        | Edit                                    |
| ------------------------------------------------- | --------------------------------------- |
| Phone, email, address, hours, social, default SEO | `src/config/site.ts`                    |
| Header nav + footer link columns                  | `src/data/navigation.ts`                |
| Section headings, eyebrows, intro copy            | `src/data/content.ts`                   |
| Equipment categories, sizes, availability         | `src/content/equipment/categories.json` |
| The three services                                | `src/data/services.ts`                  |
| "Why Collins", partners, stats, testimonials      | `src/data/proof.ts`                     |
| Industries + their pages                          | `src/data/industries.ts`                |

### Adding an equipment category

Add one object to `src/content/equipment/categories.json`. It automatically
appears on the `/equipment` hub, gets its own `/equipment/<slug>` page, joins the
quote-form dropdown and the hub's index rail — and shows on the homepage grid if
`featured` is `true`.

The Zod schema in `src/content.config.ts` validates every field at build time, so
a typo in `availability` or a `related` slug that doesn't exist fails the build
rather than shipping a broken page.

## Theming

The whole design system is CSS variables in the `@theme` block of
**`src/styles/global.css`** — colours, the type scale, header offsets and
breakpoints. Change a value there and it updates across the site, because
Tailwind generates the matching utilities (`--color-brand` → `bg-brand`,
`text-brand`, `border-brand`; `--text-lead` → `text-lead`).

Tailwind's default text sizes are deliberately cleared, so the scale in
`global.css` is the site's complete text vocabulary. See `CLAUDE.md` for the
table of rungs and when to use each.

## Project structure

```
src/
├── config/site.ts          # company facts / contact / SEO (single source of truth)
├── data/                   # editable copy: content, navigation, services, proof, industries
├── content/equipment/      # the equipment catalogue (Astro content collection)
├── content.config.ts       # Zod schema validating the catalogue at build time
├── lib/equipment.ts        # equipment display strings + enquiry-link helpers
├── scripts/rotator.ts      # shared rotating-panel behaviour (tabs, accordion, slider)
├── styles/global.css       # Tailwind import + @theme tokens + base layer
├── layouts/Base.astro      # <head>, header, <main>, footer, floating buttons
├── components/
│   ├── layout/             # Header, Footer, FloatingButtons
│   ├── ui/                 # Button, Pill, Icon, Section, SectionHeading, Eyebrow,
│   │                       #   Breadcrumb, PageBanner, BgImage, ContactRows, Logo
│   ├── sections/           # one component per homepage section
│   └── equipment/          # CategoryCard/Row/Index, RangeTable, IncludedList, DutyGuide
└── pages/
    ├── index.astro         # composes the homepage sections
    ├── equipment/          # index.astro (hub) + [slug].astro (category page)
    └── industries/         # [slug].astro
```

Conventions (import aliases, the type scale, which component to reach for) are
documented in [`CLAUDE.md`](./CLAUDE.md).

## Tech

- **Astro 7** — static output. Client JS is limited to small progressive
  enhancements: the header's scroll tone, three rotating panels, the stat
  count-up, the hub's index rail and the quote form's WhatsApp handoff.
- **Tailwind CSS v4** — CSS-first config via `@tailwindcss/vite`; all theme
  tokens live in `global.css`.
- **Prettier** with `prettier-plugin-astro` + `prettier-plugin-tailwindcss`
  (automatic class sorting).
- Fonts: **Inter Tight** (display) + **Inter** (body), from Google Fonts.

Open work is tracked in [`todo.md`](./todo.md).
