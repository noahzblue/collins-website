# Collins site expansion — overview

_Written 2026-08-21. Sources: a live audit of siteassist.com (home, /platform,
/solutions, /about, /case-studies + their raw markup), and
`collins business profil.pdf` (9 pages, extracted in full — see `03`)._

---

## The problem in one paragraph

The site has **three real pages** (`/`, `/equipment`, `/equipment/[slug]`) plus a
detail route with no hub (`/industries/[slug]`). Everything else the header
promises — Services, Industries, About, Contact — is an **anchor into the
homepage**. So the homepage is carrying six jobs at once, each in a ~600px
slot, and none of them can go deep. Meanwhile the company profile contains
roughly **four pages' worth of material that is nowhere on the site**: six
services (the site shows three, and they're the wrong three), five named
leaders, a licensed-activities list, a yard story, real stats, a real founder
quote, and the fact that **sales — not rental — is the core business**.

The equipment slice is the proof that this codebase can do depth well. The rest
of the site hasn't been given the same treatment yet.

---

## Page map — before and after

| Route                | Now                                        | After                                                          |
| -------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| `/`                  | 8 sections doing 6 jobs                    | 9 sections, each a **teaser that links out**                   |
| `/equipment`         | ✅ hub, 12 rows + sticky rail              | unchanged                                                      |
| `/equipment/[slug]`  | ✅ 12 category pages                       | unchanged                                                      |
| `/industries`        | ❌ **missing** (detail pages are orphaned) | **new** — hub for the 8                                        |
| `/industries/[slug]` | ✅ thin (banner + 2 blocks)                | deepened                                                       |
| `/services`          | ❌ `/#services` anchor                     | **new** — the **six** capabilities                             |
| `/services/[slug]`   | ❌                                         | **new**, phase 2 — 6 detail pages                              |
| `/about`             | ❌ `/#about` anchor                        | **new** — who we are, mission, values, leadership, credentials |
| `/yard`              | ❌                                         | **new**, phase 2 — "One yard. Ready stock." + fleet gallery    |
| `/projects`          | ❌                                         | **new**, phase 3 — **blocked on real content**                 |
| `/contact`           | ❌ `/#contact` anchor                      | **new** — 3 numbers, 2 locations, hours, map, form             |

---

## The fourteen documents

Read in this order. Each one stands alone and can be actioned on its own.

| #   | File                               | What it settles                                                                                            |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 00  | this file                          | the plan, the phasing, what blocks what                                                                    |
| 01  | `01-design-language-siteassist.md` | **what siteassist actually does** — 12 techniques, decoded from their source, and which are worth stealing |
| 02  | `02-motion-system.md`              | the shared primitives to build in `src/scripts/` + `src/components/ui/` so pages 05–11 can just use them   |
| 03  | `03-content-source-profile.md`     | **every fact in the PDF**, plus the 6 places the live site currently contradicts it                        |
| 04  | `04-information-architecture.md`   | nav, footer, breadcrumbs, URLs, SEO titles                                                                 |
| 05  | `05-homepage.md`                   | section-by-section homepage changes                                                                        |
| 06  | `06-page-about.md`                 | `/about` — layout, copy, motion                                                                            |
| 07  | `07-page-services.md`              | `/services` (+ detail pages)                                                                               |
| 08  | `08-page-industries.md`            | `/industries` hub + deepening the 8 detail pages                                                           |
| 09  | `09-page-yard.md`                  | `/yard` — the operations proof page                                                                        |
| 10  | `10-page-projects.md`              | `/projects` — and why it's gated                                                                           |
| 11  | `11-page-contact.md`               | `/contact`                                                                                                 |
| 12  | `12-onboarding-sequence.md`        | the **logo intro** decoded from the Figma storyboard — geometry, timeline, and its Core Web Vitals cost    |
| 13  | `13-page-transitions.md`           | the **blue veil** on every navigation + the arrival reveal, and the motion tokens both of them use         |

---

## Phasing

**Phase 0 — corrections (do first, ~1 hour, no new pages).**
The site currently states opening hours that are wrong, a legal name that isn't
the licensed one, one phone number out of three, and three testimonials that
were written as placeholders and read as real client quotes. All of that is in
`03`. None of it depends on any design work.

**Phase 1 — the motion system + the three pages that have all their content.**
`02` (primitives) → `/about` → `/services` → `/industries` hub. Everything these
three pages need is already in the profile PDF. No new photography, no new
copywriting, no client sign-off.

**Phase 2 — the pages that need assets.**
`/yard` needs yard photography (the profile's gallery spread is 4 image groups).
`/contact` needs a map embed decision and a form backend decision.
`/services/[slug]` needs ~250 words per service beyond what the profile gives.

**Phase 3 — `/projects`.**
Blocked. Needs at least three real, named, permission-cleared jobs. See `10`.

---

## How we build these — `/ponytail` on every coding task

The failure mode for a plan this size isn't wrong code, it's **too much of it**.
Twelve documents describing new pages is exactly the setup that produces a
generic wrapper component nobody needed, a config object with one caller, an
abstraction built for a second use case that never arrives, and three helpers
where one line would have done. That's the slop to keep out.

So the rule for executing any part of `05`–`11`:

| When                       | Command            | What it does                                                                                                                                                                                                                                      |
| -------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Before writing code**    | `/ponytail`        | forces the laziest solution that actually works — asks whether the thing needs to exist at all (YAGNI), reaches for the platform before a helper, one line before fifty. `full` is the default; use `ultra` for anything that looks like plumbing |
| **Before calling it done** | `/ponytail-review` | reviews the diff **only** for over-engineering: reinvented stdlib, speculative abstraction, dead flexibility. One line per finding                                                                                                                |
| **After each phase**       | `/ponytail-audit`  | whole-repo scan — a ranked list of what to delete                                                                                                                                                                                                 |
| **Periodically**           | `/ponytail-debt`   | harvests the `ponytail:` comments it leaves behind, so deliberate shortcuts get tracked instead of quietly rotting                                                                                                                                |

`/ponytail-review` hunts complexity, **not** bugs — pair it with `/code-review`
for correctness. They're complementary, not alternatives.

### Where the house rules still win

Ponytail argues for less code. This repo's conventions sometimes argue for
slightly more, and when they conflict **`CLAUDE.md` wins** — it exists to stop a
second pattern being invented, which is its own kind of slop:

- **Design tokens over arbitrary values.** `text-[19px]` is fewer characters than
  adding a token; the token is still right the moment a second component needs
  it. Same for `--spacing-header-gap` vs a raw `104px`.
- **`ui/` primitives over inline markup.** `Button`, `Pill`, `Icon`, `Eyebrow`
  exist _because_ the pattern was already duplicated. Re-inlining an `<svg>` is
  shorter and wrong.
- **Generalising `CategoryIndex` → `IndexRail`** (`02 §Primitive 3`) is not
  speculative — four pages need it in this plan. Ponytail's YAGNI applies to
  _imagined_ second uses, not counted ones.

Where ponytail and this repo already agree, and should be listened to: don't
build `/services/[slug]` before there's copy for it (`07`), don't build
`/projects` before there are real projects (`10`), and don't add a library
because the reference implementation used one (`01 §3`).

---

## Two decisions that need you, not me

1. **Legal name.** The profile's cover and footer say **Collins Equipments Sales
   & Rental L.L.C**; the credentials box on page 2 says **Collins Equipments
   Rental L.L.C** (no "Sales &"). The site says **Collins Equipments LLC** — which
   matches neither. One of these is what's on the trade licence. Which?
2. **The testimonials.** The three quotes on the homepage are attributed to
   "Site Manager · Construction · Dubai" etc. They were written as placeholders
   and are marked as such in `src/data/proof.ts`, but a visitor reads them as
   real customers. Either replace them with real quotes, or replace the section
   with the founder quote from the profile (which _is_ real and is attributed to
   a named person). Detail in `03` and `05`.
