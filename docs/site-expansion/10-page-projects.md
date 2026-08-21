# 10 — `/projects` (case studies)

**Phase 3. Gated. Do not build this yet.**

---

## The honest position

siteassist has four case studies with named clients (Taylor Woodrow/VINCI, M3
Motorway, HG Construction, BBV HS2 Area North), each with a detail page, a real
quote and a named project. That's why their homepage can carry a testimonial
band and a logo row — there's something behind it.

**Collins currently has none of that.** The three quotes in
`src/data/proof.ts` were written as placeholders (`03 §A5`), and the company
profile contains no client names, no project names and no client quotes.

Building `/projects` now means either leaving it empty or filling it with
invented work. Both are worse than not having the page — an empty case-studies
page is a visible admission, and an invented one is the kind of thing a
procurement officer can check.

---

## The gate — three things, then build

1. **Three real jobs**, each with: client or project name, sector, what was
   supplied (category + spec + duration), and the outcome.
2. **Written permission** to name each client. In UAE contracting this often
   needs the main contractor's sign-off, not just the site team's. If a client
   won't be named, an anonymised version still works — "a tier-one contractor on
   a Dubai infrastructure package" — but _only_ if the numbers are real.
3. **One quote from a named person with a job title.** "Site Manager,
   Construction, Dubai" is not attribution; it's the shape of attribution.

Two of three is enough to start. Zero of three is where we are.

---

## What to collect while you wait

The costly part isn't the page, it's the material. Ask operations to log these
against every significant job from now on — it takes two minutes at off-hire and
it's what makes this page possible in three months:

| Field            | Example                                       |
| ---------------- | --------------------------------------------- |
| Client / project | "M3 Smart Motorway package, Al Quoz"          |
| Sector           | Infrastructure                                |
| Supplied         | 4 × 500 kVA generators, 2 × 16m scissor lifts |
| Sale or hire     | Hire, 14 weeks                                |
| Mobilised in     | 6 hours from confirmation                     |
| The problem      | "Grid connection slipped three weeks"         |
| The outcome      | "Programme held; no downtime days recorded"   |
| Quote + name     | "…" — Name, Role, Company                     |
| Photos           | 3–5, on site, with permission                 |

The two numbers that matter most are **mobilisation time** and **downtime
avoided** — they're the ones the whole site's positioning rests on
("mobilisation is measured in hours, not weeks"), and right now nothing on the
site proves them.

---

## The layout, for when it's unblocked

The reference's case-study template is worth copying almost exactly, because it
is unusually restrained — no dashboard graphics, no invented percentages:

**Hub `/projects`:** banner → filter chips by sector (reuse `Pill.astro`) → a
grid of project cards (photo, sector label, project name, the one headline
number) → `PageCTA`.

**Detail `/projects/[slug]`:**

```
1  Banner            project photo · sector label · project name
2  Facts strip       client · sector · supplied · duration · mobilised in
3  Opening quote     one line, large, mono — the human summary
4  The problem       2–3 short paragraphs
5  What we supplied  the actual kit, linking to /equipment/<category>
6  The outcome       what changed, with the numbers
7  Pull quote        named attribution
8  Related           other projects in the same sector
9  CTA               shared PageCTA
```

Beat 2 is the one to get right — a hairline facts strip directly under the
banner, mono labels, so a reader who only scans gets the whole story in five
data points. The reference leads with a quote before the narrative and it works;
copy that ordering.

**Content collection**, not a data file — this is exactly what
`src/content/` is for, and it gives us the same Zod-validated schema safety the
equipment catalogue already has (`content.config.ts`).

---

## Meanwhile, on the homepage

Until this exists, the proof slot on the homepage is the **founder quote**
(`05 §7`) — real, named, and better copy than the placeholders. When two or
three case studies land:

1. Restore the rotating quote block with real client quotes.
2. Add a "Recent work" teaser section linking to `/projects`.
3. Move the founder quote to `/about`, where it belongs long-term.

## Files (when unblocked)

```
src/pages/projects/index.astro       new
src/pages/projects/[slug].astro      new
src/content/projects/*.json          new collection
src/content.config.ts                + projects schema
src/data/proof.ts                    testimonials → real, or delete the array
```

## Definition of done

- [ ] Zero invented clients, quotes, numbers or logos
- [ ] Every quote attributed to a named person with a role and company
- [ ] Every number checkable against a job record
- [ ] Minimum three projects before the page goes live
- [ ] `/ponytail-review` run on the diff — every finding applied, or a written reason it wasn't
