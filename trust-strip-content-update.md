# Trust strip — content update from the company profile

**Source:** `collins business profil.pdf`, **slide 3** — _"What drives us — Mission, Vision & Values"_.
**Target:** the "Why Collins" section (`src/components/sections/TrustStrip.astro`, `#why-collins`),
which is the 2nd block on the homepage, directly under the hero.

Data lives in two files:

- `src/data/content.ts` → `trust` (eyebrow, statement, cardTitle)
- `src/data/proof.ts` → `trustFeatures` (the four tabs)

No component changes are required. Everything below is a data edit.

---

## 1. Why this section needs to change

The strip currently sells **capabilities** — brands, rental terms, range, delivery speed.
Three of those four claims are already made better elsewhere on the same page:

| Current tab                 | Says                              | Already covered by                             |
| --------------------------- | --------------------------------- | ---------------------------------------------- |
| Top international brands    | Perkins, Cummins, JCB…            | the hero partner wordmark strip (`partners`)   |
| Flexible sales & rental     | buy or rent, day/week/month       | `servicesSection` + `services.ts`              |
| Wide equipment range        | generators → cranes, one supplier | `fleet` / the 12-category grid right below     |
| Fast delivery & ready stock | dispatched within hours           | _not duplicated — this one is doing real work_ |

So the section immediately after the hero spends its whole height repeating the three
sections that follow it. The profile's values slide fixes this: **Readiness, Reliability,
Accountability, Fair Dealing** are claims about _how Collins behaves_, which nothing else
on the page makes. That gives the strip a job no other section is doing.

It also lands in the right slot. The page currently runs _hero → what we sell → what we
sell → what we do → who we serve_. Putting values at position 2 turns it into
_hero → why trust us → what we sell → …_, which is the order the rest of the page
was already built for.

### A detail already in place

The card renders a mono counter (`#why-num`) that ticks `01 → 04` as the tabs rotate.
The profile numbers these exact four values `01`–`04` in the same order. The existing
component matches the source document with no changes — keep the order below as written.

---

## 2. Eyebrow — yes, it needs to change

**Current:** `trust.eyebrow: "What we do"` → **change it.** Two separate problems:

1. **It collides with a heading further down the page.** `servicesSection.title` is
   literally `["What we do", "beyond the sale."]`. So "What we do" appears as an eyebrow
   at section 2 and again as an `<h2>` at section 4. Two different sections, same label.
2. **It doesn't describe the section.** The block is `#why-collins` and holds proof
   points, not a description of the business. The eyebrow has been mislabelling it even
   before this content change — with values in there it is plainly wrong.

**Recommended:** `"What drives us"` — the profile's own kicker for this slide. It reads as
values rather than services, and it collides with nothing on the page.

Alternatives if that reads too soft:

| Option             | Note                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| `"What drives us"` | **recommended** — straight from the source slide                                   |
| `"Why Collins"`    | plainest, matches the section id, but competes with `"About Collins"` at section 7 |
| `"How we work"`    | good, though it leans process rather than values                                   |
| `"Our values"`     | accurate but flat, and the four titles already say it                              |

### The other eyebrows are fine

Full homepage sequence, checked for collisions:

```
Hero          Industrial & Heavy Machinery · Sales & Rental · UAE
TrustStrip    What we do        ← only problem; → "What drives us"
ProductGrid   Equipment
Services      Services
Industries    Industries
Testimonials  Case studies
AboutTeaser   About Collins
ContactCTA    Get in touch
```

`fleet` and `equipmentHub` both use `"Equipment"`, but they never appear on the same page
(homepage grid vs. the `/equipment` hub), so that repeat is fine — leave it.

---

## 3. The statement line

**Current:**

```ts
statement: "We Offer Expert Equipment Sourcing and Global Export Solutions",
```

Change it. Three reasons: it's Title Case where the rest of the site is sentence case;
it claims sourcing and export, which belong to the Services section; and it's left over
from the old "What we do" framing, so it won't survive the eyebrow change.

**Recommended** — the profile's vision statement, tightened to one line:

```ts
statement: "The first call in the Emirates for equipment that has to work on the day it arrives.",
```

Alternative, closer to the MD's own words on the same slide:

```ts
statement: "We would rather turn down a job than send out a machine we haven't checked ourselves.",
```

That second one is the strongest sentence in the whole document, but it's a quote — if you
use it here it can't also be used in the testimonials band. Worth deciding deliberately.

`cardTitle: ["Built to keep", "your site moving."]` still works under either. No change needed.

---

## 4. The four tabs

Two versions. **Version A** is the profile copy verbatim. **Version B** keeps each value's
first line intact and adds one concrete clause — because the tab card reveals only the
active description, and at 15 words the panel collapses to a lot of empty space next to a
620px-tall photo. Version B is the recommendation; Version A is there if you want to stay
literal to the printed profile.

### Version A — verbatim from slide 3

```ts
export const trustFeatures: Feature[] = [
  {
    icon: "clock",
    title: "Readiness",
    body: "Serviced, fuelled and load tested stock in the yard, so mobilisation is measured in hours, not weeks.",
    image: "/images/why-readiness.jpg",
  },
  {
    icon: "award",
    title: "Reliability",
    body: "Branded units from established manufacturers, maintained on schedule and documented.",
    image: "/images/why-reliability.jpg",
  },
  {
    icon: "phone",
    title: "Accountability",
    body: "One named contact from enquiry to off hire. Breakdowns are ours to fix, not yours to chase.",
    image: "/images/why-accountability.jpg",
  },
  {
    icon: "tag",
    title: "Fair dealing",
    body: "Clear rates, honest condition reports and no charges that were not on the agreement.",
    image: "/images/why-fair-dealing.jpg",
  },
];
```

### Version B — recommended, each with one supporting clause

```ts
export const trustFeatures: Feature[] = [
  {
    icon: "clock",
    title: "Readiness",
    body: "Serviced, fuelled and load tested stock standing in the Sajjah yard. Mobilisation is measured in hours, not weeks — most units leave the same day they're confirmed.",
    image: "/images/why-readiness.jpg",
  },
  {
    icon: "award",
    title: "Reliability",
    body: "Branded units from established manufacturers, maintained on schedule and documented. Every machine is function tested and handed over with a signed condition report.",
    image: "/images/why-reliability.jpg",
  },
  {
    icon: "phone",
    title: "Accountability",
    body: "One named contact from enquiry to off hire — you won't be passed between departments mid-project. Breakdowns are ours to fix, not yours to chase.",
    image: "/images/why-accountability.jpg",
  },
  {
    icon: "tag",
    title: "Fair dealing",
    body: "Clear rates, honest condition reports and no charges that were not on the agreement. Quotations are issued the same working day wherever possible.",
    image: "/images/why-fair-dealing.jpg",
  },
];
```

Every supporting clause is drawn from the profile, not invented:
same-day dispatch and the signed condition report from slide 8 ("One Yard. Ready Stock."),
the no-department-handoff line from slide 4 ("One point of contact"), and the same-day
quotation from slide 9.

### Casing note

The profile prints these as **Fair Dealing**. The site's tab titles are sentence case
(`"Top international brands"`, `"Fast delivery & ready stock"`), so the block above uses
**Fair dealing**. The other three are single words and unaffected. Change it to
`"Fair Dealing"` only if you want to match the printed document exactly.

### Icons

`clock`, `award`, `phone` and `tag` all already exist in `src/components/ui/icons.ts` —
**no new icons needed.** `award` and `tag` carry over from the current set; `layers` and
`truck` drop out of this section (both still used elsewhere, so don't delete them).

One judgement call: `tag` for Fair dealing keys off "clear rates". If you'd rather stress
the honesty of the condition report than the pricing, `check` is the better glyph and is
also already present.

> Note: `Feature.icon` is typed and the section currently never renders it — `TrustStrip.astro`
> uses the title/body/image only. The icons matter if this data is ever reused elsewhere;
> they change nothing visually today.

---

## 5. Images

The four current photos are shot to the old tab meanings (a brand engine bay, a rental
scene, a range shot, a delivery truck) and don't match the new values. Four replacements
have been generated in the existing house grade — slate-blue dawn haze, flat overcast
light, small warm sodium accents, wet ground, no legible branding — and are **already
installed in `public/images/`** at 2000×1116, matching the existing files exactly.

| Tab            | New file                 | Shows                                                                 |
| -------------- | ------------------------ | --------------------------------------------------------------------- |
| Readiness      | `why-readiness.jpg`      | a row of generator canopies on load-bank test in the yard at dawn     |
| Reliability    | `why-reliability.jpg`    | workshop bay, engine service in progress, checklist on the frame rail |
| Accountability | `why-accountability.jpg` | one engineer on radio beside a machine on site, response truck behind |
| Fair dealing   | `why-fair-dealing.jpg`   | condition report and keys on the tailgate at the yard gate            |

The old `why-brands / why-rental / why-range / why-delivery` files are referenced only by
`trustFeatures`, so they become unused once this lands.

---

## 6. Summary of edits

**`src/data/content.ts`** — the `trust` object:

```ts
export const trust = {
  eyebrow: "What drives us",
  statement:
    "The first call in the Emirates for equipment that has to work on the day it arrives.",
  /** Constant headline over the photo card; tabs swap image + copy below it. */
  cardTitle: ["Built to keep", "your site moving."],
};
```

**`src/data/proof.ts`** — replace `trustFeatures` with Version B above.

**`public/images/`** — add the four new files; the four `why-*` originals become unused.

**No changes to** `TrustStrip.astro`, `icons.ts`, or any other section.

---

## 7. Two things spotted in the profile, out of scope here

Noting these rather than acting on them:

- **Stats are still unverified, and the profile offers better ones.** `src/data/proof.ts`
  flags its `stats` as _"placeholder — confirm figures"_: `15+` years, `500+` machines,
  `24h` quote turnaround. The profile does **not** confirm the first two — it gives a
  different, sourced set on slide 8: `1` yard (Sajjah, Sharjah), `12` equipment categories,
  `7` emirates served, `1250 KVA` max generator output. Only `24h` is supported
  (slide 9: _"Quotations are issued the same working day wherever possible"_).
  Swapping in the slide-8 figures would retire the placeholder warning.

- **Working hours are wrong in two places.** Slide 9 says **Monday to Saturday**,
  8:00am–6:30pm. Both of these say Mon–Fri and need updating:
  - `src/config/site.ts:43` → `hours: "Mon–Fri 8:00–6:30"` _(the source of truth)_
  - `src/data/content.ts` → `aboutSection.office.hours: "Mon–Fri, 8:00am–6:30pm"`
    _(a second hardcoded copy — arguably should read from `site.ts` instead)_
