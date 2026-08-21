# 03 — Content source: the company profile

_Everything usable from `collins business profil.pdf` (9 pages), transcribed and
mapped to a destination. Read this alongside any page spec — it is the raw
material, and it is also the record of **where the live site currently
contradicts the company's own document**._

---

## Part A — the six corrections to make now

These are factual defects in the shipped site. None of them depend on any new
page or design work. **Do these first.**

| #   | Where                                                                      | Site says                                                                      | Profile says                                                                                                                                                     | Severity                                                                    |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| A1  | `config/site.ts` → `hours`, and `content.ts` → `aboutSection.office.hours` | "Mon–Fri 8:00–6:30"                                                            | **Monday to Saturday, 8:00 am to 6:30 pm**                                                                                                                       | **High** — turns away Saturday enquiries; the UAE working week runs Mon–Sat |
| A2  | `config/site.ts` → `phone`                                                 | one number: `(+971) 052 399 5373`                                              | **three**: +971 54 438 0684 · +971 52 399 5373 · +971 50 913 2703                                                                                                | Medium                                                                      |
| A3  | `config/site.ts` → `legalName`                                             | "Collins Equipments LLC"                                                       | **"Collins Equipments Sales & Rental L.L.C"** (cover + footer) — but p.2's credentials box says "Collins Equipments Rental L.L.C". **Neither matches the site.** | **High** — needs your answer, see `00`                                      |
| A4  | `proof.ts` → `stats`                                                       | `15+ years`, `500+ machines`, `24h quote` — all marked placeholder in the file | **1 yard · 12 equipment categories · 7 emirates served · 1,250 kVA max output** — real, checkable, and stronger                                                  | **High** — unverifiable claims                                              |
| A5  | `proof.ts` → `testimonials`                                                | 3 quotes attributed to "Site Manager · Construction · Dubai" etc.              | nothing. The profile's only quote is the **Managing Director's**, named.                                                                                         | **High** — reads as real customer testimony; it isn't                       |
| A6  | Site-wide word order                                                       | "**rental and sales**" (hero title, SEO title, blurb, `site.seo.title`)        | "**Sales are the core of the business.**" Sales is listed first everywhere in the profile.                                                                       | **High** — the positioning is backwards                                     |

`config/site.ts` also has no field for: the **Sajjah, Sharjah yard**, the
**trade licence register 2766346**, the licensing authority (**Dubai Department
of Economy & Tourism**), or the website domain. All four are wanted by `/about`
and `/contact`.

**Also unverified, not from the profile:** `proof.ts` → `partners`
(`PERKINS, KALMAR, JCB, CUMMINS, DEUTZ, TADANO`). The profile names no
manufacturer at all. These wordmarks run in the hero. Confirm we are actually an
authorised or regular channel for each before they stay.

---

## Part B — the profile, page by page, with destinations

### p.1 — Cover

> **COLLINS SALES & RENTAL L.L.C** · DUBAI · UNITED ARAB EMIRATES
> **COMPANY PROFILE**
> _"Heavy equipment, power generation and transport for sale and for hire."_
> Categories called out: Generators · Forklifts · Flatbed Trailers · Cranes &
> Earthmoving · Air Compressors · Boom & Scissor Lifts
> `www.collinscouae.com`

→ The tagline is the best one-line summary of the business anywhere in the
document. **Candidate for the homepage hero sub or the `/about` hero.**
→ Note **Flatbed Trailers** appears on the cover but is **not** one of the 12
catalogue categories. It's covered by the _Transport & Haulage_ service instead
(p.7). Worth confirming which is right.

### p.2 — Who we are

> Collins Equipments Sales & Rental L.L.C **sells**, hires and maintains the
> machines that keep projects moving across the United Arab Emirates: power
> generation, material handling, earthmoving, lifting and heavy haulage.
>
> **Sales are the core of the business.** Generators, forklifts, cranes,
> compressors, access equipment and earthmoving plant are supplied outright,
> sourced direct from manufacturers and authorised distributors, and handed over
> commissioned, documented and ready to work. Where a contractor needs the same
> machine for weeks rather than years, it is available from the identical fleet
> on hire, supported by the same engineers and held to the same standard.
>
> Our licence covers construction equipment, heavy and light machinery, lifting
> and loading plant, and alternative energy equipment. That is the full spread a
> live site actually needs, from a single tower light to a 1,250 KVA generator
> set on a flatbed.

**Credentials block:**

- Licensed name — Collins Equipments Rental L.L.C _(see A3)_
- Head office — **Ras Al Khor 2, Dubai, U.A.E.**
- Yard — **Sajjah, Sharjah, U.A.E.**

**Licensed activities (8):**

| Sale                                      | Rental                                                         |
| ----------------------------------------- | -------------------------------------------------------------- |
| Construction Equipment & Machinery        | Construction Equipment & Machinery Rental                      |
| Heavy & Light Machinery & Equipment       | Heavy & Light Machinery & Equipment Rental                     |
| Loading, Lifting & Construction Equipment | Loading, Lifting & Construction Equipment with Wheels & Motors |
| Alternative Energy Equipment & Supplies   | Alternative Energy Equipment & Supplies                        |

**The positioning pair — verbatim, and the most valuable 20 words in the document:**

> **SALES — our main business.** Supplied outright and commissioned.
> **RENTAL — the same fleet.** Day, week, month or project.

→ `/about` §1 and §"Credentials". The **SALES / RENTAL pair becomes a new
homepage section** — see `05 §4`. The licensed-activities table is the kind of
dry, checkable detail that builds trust with procurement; put it on `/about` as
a two-column hairline table, not as bullet points.

### p.3 — Mission, vision, values

> **Our Mission** — To deliver high performance power solutions and heavy
> machinery engineered to exceed industrial standards, and to keep them running
> long after the invoice is settled. Durability, precision and uptime are what we
> sell; the machine is how we deliver it.
>
> **Our Vision** — To be the first call in the Emirates for equipment that has to
> work on the day it arrives. We grow by being the supplier a site manager trusts
> on a tight programme, not by being the cheapest quote in the inbox.

**Values 01–04** — _already ported into `proof.ts` → `trustFeatures`; see
`trust-strip-content-update.md`. Keep the order._
`01 Readiness` · `02 Reliability` · `03 Accountability` · `04 Fair Dealing`

**The founder quote — real, named, and the best copy in the document:**

> "We would rather turn down a job than send out a machine we have not checked
> ourselves. **That is the whole business in one sentence.** The rest is
> logistics."
> — **Rohan Robert, Managing Director**

→ Mission/vision to `/about`. The MD quote is the **replacement for the
placeholder testimonials** (A5) until real client quotes exist — see `05 §7`.
Note the profile itself bolds the middle clause; keep that emphasis.

### p.4 — Leadership (five people)

| Role                              | Name                     | Remit (verbatim, lightly trimmed)                                                                                            |
| --------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Founder & Chief Executive Officer | **Robert C**             | Sets the direction of the business and holds ownership of long term investment in fleet, facilities and partnerships.        |
| Managing Director                 | **Rohan Robert**         | Runs the company day to day: commercial strategy, key accounts and the standard every machine is held to before it goes out. |
| Executive Director                | **Akbar Nizamudeen**     | Oversees operations and client delivery, from site surveys and mobilisation through to on hire support.                      |
| Executive Director                | **Thamanna Adhinal**     | Leads business development and corporate governance, keeping licensing, compliance and growth planning aligned.              |
| Admin & Procurement Manager       | **Alphonsa Ruby Mathew** | Manages sourcing, supplier relationships, documentation and the administration behind every hire and sale.                   |

Intro copy:

> A small, hands on team that stays close to the yard. Between them they cover
> ownership, commercial direction, operations, fleet condition and procurement.
> That is why decisions on a hire, a price or a replacement machine come back the
> same day rather than the same week.

Plus a callout:

> **One point of contact** — Every account is assigned a named contact from this
> team. You will not be passed between departments during a project.

→ `/about`. **Needs a decision: do we have portrait photography for these five?**
If not, the section still works with mono initials in a hairline-bordered tile —
see `06 §4`. Do not use stock headshots.

### p.5 — Sales & products (the twelve)

> Every category below is sourced direct from manufacturers and authorised
> distributors, supplied with commissioning, operator handover and parts support
> — and available for outright purchase or for hire.

**Verified: all twelve categories and their ranges already match
`src/content/equipment/categories.json` exactly, in the same order.** No changes
needed. The intro paragraph above, however, is better than
`equipmentHub.intro` — consider swapping it in.

### p.6 — Equipment gallery (four groups)

> A look at the fleet leaving the Sajjah yard — the same units supplied outright
> or made available on hire, every one Collins branded and inspected before
> dispatch.

`01 Generators 10 kVA–1250 kVA` · `02 Forklifts 1.4–15 Ton` ·
`03 Air Compressors 135–1050 CFM` · `04 Cranes & Plant — telehandlers,
excavators & skid steers`

→ `/yard` (`09`). **Blocked on photography** — this is a gallery spread, it needs
real yard photos, not renders.

### p.7 — What we do (**six** services)

> Six services that cover the whole life of a machine on your project: supplying
> it, getting it there, keeping it running, and taking it away again.

| #   | Service                    | Copy (verbatim)                                                                                                                                                                       |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Equipment Sales**        | New and inspected used equipment supplied outright across power, handling, lifting and earthmoving, with commissioning, operator handover and documentation for finance or insurance. |
| 2   | **Equipment Rental**       | Short term, long term and project duration hire from the same fleet, with delivery and collection included in the rate.                                                               |
| 3   | **Sourcing & Procurement** | Specification led sourcing direct from manufacturers and authorised distributors when the unit you need is not standard stock.                                                        |
| 4   | **Transport & Haulage**    | Flatbed and low bed movement of plant and cargo across the Emirates, including permits and escorts for out of gauge loads.                                                            |
| 5   | **Maintenance & Spares**   | Scheduled servicing, breakdown response and a parts inventory for generators, forklifts, compressors and heavy plant.                                                                 |
| 6   | **Logistics & Export**     | Regional delivery and export handling for equipment moving to Oman, Saudi Arabia, Qatar and African markets.                                                                          |

→ **`/services`, and this is the biggest single content gap on the site.**
`src/data/services.ts` currently holds **three** services — "General trading &
rental", "Equipment sourcing", "Logistics & export" — which merge sales and
rental into one vague item and omit **Transport & Haulage** and **Maintenance &
Spares** entirely. Two of the six real revenue lines are invisible on the
website. Full spec in `07`.

### p.8 — One yard. Ready stock.

**Heading:** "One Yard. Ready Stock." **Kicker:** "YARD: SAJJAH, SHARJAH, U.A.E."

| Point                          | Copy                                                                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Everything under one roof.** | Generators, forklifts, telehandlers, cranes and trailers stand in the same yard, so a mixed order arrives on one delivery, on one agreement. |
| **Inspected before dispatch.** | Units are serviced, fuelled and function tested in our workshop, and handed over with a signed condition report.                             |
| **Fast mobilisation.**         | Sajjah sits within reach of Dubai's main construction corridors, Jebel Ali and the northern Emirates.                                        |
| **Buy outright or hire.**      | Move from a trial hire to a purchase, or straight to a purchase, without changing supplier, paperwork or point of contact.                   |
| **Support after handover.**    | Breakdown response, scheduled servicing and parts held for the equipment we supply.                                                          |

**Stats:** `1` yard, Sajjah Sharjah · `12` equipment categories · `7` emirates
served · `1250 KVA` max generator output

→ `/yard` (`09`); stats replace the placeholders now (A4).

### p.9 — Contact

> **Let's talk about your next project.**
> Send us the machine, the duty and the dates, or just describe the job and we
> will specify it for you. **Quotations are issued the same working day wherever
> possible.**

- **Office & yard** — Ras Al Khor 2, Dubai · Yard: Sajjah, Sharjah · United Arab Emirates
- **Telephone** — +971 54 438 0684 · +971 52 399 5373 · +971 50 913 2703
- **Email & web** — info@collinscouae.com · www.collinscouae.com
- **Working hours** — **Monday to Saturday, 8:00 am to 6:30 pm**
- **Register 2766346 — licensed by the Dubai Department of Economy & Tourism**

→ `/contact` (`11`). The "send us the machine, the duty and the dates" line is a
**better form label** than the current one and tells people what to actually
type. The same-working-day promise should appear next to every quote CTA on the
site.

---

## Part C — what the profile does _not_ give us

Be honest about the gaps rather than inventing filler:

| Missing                      | Wanted by                   | Options                                                                                                                      |
| ---------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Year founded / years trading | `/about`, stats             | ask; otherwise drop "15+ years" for good (A4)                                                                                |
| Fleet size ("500+ machines") | stats                       | ask, or state "12 categories" instead                                                                                        |
| Named clients / projects     | `/projects`, homepage proof | see `10` — gated                                                                                                             |
| Manufacturer relationships   | hero partner strip          | confirm each (see Part A)                                                                                                    |
| Certifications (ISO etc.)    | footer trust row            | the reference leans on ISO 27001 badges; we have the DET licence + register number, which is the local equivalent — use that |
| Team photography             | `/about` leadership         | see `06 §4` for the no-photo layout                                                                                          |
| Yard photography             | `/yard` gallery             | blocks `09`                                                                                                                  |
