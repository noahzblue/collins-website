# 07 — `/services` (+ `/services/[slug]`)

**Phase 1** for the hub. **Phase 2** for the six detail pages.
**This is the biggest content gap on the site** — see `03 §p.7`.

---

## The gap, stated plainly

`src/data/services.ts` ships three services:

| Current                  | Problem                                                      |
| ------------------------ | ------------------------------------------------------------ |
| General trading & rental | merges the two things the business most needs to distinguish |
| Equipment sourcing       | ✅ real (profile calls it Sourcing & Procurement)            |
| Logistics & export       | ✅ real                                                      |

The profile lists **six**. **Transport & Haulage** and **Maintenance & Spares**
— flatbed/low-bed movement with permits and escorts, and scheduled servicing
plus a parts inventory — are **two revenue lines with no presence on the website
at all**. Meanwhile "Equipment Sales", the stated core of the business, isn't a
service on the site either; it's folded into "general trading".

Fixing `services.ts` fixes the homepage section (`05 §5`) and creates this page
at the same time.

---

## New `src/data/services.ts`

Copy is verbatim from profile p.7. `stat` is the floating data-card that
`Services.astro` already renders over the photo — keep that mechanism, it's good.

```ts
export interface Service {
  slug: string; // NEW — /services#slug now, /services/slug in phase 2
  icon: IconName;
  title: string;
  /** One line for the list row and the homepage card. */
  lead: string;
  /** The profile's paragraph — used on the hub block and the detail page. */
  body: string;
  image: string;
  stat: { title: string; line: string };
}
```

| #   | slug                   | title                  | lead                                                     | stat                                                                          |
| --- | ---------------------- | ---------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 01  | `equipment-sales`      | Equipment sales        | Supplied outright, commissioned and documented.          | Commissioned on handover / Operator handover + docs for finance or insurance. |
| 02  | `equipment-rental`     | Equipment rental       | Short, long or project duration — the same fleet.        | Delivery included / Delivery and collection are in the rate.                  |
| 03  | `sourcing-procurement` | Sourcing & procurement | Specification-led sourcing when it isn't standard stock. | Sourced to spec / Direct from manufacturers and authorised distributors.      |
| 04  | `transport-haulage`    | Transport & haulage    | Flatbed and low-bed movement across the Emirates.        | Permits & escorts / Out-of-gauge loads handled end to end.                    |
| 05  | `maintenance-spares`   | Maintenance & spares   | Servicing, breakdown response and a parts inventory.     | Parts held / For generators, forklifts, compressors and heavy plant.          |
| 06  | `logistics-export`     | Logistics & export     | Regional delivery and export handling.                   | UAE · Oman · KSA · Qatar · Africa / Export documentation handled.             |

`body` for each is the full sentence from `03 §p.7` — use it verbatim, it's
already well written.

**Icons needed** in `ui/icons.ts` (four exist, two are new): `refresh`, `search`,
`globe` are there; add **`truck`** (transport & haulage) and **`wrench`** (or
`tool`, maintenance & spares), plus **`tag`**/**`document`** for sales. Per
`CLAUDE.md`, no hardcoded `fill`/`stroke` — `currentColor` only.

---

## Hub layout

```
1  Banner        photo · "Services" · "Six services that cover the whole life
                 of a machine on your project."                    ← p.7 intro
2  FollowerList  the six, numbered, one shared image panel
3  Blocks        01–06 full rows, alternating, sticky media, deep-linkable
4  Cross-sell    "Every service runs on the same twelve categories" → /equipment
5  CTA           the shared PageCTA
```

### Beat 2 — the follower list

`ui/FollowerList.astro` (`02 §Primitive 5`), the reference's `/solutions` home
pattern:

```
01  Equipment sales           ┌──────────────────────────┐
02  Equipment rental          │                          │
03  Sourcing & procurement    │   one image panel,       │
04  Transport & haulage       │   crossfading on hover   │
05  Maintenance & spares      │                          │
06  Logistics & export        └──────────────────────────┘
```

Each row anchors to its block below (`#transport-haulage`). Six rows, one
screen, and the numbers tell you how much page is left.

### Beat 3 — the six blocks

Full-width rows, sides alternating, exactly like `/equipment`'s `CategoryRow`.
Per block:

```
┌─ 04 ────────────────────────────────────────────────────────┐
│  TRANSPORT & HAULAGE                                        │
│  Flatbed and low bed movement of plant and cargo across the │
│  Emirates, including permits and escorts for out of gauge   │
│  loads.                                                     │
│                                                             │
│  ✓ Flatbed and low bed          ✓ Permits arranged          │
│  ✓ Out-of-gauge escorts         ✓ All seven emirates        │
│                                                             │
│  [Request transport] [WhatsApp]                             │
└─────────────────────────────────────────────────────────────┘
```

The 3–4 checkmark points per service are the one thing the profile doesn't
give — they need writing (~20 words each). That's the only copy debt on this
page, and it's small.

**Reuse `CategoryRow.astro`'s structure rather than reinventing it.** If it's
close enough with a prop or two, generalise it; if not, mirror its shape so the
two hubs read as siblings.

### Beat 4 — cross-sell

One hairline band linking services to the catalogue:

> Every service above runs on the same twelve categories — 10 kVA to 1,250 kVA
> of generation, 1.4 to 15 ton of handling, 50 to 600 ton of lift.
> **View the equipment →**

This is the internal link that makes `/services` and `/equipment` reinforce each
other instead of competing for the same search intent.

---

## `/services/[slug]` — phase 2

Only worth building when there's more to say than the hub block already says.
Right now there isn't — six pages each carrying one profile sentence would be
thin content, and thin pages are worse than no pages.

**Gate:** build these when each service has **~250 words** covering: what's
included, what isn't, how it's priced or scoped, lead time, and one worked
example. Two are clearly worth it first:

- **`transport-haulage`** — permits, escorts, low-bed vs flatbed, out-of-gauge
  process, emirate coverage. Real search demand, nobody in the trade explains it
  well.
- **`maintenance-spares`** — what's held, response time, what a service contract
  covers. This is the page that turns a rental customer into a sales customer.

Template, when they happen: banner → what's included (checklist) → how it works
(numbered 01–04 steps) → related equipment categories → `PageCTA`.

---

## Files

```
src/pages/services/index.astro          new
src/pages/services/[slug].astro         new — phase 2
src/data/services.ts                    REWRITE — three → six
src/components/ui/FollowerList.astro    from 02 §Primitive 5
src/components/ui/icons.ts              + truck, wrench
src/components/sections/Services.astro  homepage teaser → FollowerList (see 05 §5)
public/images/service-*.jpg             need 3 more: sales, transport, maintenance
```

## Definition of done

- [ ] Six services live, copy verbatim from the profile
- [ ] Homepage services section reads from the same `services.ts` — no drift
- [ ] Every service row deep-links and every block has an `id`
- [ ] Index/follower rail works with keyboard focus, not just hover
- [ ] `/services` `<title>` names transport and maintenance (`04 §SEO`)
- [ ] `/ponytail-review` run on the diff — every finding applied, or a written reason it wasn't
