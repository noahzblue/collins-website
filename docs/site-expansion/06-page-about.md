# 06 — `/about`

**Phase 1.** All content exists (profile p.2, p.3, p.4). No blockers except the
leadership-photography question in §4 and the legal-name question in `03 §A3`.

**Replaces:** the `/#about` anchor. `AboutTeaser.astro` on the homepage stays as
the teaser and links here.

---

## Page skeleton

Following the five-beat structure every siteassist inner page uses (`01 §1.13`):

```
1  Banner        full-bleed yard photo · breadcrumb · "About us" · one sentence
2  Index rail    sticky, numbered — 01 Who we are … 05 Credentials
3  Blocks        the five, alternating, sticky media
4  Proof         licensed activities table + register number
5  CTA           "Let's talk about your next project."
```

Reuse `PageBanner.astro` for beat 1 (it already handles the breadcrumb + scrim)
and `ui/IndexRail.astro` from `02 §Primitive 3` for beat 2.

---

## 1. Banner

```astro
<PageBanner
  image="/images/about-yard.jpg"
  trail={[{ label: "Home", href: "/" }]}
  current="About"
  title="About us"
  data-next-theme="glass"
/>
```

Sub-line, from the profile cover — the best one-liner in the document:

> Heavy equipment, power generation and transport for sale and for hire.

Under it, a mono detail row in the instrument-panel register (`01 §1.11`):

```
EST. DUBAI  ·  RAS AL KHOR 2  ·  YARD: SAJJAH, SHARJAH  ·  REGISTER 2766346
```

That single line does more for credibility than a paragraph, and it's all
verifiable.

---

## 2. Who we are — the sales-first statement

Two columns: heading + the profile's p.2 copy left, sticky media right
(`02 §Primitive 6`).

Copy, verbatim from p.2 — use all three paragraphs. Do not compress them; this
is the only place on the site that explains what the company actually does, and
the third paragraph (the licence spread, "from a single tower light to a
1,250 KVA generator set on a flatbed") is the best sentence in the document.

**Pull out as a display line between paragraphs 1 and 2**, at `text-h3`, in mono:

> **Sales are the core of the business.**

**Motion:** heading uses `data-reveal="lines"` (the line-mask variant —
free for us because headings are already authored as arrays, `02 §2`). The
sticky media column holds a `<ParallaxImage>`; per the component's own note, no
ancestor may use `overflow-hidden` — `overflow-clip` only.

---

## 3. Mission & vision

Two panels side by side on a **dark band** (`data-next-theme="dark"`), numbered
`01` / `02`, mission left, vision right. Verbatim from p.3.

The vision paragraph ends on the line the whole brand rests on —

> "…not by being the cheapest quote in the inbox."

— set it on its own line, in `text-brand-bright`. That's the sentence a site
manager remembers.

**Motion:** the two panels rise on a 80ms stagger. Nothing else — a dark band
with two paragraphs should be still.

---

## 4. Leadership — five people

Intro copy from p.4, then the five. **The layout depends on a decision:**

**Option A — with photography (preferred).** Five portrait tiles, 4-up grid with
the fifth spanning, name + role + remit revealed on hover on desktop and always
visible on mobile. Portraits shot against the same background, desaturated to
the house grade.

**Option B — no photography (safe default; do this if portraits aren't imminent).**
A hairline-bordered five-row table. Each row: mono index `01`–`05`, initials in a
44px tinted square (`bg-brand-tint text-brand` — the same treatment
`ContactCTA.astro` uses for its method icons), name at `text-subhead`, role in
mono caps at `text-label`, remit at `text-base` in `text-muted`. On hover the row
gets `bg-surface`, nothing else.

**Do not use stock headshots.** A clean typographic table reads as deliberate; a
grid of stock faces reads as a lie, and it's the exact tell that undoes
everything else on the page.

**Then the callout**, p.4, as a full-width band in `bg-brand-tint`:

> **One point of contact** — Every account is assigned a named contact from this
> team. You will not be passed between departments during a project.

This is a real differentiator against the big rental houses and it should not be
buried inside the leadership grid.

---

## 5. Credentials — the licensed activities

The dry, checkable block. Procurement departments read this; nobody else does;
it costs one section and it wins tenders.

```
┌─ 01 LICENSED NAME ──────┬─ 02 HEAD OFFICE ─────┬─ 03 YARD ───────────────┐
│ Collins Equipments      │ Ras Al Khor 2        │ Sajjah, Sharjah         │
│ Sales & Rental L.L.C    │ Dubai, U.A.E.        │ U.A.E.                  │
└─────────────────────────┴──────────────────────┴─────────────────────────┘

LICENSED ACTIVITIES
─────────────────────────────────────────────────────────────────────────────
SALE                                    │ RENTAL
Construction equipment & machinery      │ Construction equipment & machinery
Heavy & light machinery & equipment     │ Heavy & light machinery & equipment
Loading, lifting & construction equip.  │ Loading, lifting & construction equip.
Alternative energy equipment & supplies │ Alternative energy equipment & supplies
─────────────────────────────────────────────────────────────────────────────
REGISTER 2766346 · LICENSED BY THE DUBAI DEPARTMENT OF ECONOMY & TOURISM
```

Hairline borders, mono for the column heads and the register line, `text-cell`
for the rows. **No card, no shadow, no icons** — this section's credibility comes
from looking like a document.

The eight activities pair up cleanly into four sale/rental rows, which is itself
the argument the page has been making: same licence, same fleet, two ways to get
it.

---

## 6. Closing CTA

The site-wide closer — identical on `/about`, `/services`, `/industries`,
`/yard`, `/projects`. Build it once as `sections/PageCTA.astro`:

> **Let's talk about your next project.**
> Send us the machine, the duty and the dates, or just describe the job and we
> will specify it for you. Quotations are issued the same working day wherever
> possible.
>
> [Request a quote] [WhatsApp us] · +971 54 438 0684 · Mon–Sat 8:00–18:30

Verbatim from p.9. The reference does exactly this — one CTA, identical
everywhere — and it's why you always know where their pages end.

---

## Files

```
src/pages/about.astro                     new
src/data/about.ts                         new — mission, vision, leadership[], credentials
src/components/sections/PageCTA.astro     new — the shared closer (used by 06–11)
src/components/ui/IndexRail.astro         from 02 §Primitive 3
src/config/site.ts                        + yard, register, licensingAuthority, phones[]
public/images/about-yard.jpg              banner
public/images/team/*.jpg                  option A only
```

`about.ts` rather than growing `content.ts`: leadership is structured data with
five records, and `content.ts` is documented as "section headings, eyebrows,
intro paragraphs" — a five-record array doesn't belong there.

## Definition of done

- [ ] Every fact traceable to a page of the profile — no invented history, no
      invented founding year, no "over 15 years"
- [ ] No stock photography of people
- [ ] Index rail scroll-spies correctly and collapses to a chip strip below 980px
- [ ] `data-next-theme` set on all six sections; header inverts across the dark band
- [ ] Breadcrumb points at `/`; nav shows `aria-current` on About
- [ ] `/ponytail-review` run on the diff — every finding applied, or a written reason it wasn't
