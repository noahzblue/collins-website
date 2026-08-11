# Collins Equipments — Website

Static marketing site for **Collins Equipments LLC**, an industrial & heavy
machinery sales and rental company in the UAE. Built with **Astro 7** and
**Tailwind CSS v4**.

---

## Editing content

Almost everything you'll want to change lives in two folders — you rarely need to
touch markup:

| To change…                                   | Edit                       |
| -------------------------------------------- | -------------------------- |
| Phone, email, address, hours, social, SEO    | `src/config/site.ts`       |
| Header nav + footer link columns             | `src/data/navigation.ts`   |
| Products, capabilities, partners, form list  | `src/data/catalog.ts`      |
| Branch locations                             | `src/data/branches.ts`     |
| Section headings & marketing copy            | `src/data/content.ts`      |

## Theming

The whole design system is configured as CSS variables in the `@theme` block of
**`src/styles/global.css`**. Change a colour or font there and it updates across
the site (Tailwind generates the matching utilities — `--color-brand` →
`bg-brand`, `text-brand`, `border-brand`).

## Project structure

```
src/
├── config/site.ts          # company facts / contact / SEO (single source of truth)
├── data/                   # products, branches, navigation, section copy
├── styles/global.css       # Tailwind import + @theme design tokens + base layer
├── layouts/Base.astro      # <head>, fonts, floating buttons, page slot
├── components/
│   ├── ui/                 # Button, Section, SectionHeading, Eyebrow, Logo
│   ├── Header / Footer / FloatingButtons
│   └── sections/           # one component per page section
└── pages/index.astro       # composes the sections
```

## Development

The toolchain runs inside the OrbStack **`devbox`** container (Node 22 + Bun) —
there is no `node`/`bun` on the host. See `CLAUDE.md` for details.

```sh
# inside the container, from /workspace/paid-to-type/collins-website
bun install                          # install dependencies
bun run dev --host 0.0.0.0           # dev server (bind 0.0.0.0 for browser access)
bun run build                        # production build to ./dist/
bun run preview                      # preview the build
bun run check                        # type-check .astro files
```

## Tech

- **Astro 7** — static site generator, zero client JS except the buy/rent toggle.
- **Tailwind CSS v4** — CSS-first config via `@tailwindcss/vite`; theme tokens in
  `global.css`.
- Fonts: **Bebas Neue** (display) + **Inter** (body), from Google Fonts.
