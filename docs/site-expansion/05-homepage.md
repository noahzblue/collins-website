# 05 — Homepage updates

The homepage's job changes. Right now it is **the whole site** — six sections
trying to be six pages. After `06`–`11` it becomes **a table of contents with
photography**: every section makes one claim, shows one proof, and hands off to
the page that goes deep.

That reframing is what unlocks the reference's rhythm. siteassist's homepage
sections are short precisely because `/platform` and `/solutions` exist.

---

## Section order — before and after

| #   | Now                        | After                          | Why                                                   |
| --- | -------------------------- | ------------------------------ | ----------------------------------------------------- |
| 1   | Hero                       | Hero                           | copy edit only (sales-first)                          |
| 2   | TrustStrip — Why Collins   | TrustStrip                     | ✅ already updated; add progress bar + scroll gate    |
| 3   | —                          | **Sales or hire — new**        | the profile's core positioning is nowhere on the site |
| 4   | ProductGrid (6 of 12)      | ProductGrid                    | unchanged, minor intro edit                           |
| 5   | Services (3, accordion)    | **Services (6, FollowerList)** | two revenue lines are currently invisible             |
| 6   | Industries (8 tiles)       | Industries                     | add "View all" → new `/industries` hub                |
| 7   | Testimonials (placeholder) | **Founder quote**              | integrity — see `03 §A5`                              |
| 8   | AboutTeaser                | AboutTeaser                    | real stats; link to `/about`; dead `href: "#"` fixed  |
| 9   | ContactCTA                 | ContactCTA                     | three numbers, Mon–Sat, better form label             |

Nine sections. One added, one replaced, seven edited.

---

## The theme rhythm (do this once, feel it everywhere)

Per `02 §Primitive 1`, give every section a `data-next-theme`. The page should
breathe dark → light → dark rather than running one flat white:

```
1 Hero            dark  (photo)
2 Why Collins     light      ← statement + the dark photo card inside it
3 Sales or hire   dark       ← NEW, full-bleed; the tonal anchor mid-page
4 Equipment       light (surface / gray)
5 Services        light
6 Industries      light (surface)
7 Founder quote   dark       ← short, high-contrast, breaks up the light run
8 About           light
9 Contact         light (surface)
```

Two dark bands in the body, evenly spaced, each carrying one big statement. The
header inverts across each boundary automatically.

---

## 1. Hero — `sections/Hero.astro`

**Keep:** the video/still fallback, the three-layer blur ramp, the load
choreography (`.reveal-1`…`.reveal-5`), the coordinates + marquee base panel,
the pulsing status dot. This section is already at the level of the reference —
arguably past it.

**Change — copy only, in `data/content.ts` → `hero`:**

| Field     | Now                                                                                                                   | Proposed                                                                                                                          | Source                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `title`   | "Excellence in **industrial & heavy machinery** rental and sales."                                                    | "Heavy equipment, power and transport — **for sale and for hire.**"                                                               | profile p.1 cover, verbatim                        |
| `sub`     | "Reliable, top quality branded equipment generators, forklifts…" _(note: contains a double space and a missing dash)_ | "Generators to 1,250 kVA, forklifts, cranes and compressors — supplied outright or on hire from our Sajjah yard, across the UAE." | p.2 + p.8                                          |
| `eyebrow` | "Industrial & Heavy Machinery · Sales & Rental · UAE"                                                                 | "Sales & Rental · Dubai & Sharjah · UAE"                                                                                          | shorter; sales first                               |
| `ctas[1]` | "Explore equipment" → `/#equipment`                                                                                   | → `/equipment`                                                                                                                    | stop bouncing to an anchor when a real page exists |

Two reasons the title change matters beyond word order: it puts **sales first**
per `03 §A6`, and it drops "Excellence in", which is the one phrase on the page
that could belong to any company in the trade.

**Fix while you're in there:** `hero.sub` currently reads
`"...branded equipment  generators, forklifts..."` — two spaces where an em dash
was meant to be.

---

## 2. Why Collins — `sections/TrustStrip.astro`

Content is **already correct** (Readiness / Reliability / Accountability / Fair
Dealing, from profile p.3 — see `trust-strip-content-update.md`). Two motion
changes only, both from `02 §Primitive 4`:

- **Progress bar as the timer.** `.bar-fill` already exists per tab. Drive it
  from the rotator's clock (`onProgress`) instead of a CSS transition, so hover
  freezes the fill mid-travel and the switch can't drift from the bar.
- **Start on scroll, not on load.** Today the 6s timer starts at page load — a
  visitor who reads the hero for 20 seconds arrives at tab 3. Gate `select(0)`
  behind an IntersectionObserver at `threshold: 0.35`.

Optional third: the `#why-num` counter (`01`→`04`) currently swaps instantly.
Roll it like an odometer — clip the digit, translate the outgoing up and the
incoming in from below. ~10 lines of CSS, and it's the kind of detail the
reference spends its whole budget on.

---

## 3. Sales or hire — **new section**

**Why it exists:** the profile's clearest statement of what the company is —

> **SALES — our main business.** Supplied outright and commissioned.
> **RENTAL — the same fleet.** Day, week, month or project.

— appears nowhere on the site. Worse, the site's own hero currently implies the
opposite order. This is the highest-value new block on the homepage.

**Layout — a two-panel split on a dark full-bleed band:**

```
┌──────────────────────────────────────────────────────────────┐
│  eyebrow: How we supply                                      │
│  h2: Buy it, or hire the same machine.                       │
│                                                              │
│  ┌── 01 ─────────────────┐  ┌── 02 ─────────────────┐        │
│  │ SALES                 │  │ RENTAL                │        │
│  │ Our main business     │  │ The same fleet        │        │
│  │                       │  │                       │        │
│  │ Supplied outright,    │  │ Day, week, month or   │        │
│  │ sourced direct from   │  │ project duration —    │        │
│  │ manufacturers and     │  │ delivery and          │        │
│  │ authorised            │  │ collection included   │        │
│  │ distributors, handed  │  │ in the rate.          │        │
│  │ over commissioned,    │  │                       │        │
│  │ documented and ready  │  │ → Hire terms          │        │
│  │ to work.              │  │                       │        │
│  │ → Buy outright        │  │                       │        │
│  └───────────────────────┘  └───────────────────────┘        │
│                                                              │
│  ── hairline ────────────────────────────────────────────    │
│  "Move from a trial hire to a purchase, or straight to a     │
│   purchase, without changing supplier, paperwork or point    │
│   of contact."                            — profile p.8      │
└──────────────────────────────────────────────────────────────┘
```

**Motion:** the two panels reveal with a **60ms stagger** (`data-reveal
data-reveal-stagger`), and — the one flourish worth building — on hover, the
non-hovered panel drops to `opacity: .55` and its border fades, so the page
_chooses_ as you point at it. 150ms, `--ease-out-expo`. Pure CSS via
`.panel:hover ~ .panel` plus `:has()` for the reverse direction.

**Component:** `sections/SalesOrHire.astro`. Copy into `data/content.ts` as a new
`supplyModes` export. Behind the two panels, one full-bleed
`<ParallaxImage>` of the yard at ~8% opacity keeps the dark band from being flat.

---

## 4. Equipment — `sections/ProductGrid.astro`

Structurally fine. The card grid, the catalogue-position numbering (01, 02, 03,
05, 09, 10 — matching the hub rather than renumbering 01–06) and the "View all
12" link are all right.

**One copy swap** in `data/content.ts` → `fleet.intro`. The profile's own line
(p.5) is stronger than what's there because it says what "supplied" _includes_:

> "Sourced direct from manufacturers and authorised distributors, supplied with
> commissioning, operator handover and parts support — to buy outright or to
> hire. Six of the twelve categories below."

**One motion addition:** `data-reveal data-reveal-stagger` on the grid, 60ms
apart. Six cards appearing as a wave is the cheapest possible upgrade here.

---

## 5. Services — `sections/Services.astro` → **rebuild**

**The gap:** `data/services.ts` holds three services. The profile lists **six**
(p.7). "Transport & Haulage" and "Maintenance & Spares" — two real revenue
lines — do not appear anywhere on the website. And the current first item,
"General trading & rental", merges sales and rental into one item, which is
exactly the distinction `§3` above exists to draw.

**Content:** replace `services.ts` wholesale with the six from `03 §p.7`,
verbatim. Add `slug` to each for the phase-2 detail pages. Full data shape in
`07`.

**Layout:** the current 3-row accordion + photo panel does not scale to six —
six accordion rows is a tall, dull column. Switch to `ui/FollowerList.astro`
(`02 §Primitive 5`), the reference's numbered-list-with-one-shared-image pattern:

```
01  Equipment sales          ┌────────────────────┐
02  Equipment rental         │                    │
03  Sourcing & procurement   │   one image panel  │
04  Transport & haulage      │   crossfading on   │
05  Maintenance & spares     │   row hover/focus  │
06  Logistics & export       └────────────────────┘
                             View all services →
```

Six rows fit in roughly the height the three-row accordion takes now, and every
row links to `/services#<slug>` (or `/services/<slug>` in phase 2). The floating
mini data-card over the photo (`stat.title` / `stat.line`) is a good detail —
keep it, one per service.

---

## 6. Industries — `sections/Industries.astro`

Keep the 8-tile portrait grid; it's the right treatment. Three changes:

- **Add a "View all industries →" link** under the grid, matching the equipment
  section's pattern, pointing at the new `/industries` hub (`08`).
- **Stagger the reveal** — but by **column**, not by index, so the wave travels
  left-to-right rather than wrapping. `--i` custom property per tile.
- **Wrap the tile photos in `<ParallaxImage>`.** They currently use `BgImage`
  with a hover scale. Parallax on eight portrait tiles is the single strongest
  place on the page for it — but set `shift="2%"`, `zoom={1.06}`: eight drifting
  images at the default 3%/1.12 will read as noise.

---

## 7. Testimonials → **Founder quote**

**The problem** (`03 §A5`): three quotes attributed to "Site Manager ·
Construction · Dubai", "Operations Lead · Logistics · Sharjah", "Procurement
Head · Facilities · Abu Dhabi", each with a 5-star rating. They are marked
placeholder in `proof.ts`, but nothing on the rendered page says so. A visitor
reads them as three real customers.

**The fix, now:** replace the rotating slider with **one** quote — the Managing
Director's, from p.3. It's real, it's attributed to a named person with a title,
and it's better copy than any of the three placeholders:

> "We would rather turn down a job than send out a machine we have not checked
> ourselves. **That is the whole business in one sentence.** The rest is
> logistics."
> **Rohan Robert** — Managing Director

**Treatment:** dark full-bleed band, quote at `text-h2` in `--font-mono` (the
reference sets `.quote-text` in Geist Mono — we already have the same role
split), the emphasised clause in `text-brand-bright`, name in mono caps beneath.
One `<ParallaxImage>` of the yard behind at low opacity. No stars, no dots, no
rotation — **a single quote that doesn't move reads as more confident than three
that do.**

**Later:** when real client quotes exist, restore the rotator and put the MD
quote on `/about` instead. Keep `Testimonials.astro` in the repo; don't delete
the rotation logic.

**Do not** keep the placeholder quotes behind a "coming soon" or soften them
with "representative" — remove them.

---

## 8. About teaser — `sections/AboutTeaser.astro`

**Content fixes:**

- `stats` → the profile's four (`03 §A4`): `1` yard · `12` categories · `7`
  emirates served · `1,250 kVA` max output. Note this makes it **four** stats,
  not three — the band is `grid-cols-3`; move to `grid-cols-4` /
  `max-nav:grid-cols-2`. The count-up animation still works: `parseStat`
  already splits `"1250"` from `" kVA"`, but **add thousands formatting** so it
  renders `1,250` not `1250`.
- `aboutSection.cta.href` is `"#"` — a dead link shipped on the homepage. Point
  it at `/about`.
- `office.hours` "Mon–Fri, 8:00am–6:30pm" → **Mon–Sat** (`03 §A1`).
- `aboutSection.body` → use the mission line from p.3, which says something
  specific ("keep them running long after the invoice is settled") where the
  current copy says "where innovation meets execution", which says nothing.

**Add:** a second address row for the **yard** — the head-office strip currently
implies Collins is a Dubai office. The yard in Sajjah is the operational story
and it belongs on the homepage, even as one line: `Yard — Sajjah, Sharjah`.

---

## 9. Contact CTA — `sections/ContactCTA.astro`

Structure is good (methods column + form, WhatsApp-backed submit). Content:

- **Three phone numbers, not one** (`03 §A2`). The "Call us" method row becomes
  three stacked `tel:` links, or one row that expands.
- **Form label** → the profile's line, which tells people what to type:
  > "Send us the machine, the duty and the dates — or just describe the job and
  > we'll specify it for you."
- **Add the same-working-day promise** under the submit button: "Quotations are
  issued the same working day wherever possible." This is a real commitment from
  the profile and it's the single best thing that could sit next to a submit
  button.
- **Hours** → Mon–Sat.
- **"Visit" method** should offer both pins — office and yard.

---

## Definition of done

- [ ] `bun run check` → 0 errors, `bun run build` passes, `bun run format` run
- [ ] No `href="#"` anywhere on the homepage
- [ ] No unattributed or placeholder quote renders
- [ ] Every section links to its own page — homepage is a teaser, not a terminus
- [ ] Every rotating panel starts when it's on screen, not on load
- [ ] Full pass at 375px: nine sections, no horizontal scroll, `FollowerList`
      degraded to a plain list
- [ ] `prefers-reduced-motion: reduce` — everything still readable, nothing hidden
- [ ] `/ponytail-review` run on the diff — every finding applied, or a written reason it wasn't
