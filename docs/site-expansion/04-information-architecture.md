# 04 — Information architecture

## The problem today

`src/data/navigation.ts` points four of its six items at homepage anchors:

```ts
{ label: "Services",   href: "/#services" },
{ label: "Industries", href: "/#industries" },
{ label: "About",      href: "/#about" },
{ label: "Contact",    href: "/#contact" },
```

Three consequences:

1. **Four nav items share one URL.** Nothing in the nav can ever be "current"
   except Home and Equipment. There is no `aria-current` state to give.
2. **`/industries/[slug]` is an orphan.** Eight pages exist, and the only way in
   is the homepage tile grid. Their breadcrumb trail even points backwards to an
   anchor: `trail={[{ label: "Industries", href: "/#industries" }]}`.
3. **Nothing can rank.** One page cannot rank for "generator rental Dubai",
   "equipment transport UAE" and "forklift sales Sharjah" at once. Four thin
   anchor sections become four indexable pages with their own titles.

The anchors themselves stay valid — the homepage sections keep their `id`s, and
in-page smooth scroll still works. They just stop being the _destination_.

---

## The new route table

```
/                          homepage
/about                     new
/services                  new
/services/[slug]           new — phase 2, six pages
/equipment                 exists
/equipment/[slug]          exists — twelve pages
/industries                new — hub
/industries/[slug]         exists — eight pages, deepened
/yard                      new — phase 2
/projects                  new — phase 3, gated
/projects/[slug]           new — phase 3, gated
/contact                   new
```

### On `/yard` as a URL

Alternatives considered: `/how-we-work`, `/operations`, `/the-yard`,
`/sajjah-yard`. **Recommend `/yard`** — short, concrete, matches the noun the
trade actually uses, and the profile already gives the page its heading ("One
Yard. Ready Stock."). Avoid `/how-we-work`: it's the vaguest option and the page
is fundamentally about a _place_.

---

## Header nav

Seven items is too many for the pill header at the `nav` breakpoint (980px).
Recommend **six**, with Equipment first because it's the highest-intent
destination:

```ts
export const mainNav: NavLink[] = [
  { label: "Equipment", href: "/equipment" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "The yard", href: "/yard" }, // phase 2 — omit until it exists
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
```

"Home" comes out — the logo is the home link, and it's the one item the pill
header can afford to lose. Add an `aria-current="page"` state to `Header.astro`'s
`.nav-link` (compare `Astro.url.pathname`, matching prefix so
`/equipment/generators` lights "Equipment").

**"Get a quote"** stays as the header button. Change its `href` from `/#contact`
to `/contact`.

---

## Footer

`footerColumns` currently has two columns and the same anchor problem. Three
columns, and it becomes a real sitemap:

| Equipment                        | Company                            | Get in touch                      |
| -------------------------------- | ---------------------------------- | --------------------------------- |
| Generators                       | About us — `/about`                | Request a quote — `/contact`      |
| Forklifts                        | Services — `/services`             | WhatsApp — `site.whatsapp.href`   |
| Mobile cranes                    | Industries — `/industries`         | Call — first of the three numbers |
| Excavators                       | The yard — `/yard`                 | `info@collinscouae.com`           |
| All 12 categories — `/equipment` | Projects — `/projects` _(phase 3)_ | Mon–Sat 8:00–18:30                |

**Add a legal line under the footer bar**, from the profile's back cover — it's
the local trust equivalent of the reference's ISO badges:

> Collins Equipments Sales & Rental L.L.C · Register 2766346 · Licensed by the
> Dubai Department of Economy & Tourism

Two addresses belong in the footer brand column, not one:
**Office** Ras Al Khor 2, Dubai — **Yard** Sajjah, Sharjah.

---

## Breadcrumbs

`Breadcrumb.astro` exists and is used on `/equipment/*` and `/industries/*`.
Once the hubs exist, fix the trails to point at real pages:

| Page                          | Trail                                                                    |
| ----------------------------- | ------------------------------------------------------------------------ |
| `/industries/construction`    | Home → **Industries** (`/industries`, was `/#industries`) → Construction |
| `/services/transport-haulage` | Home → Services → Transport & haulage                                    |
| `/equipment/generators`       | Home → Equipment → Generators _(already correct)_                        |

---

## SEO titles and descriptions

Every new page sets both explicitly via `Base.astro`'s props. Sales-led, per
`03 §A6`, and each one carries a number or a place because that's what gets
clicked in this trade.

| Route         | `<title>`                                                           | Description angle                                                        |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `/`           | Collins Equipments \| Heavy Machinery **Sales & Rental** in the UAE | 12 categories, buy outright or hire, same-day quotes                     |
| `/about`      | About Collins Equipments \| Sales & Rental L.L.C, Dubai             | licensed activities, yard, leadership, register number                   |
| `/services`   | Equipment Sales, Rental, Transport & Maintenance \| Collins         | the six, named — this is the page that catches "equipment transport UAE" |
| `/industries` | Industries We Supply \| Collins Equipments UAE                      | the eight sectors                                                        |
| `/yard`       | Our Sajjah Yard \| Ready Stock, Inspected Before Dispatch           | mobilisation, condition reports, one delivery                            |
| `/contact`    | Contact Collins Equipments \| Dubai & Sharjah                       | three numbers, Mon–Sat, same-working-day quotes                          |

Note the homepage title change: **"Rental & Sales" → "Sales & Rental"**.

---

## Two things to add while you're in here

- **`sitemap.xml`** — `@astrojs/sitemap` if not already installed. With 30+ pages
  after this work it stops being optional.
- **`LocalBusiness` JSON-LD** in `Base.astro`, built from `site.ts`: legal name,
  both addresses, all three phones, `openingHours: Mo-Sa 08:00-18:30`, geo.
  Everything it needs is already (or about to be) in that one file, and this is
  what puts the hours and phone numbers into Google's local panel.
