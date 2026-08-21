# Task: port the Geist / Geist Mono type system into the Collins site

_Handoff prompt — paste the whole file into a fresh session. Written 2026-08-21
from a live audit of siteassist.com/solutions. Not yet actioned._

## Reference — what siteassist.com/solutions actually uses

Audited from the live page (Webflow build, `siteassist.webflow.shared.7cc1d4700.min.css`).
Two fonts, both Google Fonts, loaded via `WebFont.load`:

```js
families: ["Geist:300,400,500,600,700", "Geist Mono:300,400,500,600,700"];
```

No self-hosted woff2, no third family. `Helvetica Neue`/`Arial` appear only in
Webflow's untouched base reset — ignore them.

**The role split — this is the actual idea worth porting, not the font names:**

| Font             | Applied to                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Geist** (sans) | `body` — all body copy — plus `h2`, `h3`, `h5`, `.subtitle`                                                                                                                  |
| **Geist Mono**   | `h1`, `h4`, `.button`, `.nav-link`, `.label`, `.caption`, `.number`, `.stats-number`, `.count-items`, `.quote-text`, `.coordinates__p`, `.footer-link`, `.solutions-heading` |

So: **mono carries structural/UI type** (largest display headings, nav, buttons,
eyebrows/labels, stat numbers, captions, pull quotes, footer links); **sans carries
reading type** (paragraphs, mid-level headings).

Supporting details that make the look work:

- Mono headings are `text-transform: uppercase` with negative tracking —
  `h1: letter-spacing -0.0625em`, `h4: -0.02375em`.
- **Everything is weight 400.** Every heading h1–h5 is `font-weight: 400` — there is
  no bold display type anywhere. 500 for some UI, 700 only on a few small labels,
  300 in two places. The declared 600 is unused.
- Headings are em-sized off a fluid root (`h1: 3.5em`, `h2: 4.5em`, `h3: 3.125em`,
  `h4: 2.375em`, `h5: 2.0625em`) with `line-height` 1–1.16.

## Current Collins state

- `src/styles/global.css:78-79` — `--font-sans: "Inter", system-ui, sans-serif`
  and `--font-display: "Inter Tight", "Inter", system-ui, sans-serif`.
- `src/styles/global.css:119-120` — base layer sets headings to
  `font-family: var(--font-display); font-weight: 600`.
- `src/layouts/Base.astro:36-40` — preconnect + one Google Fonts `css2` link
  requesting `Inter:wght@400;500;600;700` and `Inter+Tight:wght@500;600;700`.
- The size scale (`--text-micro` … `--text-display`) is px-based and complete;
  Tailwind's defaults are cleared with `--text-*: initial`. Read the token table in
  `CLAUDE.md` before picking any size.

## What I want

Port the SiteAssist **type system** — the sans/mono role split and the flat-400,
uppercase-mono-for-structure treatment — onto Collins, using Geist + Geist Mono.
Keep the existing size scale, colour tokens and layout; this is a typography swap,
not a redesign.

Work in this order:

1. **Ask me the open questions below first — don't guess.**
2. Wire the fonts: replace the Inter/Inter Tight Google Fonts link in
   `Base.astro` with Geist + Geist Mono at only the weights we actually use, and
   redefine `--font-sans` / `--font-display` (plus a new `--font-mono` token if the
   answers call for one) in the `@theme` block. Fonts are the one thing that has to
   change globally in a single step — a half-swapped page tells us nothing.
3. Then **one section at a time**, per the house rule: apply the mono role to that
   section's eyebrows, labels, buttons, stat numbers and captions, show me a
   screenshot, get it confirmed, and only then move to the next. Start with the
   header + hero. Do not do a speculative full-page pass.

## Open questions — answer these before writing code

- **Both fonts, or mono as an accent only?** Geist as body replaces Inter entirely;
  the alternative is keeping Inter/Inter Tight for reading type and adding Geist Mono
  purely for the label/eyebrow/stat layer.
- **How far does uppercase mono go?** SiteAssist puts `h1` and `h4` in uppercase mono.
  On Collins that would hit `text-display`/`text-h1` on the hero and every `h4`.
  My memory says the site's direction is _sentence-case Inter Tight_ — this is a real
  departure, so flag the conflict and let me decide rather than quietly overriding it.
- **Flat 400 weight?** Dropping headings from 600 to 400 is most of the character
  change. Confirm before applying.
- **Google Fonts or self-hosted?** Currently CDN. Geist is OFL; self-hosting
  woff2 removes the render-blocking third-party request.

## Constraints (from CLAUDE.md — read it in full first)

- **No node/bun on the host.** Everything runs in the `devbox` container:
  `docker exec -u node devbox sh -c 'cd /workspace/paid-to-type/collins-website && bun run <cmd>'`.
  Always `-u node`.
- **I run the dev server, not you.** Ask me to start it; don't background `bun run dev`.
- Tokens, not magic numbers. New tracking/size values go in `@theme` the moment a
  second component needs them.
- Reuse `components/ui/` — `Eyebrow`, `Pill`, `Button`, `SectionHeading` are where
  most of the mono roles already live, so the change should mostly land in those
  four files plus `global.css`, not scattered across sections.
- Done = `bun run check` clean, `bun run build` passes, `bun run format` run last.
