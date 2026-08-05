# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: UAE-based businesses that buy or rent heavy equipment — construction, oil & gas, power generation, renewable energy, industrial, and events/production. The decision-makers are contractors, site/project managers, and procurement staff comparing suppliers and wanting a fast, specific quote (often via WhatsApp or phone). Intent splits two ways for the same catalog: outright **purchase** (Trading) and **hire** (Rental).

Secondary: automotive buyers — used luxury car shoppers and people sourcing genuine car spare parts (Lexus, BMW, Audi, Lamborghini, Mercedes, Range Rover). Kept on the same site (see Capabilities), but a distinct intent from the heavy-equipment buyer.

## Product Purpose

Rebuild collinscouae.com preserving its existing content and equipment catalog, while replacing its only conversion path (a generic WhatsApp link / buried contact form) with a real sales/inquiry flow: homepage lead capture, a dedicated Request-a-Quote page, and per-product Buy-vs-Rent enquiries that carry the equipment and intent into the form. Both Collins branch locations are surfaced. Success = qualified enquiries and quote requests, not just a browsable catalog.

## Positioning

Collins is a UAE heavy-equipment supplier whose combination a direct competitor could not truthfully copy:

- **Buy AND rent the same catalog** — every line is available for outright sale or hire; intent is a first-class choice, not an afterthought.
- **Founder-led trust** — a named owner (Rohan Robert) message and a named leadership team, a personal trust signal the reference competitor (SP Heavy Rental) does not have.
- **Two UAE branches + ready inventory** — physical presence in two locations with fast delivery and in-stock equipment.
- **Widest range under one roof** — generators through heavy equipment to spare parts and used cars, carrying top international brands (Perkins, Kalmar, Deutz).

## Operating Context

UAE B2B equipment market. Buyers browse by equipment category, then convert through low-friction channels — inline forms, a floating WhatsApp button, and a floating Call button. Equipment serves live jobsites, so availability, delivery speed, and branch proximity matter to the decision. Enquiries frequently begin on mobile. The rebuild is a redesign of the live site (collinscouae.com) toward the bold industrial direction of the design reference (spheavyrental.ae); the current site's look is evidence of the subject, not authority over the new visual world (that is decided in new-work).

## Capabilities and Constraints

**Stack:** Astro 7 static site, bun as package manager, node/bun run inside the `devbox` container (see CLAUDE.md). No SSR backend assumed; forms need a submission handler/endpoint to be chosen during build.

**Content:** Existing page copy, SEO titles, and meta descriptions are preserved as-is from the live site unless the client requests rewrites (full inventory in `docs/Collins_Website_Rebuild_Brief.md` §3).

**Sitemap / routes:**
- Core: `/` (home), `/rental/` (hub), `/trading/` (hub), `/request-a-quote/` (NEW), `/about/`, `/services/`, `/branches/` (NEW), `/contact-us/`.
- Equipment — a dedicated page per type: `/generators/`, `/forklifts/`, `/air-compressors/`, `/tower-lights/`, `/industrial-equipments/`, `/heavy-equipment/`, plus NEW dedicated pages for Cranes, Excavators, Backhoe Loaders, Boom Loaders (Telehandlers), and `/oil-and-gas-equipments/` (previously all collapsed into Heavy Equipment).
- Automotive — kept integrated on the same site: `/spare-parts/` (VIN-based car-parts request form: Name, Email, Contact, VIN, Make, Model, Year, Required Parts, Quantity, Delivery Location) and `/used-cars/` (WhatsApp enquiry, no form).

**Sales / inquiry flow (new functional requirements):**
- Homepage inline lead form (First Name, Last Name, Email, Phone, Message) — not only a WhatsApp button.
- Dedicated Request-a-Quote page with equipment-category dropdown and quantity/duration fields; optional downloadable catalog/price list as a lead magnet (see open items).
- Per-product **Buy vs Rent**: two clear CTAs / a toggle ("Enquire to Buy" / "Enquire to Rent") that pre-fill equipment name and selected intent into the form.
- Always-on: floating WhatsApp button (retained) + a new floating Call button.
- Branch showcase: both locations side by side (address, embedded map, phone, hours).

**Known issues to fix in the rebuild (§6):**
- Services page currently ships leftover roofing-theme template content and Lorem Ipsum ("Roof Installations", etc.) — must be replaced with real Collins service copy.
- Spare Parts meta description describes heavy-equipment parts but the page is about car parts — copy fix.
- Footer social icons: three of four hrefs are dead; only Instagram is confirmed.
- Equipment taxonomy differs across nav, footer, and homepage — standardize into one consistent list.

**Undecided product facts (record, do not invent):**
- Second branch address, phone, and map pin — client to provide; ship a placeholder card/pin until then.
- Facebook, YouTube, LinkedIn account URLs — unconfirmed; link only Instagram until confirmed.
- Downloadable catalog / price-list PDF for Request-a-Quote — not confirmed to exist.
- Palette scope (full SP adoption vs. hybrid with Collins navy) — a **visual** decision deferred to new-work, not a product fact.

## Brand Commitments

- **Name:** Collins Equipments LLC.
- **Logo (binding, do not alter):** keep the existing wordmark as-is — "COLLINS" in brand blue `#0050F0` with a hexagonal "O", "EQUIPMENTS LLC" in navy `#081459` beneath. Do not recolor or redraw it to match the reference site's palette.
- **Brand colors to retain for continuity:** Collins navy `#081459` / blue `#0050F0`. The *degree and placement* of their use vs. the reference site's bolder palette is a visual-world decision for new-work, not fixed here.
- **WhatsApp green `#25D366`** for the WhatsApp CTA only (platform-standard).
- **Voice & tone:** direct, benefit-led headline paired with a short reassurance line (e.g. "Reliable Generators | Uninterrupted Energy For Your Critical Work"). Preserve the founder "Owner Message" on About as a trust differentiator.
- **Confirmed social:** Instagram @collinsequipments (instagram.com/collinsequipments).
- **Design reference (binding direction, not expanded here):** rebuild in the bold industrial spirit of spheavyrental.ae; the exact palette, typography, and fidelity are chosen in new-work.

## Evidence on Hand

- **Rebuild brief:** `docs/Collins_Website_Rebuild_Brief.md` — full existing copy, SEO titles, and meta descriptions for every page (pulled from the live site), sitemap, functional requirements, QA list.
- **Live sites:** collinscouae.com (content baseline + the old visual world being replaced) and spheavyrental.ae (design reference).
- **Existing client claims on the current site (verify before relying):** 4,000+ delivered, 3+ years of service, 50+ industries served. Treat as the client's own existing copy, not as fabricated proof; confirm before featuring prominently.
- **People:** founder & named leadership team (About) — Robert C (Founder & CEO), Rohan Robert (Managing Director), Akbar Ali & Thamanna Adhinal (Executive Directors), Alphonse Ruby Mathew (Admin & Procurement).
- **Brand/partner logos referenced:** Perkins, Kalmar, Deutz (asset files needed).
- **Contact:** Ras Al Khor 2, Dubai; phone lines (+971) 0523995373 and 0509132703; car spare parts line 055 675 2784; info@collinscouae.com.
- **Must NOT be fabricated:** second branch details, unconfirmed social accounts, a catalog PDF, and any testimonials, customer names, or pricing not present in the brief.

## Product Principles

1. **Preserve the facts, replace the look and the conversion path.** The rebuild changes visual system and lead flow; it does not invent product claims or rewrite confirmed copy without approval.
2. **Every equipment surface converts with intent.** A clear Buy-vs-Rent choice, carried into the enquiry, beats a generic "submit". Conversion over static listing.
3. **Lead with what competitors can't copy** — founder-led trust and dual-branch UAE presence — not with generic "reliable equipment" claims.
4. **One taxonomy everywhere.** Nav, footer, homepage, and catalog share a single consistent equipment list.
5. **Placeholders, never inventions.** Unconfirmed facts (2nd branch, socials, catalog PDF, stats) ship as clearly-marked placeholders on the client's to-provide list.

## Accessibility & Inclusion

No client-specific standard was established. Because forms are the primary conversion surface and this is a public commercial site, target WCAG 2.1 AA as a sensible default (labeled inputs, visible focus, adequate contrast, mobile-first) — a default to confirm with the client, not a stated requirement.
