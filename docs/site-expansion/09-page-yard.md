# 09 — `/yard`

**Phase 2 — blocked on photography.** Every word of this page already exists
(profile p.6 + p.8). What it doesn't have is images, and this is the one page on
the site where the images _are_ the argument.

---

## Why this page earns its place

Everything else on the site is claims a competitor could also make. This page is
the only one that says **where the machines physically are, what happens to them
before dispatch, and how fast they leave** — which is what a site manager on a
tight programme is actually buying.

The profile gives it a full spread and a heading better than anything we'd
write:

> ## One Yard. Ready Stock.
>
> **YARD: SAJJAH, SHARJAH, U.A.E.**

**If yard photography isn't coming**, don't build it as a page — fold p.8's five
points into `/about` as a sixth section and keep the `/yard` route for later.
A page about a physical place, illustrated with renders or stock, actively
damages the claim it's making.

---

## Layout

```
1  Banner        full-bleed wide shot of the yard · "One yard. Ready stock."
2  Stat strip    1 yard · 12 categories · 7 emirates · 1,250 kVA
3  The five      pinned image, five points scroll past it
4  Gallery       the four fleet groups (profile p.6)
5  Mobilisation  a timeline: enquiry → quote → inspection → dispatch
6  CTA           shared PageCTA
```

## 2. Stat strip

The four real numbers from p.8, replacing the placeholders site-wide
(`03 §A4`). Same count-up treatment as `AboutTeaser`'s `stat-band` — but here
they sit **directly under the banner**, over the photo's bottom edge, in mono,
hairline-divided.

```
        1                12               7               1,250
   YARD, SAJJAH    EQUIPMENT       EMIRATES         KVA MAX
   SHARJAH         CATEGORIES      SERVED           GENERATOR OUTPUT
```

## 3. The five points — the page's core interaction

This is where the reference's **sticky media** pattern (`01 §1.5`) does its best
work on this site. One yard photograph pins on the left; the five points scroll
past it on the right; the photo **crossfades to a different detail shot as each
point becomes active** — a wide yard shot for "everything under one roof", a
workshop shot for "inspected before dispatch", a loaded flatbed for "fast
mobilisation".

Five images, one slot, driven by the same IntersectionObserver the index rail
already uses. Copy verbatim from p.8:

| #   | Point                      | Image needed                      |
| --- | -------------------------- | --------------------------------- |
| 01  | Everything under one roof. | wide yard, mixed plant visible    |
| 02  | Inspected before dispatch. | workshop / engineer with a unit   |
| 03  | Fast mobilisation.         | loaded flatbed leaving the gate   |
| 04  | Buy outright or hire.      | handover / paperwork, or a lineup |
| 05  | Support after handover.    | parts shelving or a service van   |

**Reduced motion:** the pin still holds (it's `position: sticky`, not an
animation), the crossfade becomes an instant swap.

## 4. Fleet gallery

The four groups from p.6, with their ranges:

`01 Generators 10 kVA – 1,250 kVA` · `02 Forklifts 1.4 – 15 ton` ·
`03 Air compressors 135 – 1,050 CFM` · `04 Cranes & plant — telehandlers,
excavators, skid steers`

Intro, verbatim:

> A look at the fleet leaving the Sajjah yard — the same units supplied outright
> or made available on hire, every one Collins branded and inspected before
> dispatch.

**Treatment:** a horizontal scroll rail on desktop (snap points, mono captions
under each frame, no arrows — the overflow itself is the affordance), stacking
to a column on mobile. Each group links to its `/equipment/<category>` page(s),
so the gallery feeds the catalogue instead of dead-ending.

Photo count: **8–12 minimum**, ideally 16. Fewer than eight and it isn't a
gallery, it's four pictures.

## 5. Mobilisation timeline

Not in the profile — but it's the obvious synthesis of p.8 + p.9's same-working-
day promise, and it's what turns the page from "we have a yard" into "here's
what happens when you call".

```
01 ENQUIRY          02 QUOTE            03 INSPECTION      04 DISPATCH
you send the        issued the same     serviced, fuelled  loaded, delivered,
machine, duty       working day         and function       signed condition
and dates           wherever possible   tested             report on handover
```

Four steps, mono numbers, a hairline connecting rule, each step revealing 80ms
after the last. **Needs sign-off on the timings** — don't publish a promise
operations hasn't agreed to.

---

## Photography brief

Per the house grade already in use (slate-blue dawn haze). All shot at the
Sajjah yard, ideally one morning:

- 1 × wide establishing shot, landscape, for the banner — mixed plant, some sky
- 5 × the point images in §3 above
- 8–16 × fleet frames for §4 — one per unit type, consistent distance and angle
- 2 × workshop / condition-report detail, close
- 1 × loaded flatbed at the gate

Consistent time of day matters more than count. Sixteen frames shot across three
different lighting conditions will look worse than eight shot in one hour.

---

## Files

```
src/pages/yard.astro                new
src/data/yard.ts                    new — the five points, gallery groups, timeline
src/components/ui/StickyPoints.astro new — pinned media + scroll-linked points
public/images/yard/*.jpg            THE BLOCKER
src/config/site.ts                  + yard address as a first-class field
```

## Definition of done

- [ ] Real yard photography only — no renders, no stock, no AI fill
- [ ] Stats match `03 §A4` and match `/about` and the homepage exactly
- [ ] Gallery links into `/equipment/*`
- [ ] Timeline timings signed off by operations
- [ ] Sticky column works at 980px and degrades cleanly below it
- [ ] `/ponytail-review` run on the diff — every finding applied, or a written reason it wasn't
