# 08 — `/industries` hub, and deepening the eight

**Phase 1.** No new content needed for the hub — `src/data/industries.ts`
already carries name, tagline, body, image and equipment list for all eight.
The hub is essentially free; it's the missing 30 lines that makes eight existing
pages reachable.

---

## Why the hub is the priority

`/industries/[slug]` generates eight pages today. There is **no `/industries`**.
The only route in is the homepage tile grid, and the breadcrumb on each of those
eight pages points _backwards to a homepage anchor_:

```astro
trail={[{ label: "Industries", href: "/#industries" }]}
```

So the eight pages have no parent, no hub, no sibling navigation, and no way for
a visitor on `/industries/marine-ports` to discover `/industries/oil-gas`
without going home first. That's the definition of an orphaned branch.

---

## Hub layout

Deliberately **different** from `/equipment` and `/services`, both of which use
the sticky-rail-plus-alternating-rows pattern. Three hubs with identical layouts
would make the site feel like a template. Industries is the one that should be
**photography-led**, because the sector photo communicates faster than the
sector name.

```
1  Banner       full-bleed · "Industries" · one sentence
2  Statement    one large line — the sector-agnostic claim
3  The eight    large photo tiles, 2-up on desktop, staggered vertical offset
4  Matrix       industry × equipment category — the page's real payload
5  CTA          shared PageCTA
```

### Beat 2 — statement

From `content.ts` → `industriesSection`, which is already good:

> **Wherever the work is, we're already there.**
> Eight sectors, one supplier — power, lifting, access and parts matched to how
> your industry actually works.

### Beat 3 — the eight, larger

Not the homepage's 4-up portrait grid at a bigger size — that would make the hub
feel like a duplicate of the homepage section. **2-up, landscape 16:10, with
alternating vertical offset** (`even:mt-[80px]`), so scrolling past reads as a
staggered column rather than a grid. Each tile carries:

```
┌───────────────────────────────────────┐
│  [photo, ParallaxImage shift 3%]      │
│                                       │
│  01                                   │
│  Construction                         │
│  Power, lifting and light for every   │
│  stage of the build.                  │
│  Generators · Tower lights · Forklifts│
│                                    →  │
└───────────────────────────────────────┘
```

The `tagline` and `equipment[]` fields already exist in the data and are
currently only used on the detail page. Surfacing them on the hub means a
visitor picks the right sector without a round trip.

**Motion:** parallax on the photos, `data-reveal` on each tile, and the arrow
chip pattern already in `Industries.astro` (translate-y + opacity on
group-hover) reused verbatim so the two grids feel related.

### Beat 4 — the matrix (the part worth building)

One hairline table, eight rows × the categories:

|                | Gens | Forklifts | Cranes | Compressors | Lights | Earthmoving | Access | Parts |
| -------------- | ---- | --------- | ------ | ----------- | ------ | ----------- | ------ | ----- |
| Construction   | ●    | ●         | ●      | ●           | ●      | ●           | ●      | ●     |
| Oil & gas      | ●    |           |        | ●           | ●      |             |        | ●     |
| Marine & ports | ●    | ●         | ●      |             |        |             |        | ●     |
| …              |      |           |        |             |        |             |        |       |

Every dot is a link to `/equipment/<category>`. This is the densest, most useful
thing the page can hold: it answers "do you cover me?" in one glance and it
generates 30+ internal links between two hubs.

It's also the sort of block the reference doesn't have and Collins should — a
plant supplier's credibility is in coverage, and a table proves coverage in a
way eight photo tiles can't.

Below 980px, the matrix becomes eight stacked chip rows (industry name + its
category pills, using the existing `Pill.astro`).

---

## Deepening `/industries/[slug]`

The eight detail pages are currently thin: banner, one paragraph, a "commonly
supplied" card, two buttons. Four additions, cheapest first:

1. **Fix the breadcrumb** → `/industries` (one line).
2. **Make "commonly supplied" real links.** Right now every item links to
   `/#equipment` regardless of what it is. Map `equipment[]` entries to actual
   category slugs so "Generators" goes to `/equipment/generators`. This needs a
   small data change: `equipment: string[]` → the category `id`s from
   `categories.json`, with the display name looked up from the collection. That
   also kills a class of typo — a bad slug fails the build instead of shipping a
   dead link.
3. **Add sibling navigation.** A "Other industries" strip at the foot — the
   other seven as small tiles. This is what turns eight orphans into a section.
4. **Add one duty block per industry** (~60 words): the specific thing this
   sector needs that others don't — continuous duty and dust for oil & gas,
   low-noise for events, container handling for ports. Some of this is already
   implied in `body`; pulling it out as a labelled block makes the page look
   like it was written for that reader.

Then the shared `PageCTA`.

---

## Files

```
src/pages/industries/index.astro          new
src/pages/industries/[slug].astro         edit — breadcrumb, real links, siblings
src/data/industries.ts                    edit — equipment[] → category ids, + matrix
src/components/sections/Industries.astro  edit — "View all" link (see 05 §6)
```

## Definition of done

- [ ] `/industries` exists and is linked from header, footer and homepage
- [ ] All eight detail pages breadcrumb to `/industries`
- [ ] No link on any industry page resolves to `/#equipment`
- [ ] Matrix dots all resolve to real category pages; a bad id fails `bun run build`
- [ ] Hub layout is visibly not a copy of `/equipment` or `/services`
- [ ] `/ponytail-review` run on the diff — every finding applied, or a written reason it wasn't
