# 15 — Layout, navigation & quote-form pass

**Built 22 Aug 2026.** Every item below shipped. `bun run check` is clean,
`bun run build` passes, and the pass was verified in the browser across nine
routes at six widths (1728 / 1520 / 1440 / 1024 / 768 / 390) with no horizontal
overflow, no duplicate `h1` and no console errors.

Three things turned out differently from the plan, and they are the parts worth
reading — see **What the build changed**, at the foot.

---

## A · The index rail + alternating rows

The same shell is hand-written in four pages today
(`services/index.astro:69`, `equipment/index.astro:52`, `yard.astro:88`,
`about.astro:78`) as `.wrap > .grid-cols-[180px_1fr]`. That rail eats 252px out
of the 1200px column, which is why the alternating photo/copy rows feel
cramped.

### A1 — `ui/RailSections.astro` (new)

One component for "sticky numbered rail beside a column of long sections".

- Full-bleed grid: `1fr | 1200px | 1fr`. The rail sits in the **left outer
  margin**; the content column keeps the exact `.wrap` width every other
  section on the page uses, so it stops paying for the rail.
- Below `--breakpoint-nav` (980px) it collapses to today's behaviour: chip
  strip pinned on top, content as a plain block.
- **Cut-off:** between roughly 1200px and 1500px there isn't enough outer
  margin to clear the column, so the rail keeps the current in-grid layout
  below ~1500px and moves outside above it.

### A2 — `ui/AlternatingRow.astro` (new)

One generic row: photo one side, copy the other, `flip` by index, slots for the
meta line, body and actions.

- `equipment/CategoryRow.astro` is rebuilt on it.
- The inline `/services` rows (`services/index.astro`, beat 3) are rebuilt on
  it.
- **Risk, flagged:** the two differ in their meta line (family + availability
  badges vs icon + number) and their actions (one link vs two buttons). If the
  shared row starts growing optional props, stop and review before pushing
  further.

### A3 — Port the four pages

`/services`, `/equipment`, `/yard`, `/about` all move onto `RailSections`.
`equipment/CategoryIndex.astro` becomes a thin mapper or disappears into it.

### A4 — Rail active state → filled brand block

Per the supplied reference: the selected item becomes a filled `bg-brand`
block, white number + label, `rounded-sm`, spanning the rail column — replacing
today's left-border + coloured-number treatment in `ui/IndexRail.astro`. The
mobile chip strip gets the same filled fill instead of the current tint.

### A5 — Fix: rail anchor clicks don't scroll to the section

Real bug. Suspects, in order:

1. Lenis's `anchors: { offset: -104 }` (`layouts/Base.astro`) fighting Astro's
   `ClientRouter` hash handling,
2. the `max-nav:contents` wrapper in `IndexRail`,
3. the click never reaching Lenis at all.

Diagnose in the browser first. Likely fix: extract the Lenis instance into
`scripts/scroll.ts` and let `IndexRail` own its own click →
`lenis.scrollTo(target, { offset: -104 })`.

---

## B · Sections

### B1 — `PageCTA` → light theme

`sections/PageCTA.astro`: drop `tone="dark"`, white → `ink`, `#aab2c0` →
`muted`, `outline-white` → `outline`. Lands on all six pages that use it.

### B2 — `sections/ClosingNote.astro` (new)

The /services beat-4 shape: copy left, arrow link right, **border-y hairlines
kept**, no card box.

- Replaces the bordered `.card` closer at `equipment/index.astro:70`.
- Takes over the beat-4 markup in `services/index.astro`.
- Copy stays in `data/content.ts` (`equipmentHub.closing`,
  `servicesSection.crossSell`).

### B3 — Remove the yard stats strip

`pages/yard.astro`: delete the `#yard-stats` band, its count-up `<script>` and
the now-unused `stats` import. `data/proof.ts` is untouched — the homepage
`AboutTeaser` still uses those numbers.

### B4 — `/about` mission & vision → light

`pages/about.astro:141`, block `02`. Today it is two `bg-ink` panels on a
`gap-px` hairline grid, white on near-black.

Make it plain and light: no background, no card, no rounding — the two columns
sit on the page ground and are separated by a single vertical hairline
(`border-line`), stacking to a horizontal rule below `--breakpoint-nav`. Type
returns to the page's own colours: number in `faint`, heading in `ink`, body in
`muted`, and the vision closer keeps `brand` rather than `brand-bright`.

### B5 — `/about` "One point of contact" → `ClosingNote`

`pages/about.astro:222`. Today it is a `rounded-md bg-brand-tint` card with a
`brand`-coloured `--text-h3` heading. It becomes the **B2 `ClosingNote`** shape:
copy left, arrow link right, border-y hairlines, no fill and no rounding — the
same band the /services beat 4 uses.

Copy stays in `data/about.ts` (`onePointOfContact`).

> **Small decision, not a blocker.** That block has a title and a body but no
> link, and the shape wants its right-hand column filled. Default: add an arrow
> link to `/contact` reading "Talk to your contact". Say if it should render
> action-less instead — `ClosingNote` will take the action as an optional slot
> either way.

---

## C · `/industries` hub

### C1 — Decompose the page (238 lines of markup)

- `components/industries/IndustryTile.astro` — the staggered photo tile.
- `components/industries/CoverageMatrix.astro` — the table **and** its mobile
  chip-list fallback, one component, both renderings.
- `pages/industries/index.astro` keeps only data-binding.

### C2 — Fix the table scroll trap

The matrix container is `overflow-x-auto` + `data-lenis-prevent`.
`overflow-x: auto` forces `overflow-y: auto`, and `data-lenis-prevent` makes
Lenis stand down entirely — so a vertical wheel over the table dies there and
the page stops scrolling until the cursor is moved off by hand.

Fix: drop `data-lenis-prevent`, let Lenis's `allowNestedScroll` chain the
vertical delta to the page, and add `overscroll-behavior-x: contain` for the
horizontal end-stop.

Same bug, same fix, verified individually:

- the `/yard` fleet snap rail,
- the `IndexRail` mobile chip strip.

---

## D · Subpage banner redesign (hub pages only)

### D1 — New hub header component

Breadcrumb on top → wide `wrap-wide` photo panel (the `TrustStrip` card
treatment: rounded, dark ground, `ParallaxImage`, **no scrim, no text, no list
items**) → title + description **below** the image.

Applied to `/services`, `/industries`, `/yard`, `/about` — the four pages that
open with a banner today.

### D2 — Knock-on effects

- `data-next-theme` flips `glass` → `light`, so the header renders
  frosted-solid instead of transparent-over-photo (`scripts/themeFlip.ts`).
- The page top needs `pt-header-gap` now that light content sits under the
  fixed header.
- `ui/PageBanner.astro` stays exactly as it is for `/equipment/<slug>` and
  `/industries/<slug>`.

---

## E · Navigation

### E1 — Sub-menus for deep links

- `data/navigation.ts`: `NavLink` gains `children?: NavLink[]`.
- `layout/Header.astro` renders a dropdown panel for any item that has
  children — Equipment (12 categories, read from the `equipment` collection so
  it can't drift from `categories.json`), Services (6), Industries (8).
- Hover + focus + keyboard, closes on Escape and on route change.

### E2 — Mobile panel

- The same children as accordions inside the existing hamburger panel.
- The **"Get a quote" button moves into the panel** (full-width, at the
  bottom).
- **Assumption:** below 980px the bar then carries only the logo and the
  hamburger, since keeping the CTA in both places is redundant. Say so if it
  should stay in the bar as well.

---

## F · Quote request form

### F1 — Fix the success screen's recap list

`scripts/quote/form.ts:477` builds the recap rows with
`document.createElement`, so they never receive Astro's scoped-style class.
Every selector under `.q-success-recap` in `QuoteSuccess.astro` therefore
misses, and the recap renders as a flat unstyled stack of labels and values —
exactly what the screenshot shows.

Fix the same way `QuoteSummary` already does it: pre-render every slot in the
component (hidden), and let the script fill and unhide them. Same class of bug
as the one documented at the top of `TrustStrip.astro`.

### F2 — Redesign the success screen's head

The block above the recap — the `REQUEST SENT` eyebrow and `site.quotePromise`
set as a full-width mono uppercase `--text-h3` headline — is off-theme. Give it
a real heading, demote the promise to supporting copy, and bring the recap in
as a proper spec table.

> **Open question.** The two screenshots supplied for "submission UI looks
> weird" and "the section above the quote request doesn't match our theme"
> resolved to the same file, so this item is written from the visible evidence:
> the eyebrow + giant mono promise headline sitting above the `YOUR REQUEST`
> recap. If a different section was meant, re-send the screenshot.

### F3 — More room for the form

The dialog is already `--dlg-width: 1500px`, but the summary rail takes
`clamp(300px, 24%, 400px)` of it (`QuoteForm.astro:217`), which is what makes
the steps column feel narrow.

- **Dialog:** widen the panel and cap the rail at a fixed width (~320–360px)
  rather than a percentage, so every extra pixel goes to the form.
- **Inline (`/contact`):** pull the summary rail out into the **right outer
  margin**, outside the `.wrap` — the mirror of what `RailSections` does with
  the index rail on the left.

---

## G · Close-out

- `bun run check` — 0 errors.
- `bun run build`.
- `bun run format` before finishing, so the diff is only real changes.
- Browser pass over all affected pages at desktop / 980 / mobile.

---

## Build order

The two real bugs first, since they're independent of everything else and
block nothing:

**A5 → C2 → A (rail + rows) → D (banner) → B (sections) → C1 (decompose) →
E (nav) → F (quote form) → G.**

Each area is shown and confirmed before the next one starts — no speculative
full-page restyle.

---

## What the build changed

### The anchor bug was not what the plan guessed

The plan listed three suspects. It was none of them exactly. Lenis's own click
handler (`node_modules/lenis/dist/lenis.mjs`, `onClick`) starts an animated
`scrollTo` and **never calls `preventDefault()`**, so the browser's native jump
runs in the same tick and the two fight; measured, every rail click moved the
page exactly −104px regardless of which item was clicked, then snapped back on
the next frame.

Second half of the same bug: Lenis's `scrollTo` **already** subtracts both
`scroll-margin-top` and `scroll-padding-top`. The old `anchors: { offset: -104 }`
was therefore a third helping of the header gap on top of `scroll-padding-top`
on `<html>` and `scroll-mt-header-gap` on each section — 312px of offset for a
104px header.

Fixed in `scripts/scroll.ts`, which now owns the Lenis instance and every
same-page anchor on the site. The per-element `scroll-mt-header-gap` classes are
gone: `scroll-padding-top` on `<html>` is the single source of the offset and
both the native and the Lenis path read it.

### `position: sticky` is caged by its parent, twice over

Wrapping `IndexRail` in `RailSections`'s own `.rail-slot` div broke the sticky
rail in _both_ layouts, because sticky is constrained by its parent's box and
`IndexRail`'s root is shrink-to-fit — a 180px cage inside a 9000px column. The
slot is a single-cell grid at every width so the rail stretches, and
`display: contents` below 980px so the mobile chip strip pins to a tall block
container instead. Both are commented in the file; neither is obvious from
reading the markup.

### The rail can only leave the column on a wide screen

Geometry, not taste. With the content column pinned to the `.wrap` content box
(1136px) so it stays aligned with every other section on the page, the margin
beside it is `(100vw − 1136px) / 2` — and a readable rail plus its gap does not
fit in that below about 1520px. Above the threshold the rail sits in the margin
and the rows run the full 1136px; below it the rail comes back inside the
column, but on 140px + 32px instead of the old 180px + 72px, which still returns
80px to the content.

### Smaller deviations

- **`/contact` inline form:** moving the summary rail into the right margin
  would have needed a ~1930px viewport (the rail is 340px, not 140px). The band
  moved to `wrap-wide` instead — the steps column went from ~750px to 1108px at
  a 1512px viewport, which is what the item was actually for.
- **`QuoteSuccess.astro`** reported `ts(6196) 'Props' is declared but never
used` — the silent-breakage tell from CLAUDE.md — with
  `Object.entries(…) as [string, string][]` in its frontmatter. An explicit
  annotation types it identically and keeps the `Props` link. (`QuoteSummary`
  has the same assertion and does not warn, so the trigger is narrower than the
  keyword alone.)
- **The dialog** went to 1760px rather than "wider" in the abstract, and the
  summary rail is a fixed 340px column instead of `clamp(300px, 24%, 400px)` —
  at 24% every pixel added to the panel gave a quarter of itself straight back
  to the rail.
