# 14 — The quote request form

_Written 2026-08-21, revised 2026-08-22. Supersedes the form section of
`11-page-contact.md`. Prompted by `collins-contact-v2.html` (a prototype),
which settled the structure but not the responsive behaviour._

This document decides **what the form asks, in what order, where it lives, and
what it looks like at each viewport**. It does not write code.

---

## The numbers this is designed against

Every decision below is sized against the real catalogue, not a guess:

| Fact                                     | Value                                                                |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Equipment categories                     | **12**                                                               |
| Families they group into                 | **5** — Power & air, Material handling, Lifting, Access, Earthmoving |
| Total ratings across all categories      | **68**                                                               |
| Ratings per category                     | median **6**, max **12** (generators), min **2** (backhoe loaders)   |
| Categories with a `dutyGuide`            | **1 of 12** (generators only)                                        |
| Emirates                                 | 7                                                                    |
| Services that are _not_ equipment supply | **4 of 6** (transport, spares, sourcing, export)                     |

Two of these change the design outright:

- **Median 6 ratings** means the rating step is short for most categories. It
  does not need search, filtering, or virtualisation. Generators are the
  outlier, not the norm — do not design the step around them.
- **1 of 12 has a `dutyGuide`** means the sizing accordion is an exception.
  Nothing in the layout may depend on it being there.

---

## 1. The governing principle

> **Paginate when the viewport cannot show progress. Scroll when it can.**

Fewer steps does not mean less work — it is the same questions either way. What
changes is whether the customer can see how much is left. On a phone, four
labelled steps with a progress bar complete better than one long scroll,
because the end is visible from the start. On a wide screen, pagination _hides_
progress that a scroll would have revealed, and adds clicks for nothing.

So: **one form, four sections. At ≥900px all four are laid out together and the
customer scrolls. Below 900px they become four steps.** Same DOM, same field
names, one presentation layer.

---

## 2. Where the form lives — one component, two mounts

**Decided: a dialog, mounted globally, plus one inline copy on `/contact`. No
new route.**

I had recommended a `/request-quote` page. The dialog is the better call, for a
reason the route could not match: **the CTA is on every page.** Twelve category
pages, twelve hub rows, six homepage tiles, the services blocks and the
industry pages all end in "Request a quotation". A route makes every one of
those a navigation — a veil transition (`13`), a fresh document, a lost scroll
position, and a back button that returns you to the top of where you were. A
dialog answers in place. For a form whose entire job is to catch someone at the
moment of intent, that difference is the whole game.

The one thing the route gave us for free was a **shareable, deep-linkable
destination**. §9 recovers that with a URL parameter, so we give up almost
nothing.

### The two mounts

| Mount                           | Where                                          | Why                                                                                                                                                           |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dialog** (`variant="dialog"`) | Once in `Base.astro`, beside `FloatingButtons` | Available on every page. Opened by any trigger, from anywhere.                                                                                                |
| **Inline** (`variant="inline"`) | `/contact`, replacing the current form         | A form that only exists behind a click is invisible to search and to anyone who arrived specifically to enquire. The contact page is where that person lands. |

`FloatingButtons` is the precedent for the global mount — same slot in
`Base.astro`, same "fixed chrome that must not slide during a page swap"
handling.

### The rule that keeps them from colliding

> **If the page already has an inline instance, every CTA on that page scrolls
> to it instead of opening the dialog.**

Opening a modal containing an identical form on top of the form you are looking
at is the kind of thing that makes software feel unattended. On `/contact` the
triggers become anchor scrolls; everywhere else they open the dialog.

### The consequence nobody remembers until it breaks: duplicate ids

Two instances can exist in one document (the inline form on `/contact`, plus
the global dialog still mounted in `Base`). The prototype hardcodes `id="name"`,
`id="qty"`, `id="cat-generators"`, `id="r-generators-0"` and reaches for them
with `document.getElementById`. Two instances of that markup on one page gives
duplicate ids: `<label for>` binds to the wrong control, `aria-labelledby`
resolves to the wrong element, and every `getElementById` silently returns
whichever came first in the DOM.

Non-negotiable:

- Every id is prefixed per instance — `q-<instanceId>-name`, `q-<instanceId>-cat-generators`.
- The script scopes every query to **its own root element**. No `document.getElementById`, no `document.querySelector`, anywhere in this feature.
- Each instance keeps its own state and its own draft key.

Alternatively the dialog is only mounted on pages without an inline instance —
but the scoping is required regardless, and it is cheap. Do it properly once.

---

## 3. Section order — and why buy/hire moves to the front

The prototype asked machine → rating → buy/hire → contact. **Buy/hire moves
first.** Four reasons, in order of weight:

1. **It changes the vocabulary of the rating step.** `lib/equipment.ts` already
   holds `AVAILABILITY_LABEL` keyed by mode — a hirer reads _"In yard / On
   request / To order"_, a buyer reads _"Ready stock / Short lead / Sourced to
   spec"_. Asked third, the rating list cannot use either, and the prototype
   had to invent a neutral third vocabulary that exists nowhere else on the
   site. Asked first, we reuse what is already written.
2. **It decides which fields exist later.** Hire needs dates, duration, site,
   transport. Buy needs condition, timeframe, destination, documentation.
   Asking first means nobody is ever shown a field that turns out to be
   irrelevant to them.
3. **It is the cheapest possible opening question.** One tap, no thinking. A
   form that opens with a one-tap choice is started far more often than one
   that opens with a twelve-item grid.
4. **It is the site's core distinction** (`05 §3`), and burying it third
   contradicts every other page.

Final order:

```
1  What you need      buy / hire / not sure  +  which machine
2  What size          rating  +  quantity  (+ attachments)
3  The terms          mode-dependent — dates & site, or condition & destination
4  Where to send it   contact details  +  reply channel
```

**The fastest path through this form is two steps, not four.** See §9 — a
visitor who opens it from `/equipment/generators` should land on section 3.

---

## 4. The dialog — behaviour

### The primitive

**Native `<dialog>` with `showModal()`.** It gives us the top layer (beats every
z-index on the site, including the `z-[60]` floating buttons and the view
transition veil), a real focus trap, Escape handling, background `inert`, and
`::backdrop` — all of which are bugs waiting to happen in a hand-rolled version.

### Size and shape

| Viewport    | Presentation                                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **≥ 900px** | Centred panel, `max-width: 1120px`, `max-height: 86dvh`, `--radius-md`, dimmed backdrop. The panel scrolls internally.       |
| **< 900px** | **Full-screen sheet** — `100dvw × 100dvh`, no radius, no visible backdrop. A centred card with a form this long is unusable. |

Use `dvh`, never `vh` — iOS Safari's collapsing toolbar makes `100vh` taller
than the screen, which buries the sticky footer nav under the browser chrome.

Mobile sheet gets its own top bar, outside the scrolling area:

```
┌───────────────────────────────┐
│  Request a quotation      [✕] │  ← fixed
│  01 / 04  ▓▓▓▓▓░░░░░░░░░░░░░  │
├───────────────────────────────┤
│  … step content scrolls …     │
├───────────────────────────────┤
│  [ Back ]   [   Continue   ]  │  ← fixed
└───────────────────────────────┘
```

### Dismissal — the form must survive it

Fifteen fields sitting behind an accidental Escape or a stray backdrop click is
a real data-loss risk, and the single most likely way this feature earns a
complaint.

- **No light dismiss once the form is dirty.** A backdrop click on a dirty form
  does nothing (or nudges the close button); on a pristine form it closes.
- **Escape on a dirty form** intercepts the `cancel` event, prevents the
  default, and shows an in-panel confirm — _"Discard this request?"_ ·
  `Keep editing` / `Discard`. Not `window.confirm()`.
- **Draft persistence.** Serialise to `sessionStorage` on change, keyed per
  instance; restore on open; clear on success. This makes every dismissal
  recoverable and costs about fifteen lines. It also covers an accidental page
  navigation, which no amount of dismissal guarding can.
- **Browser back closes the dialog, it does not leave the site.** `pushState`
  on open, `popstate` closes. On Android the back gesture is how people close
  overlays; without this they leave the page entirely. Guard against stacking
  duplicate entries on re-open.

### Scroll

`Lenis` is configured in `Base.astro` with **`autoToggle: true`**, which stops
and restarts it from the wrapper's `overflow` — the comment there already names
"mobile nav, any modal" as the reason. So **do not call `lenis.stop()` /
`lenis.start()` manually**; set `overflow: hidden` on `<body>` and let the
existing mechanism do it. A manual pair is exactly what that config was written
to avoid, and it can get stuck.

Additionally:

- `overscroll-behavior: contain` on the panel's scroll container, so reaching
  the end of the form does not scroll-chain into the page behind it.
- Preserve and restore the page's scroll position across open/close — iOS
  resets it when `<body>` becomes `overflow: hidden` unless it is pinned.
- Internal scrolling to a step uses the panel's own `scrollTo`, not
  `lenis.scrollTo` (Lenis owns the document, not this container) and not
  `scrollIntoView` (which scrolls the document too).

### Focus and announcement

- On open, move focus to the dialog's **heading** (`tabindex="-1"`), not the
  first input — a screen reader user should hear what this is before being
  dropped into a text field.
- On close, focus returns to the trigger. Native `<dialog>` does this, but only
  when the trigger is still in the DOM — after a view transition it may not be,
  so fall back to a sensible anchor.
- Step changes announce through a polite live region ("Step 2 of 4, what size").
- `aria-labelledby` on the dialog points at that heading.

### Interaction with the rest of the site

- **View transitions (`13`).** Close the dialog on `astro:before-swap`; a
  top-layer element surviving a body swap is undefined behaviour. Re-bind
  listeners on `astro:page-load` without stacking duplicates — the same
  discipline `Base.astro` already applies to Lenis.
- **The onboarding intro (`12`).** If a URL parameter asks for the dialog on
  first load, it must wait for the intro to finish rather than animate over it.
- **Reduced motion** guards the entrance transition, per `CLAUDE.md`.

---

## 5. Photography — the viewport decision

The prototype put a hero photo on all twelve category tiles. That is right on a
wide screen and wrong on a phone, so it is a **breakpoint decision, not a
yes/no**.

| Viewport      | Category picker                             | Why                                                                                                                                                            |
| ------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **≥ 980px**   | **Photo tiles, 4 across**, 4:3              | Plant buyers recognise machines by shape faster than by name. All twelve visible in three rows — one glance.                                                   |
| **600–980px** | **Photo tiles, 3 across**, 16:9             | Still scannable in ~1.5 screens. The shorter crop keeps the grid inside two thumb-scrolls.                                                                     |
| **< 600px**   | **No photos.** Text rows, grouped by family | At ~160px wide a machine photo is decorative, not informative — and twelve of them is roughly 1.5 MB and four screens of scroll before the customer can begin. |

What replaces the photo on mobile is **not nothing** — it is the `rangeLabel`
("10 kVA to 1,250 kVA, diesel"). That string is the actual disambiguator
between a generator and a compressor, and it is text.

Mobile picker row, single column, grouped under five family headings:

```
POWER & AIR
─────────────────────────────────────────
  Generators                          ( )
  10 kVA to 1,250 kVA, diesel
─────────────────────────────────────────
  Air compressors                     ( )
  135 CFM to 1,050 CFM
```

Twelve rows plus five headings ≈ 750px — under two phone screens, everything
reachable by scroll. **Not an accordion.** An accordion hides the thing the
customer is looking for and charges them a tap to find out it was not there.

### Implementation notes for the photos

- Use `<img>` with `srcset`, not a CSS `background-image`. The prototype's
  backgrounds cannot be lazy-loaded, cannot be responsive, and cannot carry alt
  text.
- **In the dialog, all tile images are `loading="lazy"`** and only fetched when
  it first opens — they must not compete with the host page's LCP. This is a
  real advantage the dialog has over a route.
- **Do not use `ParallaxImage` here.** `CLAUDE.md` says every photo uses it and
  no still variant exists — this is the genuine exception, and it should be
  noted there rather than quietly worked around. A selection control that
  drifts while you are trying to click it is a bug, not a detail. Either add a
  `static` variant to `ParallaxImage` or use a plain `<img>` and record why.

---

## 6. Layout inside the panel

### ≥ 1240px — two columns

```
┌─ dialog panel (max 1120) ───────────────────────────────────────┐
│  Request a quotation                                       [✕]  │
├──────────────────────────────────────┬──────────────────────────┤
│  01  What you need                   │  ┌─ sticky ───────────┐  │
│      [ Buy ][ Hire ][ Not sure yet ] │  │ YOUR REQUEST       │  │
│      ┌────┬────┬────┬────┐           │  │                    │  │
│      │ ph │ ph │ ph │ ph │  4 tiles  │  │ Generators         │  │
│      ├────┼────┼────┼────┤  × 3 rows │  │ 250 kVA            │  │
│      │ ph │ ph │ ph │ ph │  + "some- │  │ Hire               │  │
│      ├────┼────┼────┼────┤    thing  │  │ 1–3 months         │  │
│      │ ph │ ph │ ph │ +  │    else"  │  │ Dubai              │  │
│      └────┴────┴────┴────┘           │  │                    │  │
│  02  What size                       │  │ [ Send request ]   │  │
│      ┌──────────────┬──────────────┐ │  └────────────────────┘  │
│      │ 10 kVA  duty │ 20 kVA  duty │ │                          │
│      └──────────────┴──────────────┘ │  (rail ≈ 300px, sticks   │
│  03  The terms                       │   to the panel's scroll) │
│  04  Where to send it                │                          │
└──────────────────────────────────────┴──────────────────────────┘
```

The summary rail is the checkout-summary pattern, and it earns its place for
one reason: **this form collects about fifteen facts, and the customer needs to
see that we understood them before they send.** It also gives the submit button
a home that is always on screen.

It sticks to the **panel's** scroll container, not the page.

### 900–1240px — rail flattens

No room for a 300px rail beside a two-column rating table. It becomes a
horizontal bar pinned to the top of the panel's scroll area:

```
┌─────────────────────────────────────────────────────────────┐
│ YOUR REQUEST  Generators / 250 kVA / Hire / Dubai   [Send]  │ ← sticky
├─────────────────────────────────────────────────────────────┤
│  01  [Buy][Hire][Not sure]                                  │
│      ┌──────┬──────┬──────┐  3 photo tiles, 16:9            │
```

**Inline variant only:** the sticky bar must clear the fixed site header —
`top: var(--spacing-header-gap)`, never `top: 0`. The prototype used `0` and
would have slid under the 80px header. Inside the dialog the header is not a
factor, so `top: 0` within the panel is correct there. Two contexts, two
values — this is the main thing the inline variant must not inherit blindly.

### < 900px — four steps

Rules, each one a bug found in the prototype:

- **Never auto-scroll on load.** The prototype jumped 424px on init and threw
  the headline away before it was read. Scroll only on an actual step change.
- **"Continue" must actually disappear on step 4.** `[hidden]` loses to
  `.btn { display: inline-flex }`; the rule has to be written explicitly.
- **The sticky footer needs bottom padding under the last field**, or it covers
  the final row of whatever step you are on.
- One CTA per screen. Step 4 shows _Send request_, not _Continue_ and _Send_.
- Tap targets ≥ 44px; chips wrap, never scroll horizontally.

---

## 7. Fields — the complete inventory

`*` = required. Anything not on this list is deliberately absent; see §8.

### 01 · What you need

| Field         | Control                     | Notes                                  |
| ------------- | --------------------------- | -------------------------------------- |
| `mode` \*     | 3 pills                     | Buy outright · Hire · **Not sure yet** |
| `category` \* | 12 tiles + "Something else" | See §5 for the per-viewport treatment  |

**"Not sure yet" is restored.** The prototype dropped it, while the section's
own copy says customers move between hire and purchase. Dropping it forces an
undecided buyer to guess, and a guess is worse data than an honest "not sure".
Its terms panel is defined below.

### 02 · What size

| Field         | Control                  | Notes                                                                                                        |
| ------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `rating` \*   | list from `ranges`       | 2 columns ≥900px, 1 below. Row = label + `powerType` + availability pill, `typicalDuty` alongside or beneath |
| `duty` \*     | textarea, conditional    | Appears **only** when "Not sure — size it for me" is chosen                                                  |
| `quantity`    | number, min 1, default 1 | `type="number"`, not the prototype's unvalidated `text`                                                      |
| `attachments` | text, conditional        | Telehandlers, excavators, backhoes, skid steers only                                                         |

**`typicalDuty` is the most valuable text in this form.** "Tower crane plus
offices, no mains supply" is what lets a site manager who does not know kVA
pick 250. It stays at every viewport — second line on mobile, `text-note`.

**Availability labels come from `AVAILABILITY_LABEL[mode]`.** Do not invent a
third vocabulary; mode is known by now, which is the whole point of §3.

**`dutyGuide`** renders as a closed `<details>` beneath the list when the
category has one. Today that is generators alone. It auto-opens when the
customer picks "Not sure — size it for me", which is the one moment it helps.

**`attachments` needs a schema field.** The prototype invented
`attachments: true` on four categories; `content.config.ts` has no such key, so
it must be added to the Zod schema and to `categories.json`, or derived from
`family`.

### 03 · The terms

Three panels, one per mode. Only one is ever visible.

**Hire**

| Field         | Control | Notes                                                                             |
| ------------- | ------- | --------------------------------------------------------------------------------- |
| `startDate`   | date    | **`min` = today.** The prototype accepted dates in the past.                      |
| `duration` \* | 6 chips | Under a week · 1–4 weeks · 1–3 months · 3–12 months · 12 months + · Not fixed yet |
| `emirate` \*  | 7 chips | From the same list `/contact` already uses                                        |
| `transport`   | 2 chips | Deliver to site (default) · We'll collect                                         |

**Buy**

| Field          | Control  | Notes                                                                       |
| -------------- | -------- | --------------------------------------------------------------------------- |
| `condition` \* | 3 chips  | New · Inspected used · Price me both                                        |
| `timeframe` \* | 4 chips  | This week · This month · This quarter · Budgeting only                      |
| `destination`  | 6 chips  | Inside the UAE (default) · Oman · Saudi Arabia · Qatar · Africa · Elsewhere |
| `docs`         | checkbox | "Documentation for finance or insurance"                                    |

Both the export destinations and the finance/insurance documentation are real
services (`services.ts` — `logistics-export`, `equipment-sales`). Choosing any
export destination reveals the note _"Export documentation and handling quoted
with the machine."_

**Not sure yet** — the smallest honest set, so the choice is not a dead end:

| Field          | Control | Notes                                          |
| -------------- | ------- | ---------------------------------------------- |
| `timeframe` \* | 4 chips | Same as Buy                                    |
| `emirate` \*   | 7 chips | Where it would go                              |
| —              | note    | "We'll price it both ways so you can compare." |

### 04 · Where to send it

| Field      | Control  | Notes                                                                                                            |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `name` \*  | text     |                                                                                                                  |
| `company`  | text     | **Optional.** Friction on the final step is where enquiries die, and a one-person contractor is a real customer. |
| `phone` \* | tel      | The trade runs on phone and WhatsApp                                                                             |
| `email`    | email    | Required only when `channel = email`; validated only if filled                                                   |
| `channel`  | 3 chips  | **New.** WhatsApp (default) · Call · Email. One tap, and it decides the handoff — see §12.                       |
| `notes`    | textarea | Placeholder teaches: "Access restrictions, ground conditions, shift pattern, LPO process…"                       |

---

## 8. What this form deliberately does **not** ask

Leaving things out is half the design. Each of these was considered and cut:

| Not asked                                   | Why                                                                                            |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Budget / price range**                    | Collins quotes. Asking the customer to name a number first inverts the transaction.            |
| **Email as a universally required field**   | This trade runs on WhatsApp and phone. Phone required; email required only if they pick email. |
| **"How did you hear about us"**             | Analytics work disguised as a form field. Paid for by the customer, in effort.                 |
| **Job title / company size**                | This is not a SaaS funnel.                                                                     |
| **CAPTCHA**                                 | A honeypot plus a render-time check is enough at this volume; see §12.                         |
| **File upload**                             | It cannot survive the WhatsApp handoff. The note says "send drawings on WhatsApp after".       |
| **A map**                                   | `11` already settled this — static image and a link out, and never inside the form flow.       |
| **Hire fields to a buyer** (or the reverse) | Mode-first makes this automatic. Nobody sees a field that does not apply.                      |

---

## 9. Opening the dialog — triggers and deep links

Two ways in. Both must work.

### (a) In-page triggers — the common path

Any element, anywhere, carries the open attributes:

```html
<button
  data-quote-open
  data-quote-item="generators"
  data-quote-rating="250 kVA"
  data-quote-mode="hire"
>
  Request a quotation
</button>
```

The dialog reads them, pre-answers sections 1 and 2, and **opens on section 3**
with a summary chip at the top:

```
  Generators · 250 kVA · Hire        [ change ]
```

**This is the single largest conversion lever in the feature.** Someone who has
already read a category page and clicked its CTA has answered two of the four
sections; making them answer again is the fastest way to lose them.

`enquireHref()` in `lib/equipment.ts` currently composes a `wa.me` URL and its
own comment anticipates the replacement. It becomes a helper returning these
attributes. Its WhatsApp behaviour stays as the fallback for anything rendered
outside the dialog's reach.

### (b) A URL parameter — what replaces the route

Because the dialog has no route, a link from an email, a WhatsApp message or an
ad has nothing to point at. So the dialog also opens from a query parameter, on
**any** page:

```
/equipment/generators?quote=generators&rating=250%20kVA&mode=hire
/?quote=1
```

And on open via a trigger, `pushState` writes that parameter into the URL. Which
means the link is shareable, the back button closes the dialog, and a refresh
returns you to where you were — the three things the route would have given us,
without the route.

Rules:

- Unknown or malformed parameters are **ignored silently** and the dialog opens
  at section 1. A bad link must never produce an error state.
- A parameter-triggered open on first load waits for the intro (`12`) and the
  arrival reveal (`13`) rather than animating over them.
- On `/contact`, the parameter scrolls to the inline form and pre-fills it
  instead of opening the dialog — same rule as §2.

---

## 10. "I need something else" — three escapes, not one

The prototype had one half-built escape. There are really three, and treating
them as one is the mistake.

### (a) The machine is not one of the twelve

A water pump, a welding set, a concrete mixer, spare parts. This is **not an
error state — it is a service.** `services.ts` sells _sourcing & procurement_:
"specification-led sourcing direct from manufacturers and authorised
distributors when the unit you need is not standard stock."

→ A **thirteenth tile**, last in the grid, visually distinct: no photo, dashed
outline, `+` mark.

```
  ┌ ─ ─ ─ ─ ─ ─ ─ ┐
    +  Something
       else                "We source to spec"
  └ ─ ─ ─ ─ ─ ─ ─ ┘
```

Choosing it **replaces** section 2 with:

- `otherItem` \* — "What do you need?" (text)
- `family` — optional select over the five families, to route the enquiry
- sections 3 and 4 continue unchanged

### (b) The machine is right, no listed rating fits

→ The last row of the rating list: **"Not sure — size it for me."** The
prototype had this row but nothing happened when you picked it, which broke the
headline's own promise ("give us the duty and we'll size it").

It must open a **required** duty field, with a placeholder that teaches:

> _"Powering four site cabins, a welding set and a tower crane. No mains."_

And, where the category has one, auto-open the `dutyGuide`.

### (c) It is not an equipment request at all

Transport only. Spares for a machine they already own. Servicing. Export
handling. **Four of Collins' six services are not equipment supply.**

This must **not** become a "what kind of enquiry is this?" question at the top
of the form — that taxes the ninety percent who want a machine to serve the ten
percent who do not.

→ A persistent, quiet row at the **foot of the panel**:

```
─────────────────────────────────────────────────────────
Not looking for a machine?
Transport & haulage · Spares & servicing · Export · Other
─────────────────────────────────────────────────────────
```

Each links to `/services/<slug>` — **which closes the dialog and navigates**, so
the draft must be saved first (§4). **Other** does not navigate: it swaps the
panel for a compact four-field enquiry (name, phone, what you need, notes).
Same submission path, a tenth of the questions.

---

## 11. Validation and failure

The prototype's worst bug was a silent one: on desktop, submitting with an
incomplete step did nothing at all — no error, no scroll, no message.

| Rule                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Submit always does something.** If invalid: scroll to the first incomplete section, mark it, focus its first control. A no-op is never acceptable.                           |
| **Never disable the submit button** for being incomplete. A disabled button with no explanation is worse than an error message. (In-flight busy state is different — see §12.) |
| Errors appear on submit or on blur — **never on keystroke**.                                                                                                                   |
| Required chip groups (`duration`, `emirate`, `condition`, `timeframe`) carry `aria-required` and a visible marker. The prototype marked none.                                  |
| Mobile _Continue_ validates the current step only, and names what is missing.                                                                                                  |
| The error summary is announced politely; the first invalid control receives focus.                                                                                             |
| Every step is reachable by keyboard; radio groups keep native arrow-key behaviour.                                                                                             |

---

## 12. Submission — build the client, leave the backend unplugged

**Decided: no email/form service is chosen yet. Build the full client path now
against a stable contract, so wiring a backend later is one file and one
environment variable.**

### The shape

One module — `src/lib/quote/submit.ts` — is the only thing that knows how the
request leaves the browser:

```ts
export async function submitQuote(payload: QuotePayload): Promise<SubmitResult>;

type SubmitResult =
  | { ok: true; ref?: string }
  | { ok: false; error: "network" | "server" | "config"; message?: string };
```

Endpoint from `import.meta.env.PUBLIC_QUOTE_ENDPOINT`:

- **unset** (today) → `submitQuote` resolves `{ ok: true }` without a request.
  The WhatsApp handoff is the whole delivery, exactly as now. No regression, no
  dead UI.
- **set** (later) → it POSTs. Nothing else in the feature changes.

### The payload — versioned, machine keys not display labels

The prototype pushed display strings ("1–4 weeks", with an en dash) straight
into a URL. That is fine for a human reading WhatsApp and useless to a backend.
So the composer produces **two** outputs from one state object:

- `toPayload()` → stable keys, for the POST
- `toMessage()` → the human-readable lines, for WhatsApp and for the email body

```jsonc
{
  "v": 1,
  "submittedAt": "2026-08-22T09:14:03.221Z",
  "source": { "page": "/equipment/generators", "variant": "dialog" },
  "request": {
    "mode": "hire", // hire | buy | unsure
    "category": { "id": "generators", "name": "Generators" },
    "otherItem": null,
    "rating": {
      "label": "250 kVA",
      "powerType": "Diesel",
      "availability": "yard",
    },
    "duty": null,
    "quantity": 1,
    "attachments": null,
  },
  "terms": {
    "startDate": "2026-09-01",
    "duration": "1-3-months", // slug, not "1–3 months"
    "emirate": "dubai",
    "transport": "deliver",
  },
  "contact": {
    "name": "…",
    "company": null,
    "phone": "+9715…",
    "email": null,
    "channel": "whatsapp",
  },
  "notes": null,
}
```

`v` is there so a later schema change does not silently corrupt a stored lead.
Both label and key travel for `rating` because the label is the quotable
string.

Hosted services (Formspree, Web3Forms) want flat key/value rather than nested
JSON. Keep a `flatten()` in the same module — swapping to one of them should
not touch the form.

### Order of operations — the popup-blocker trap

`window.open` must fire **synchronously inside the click handler**. Awaiting a
`fetch` first and opening afterwards is blocked by Safari and by Chrome's popup
heuristics. So:

1. Validate.
2. **Open the handoff immediately, in the gesture**, per `channel`:
   - `whatsapp` → `window.open(site.whatsapp.href + ?text=…)`
   - `call` → no window; show the numbers in the success panel
   - `email` → `mailto:` **with the composed body** (see below)
3. Fire `submitQuote()` in parallel with `keepalive: true`, so it survives the
   tab losing focus to WhatsApp.
4. Render the success panel without waiting on the POST.

A failed POST behind a successful WhatsApp handoff is logged and retried once,
not surfaced as an error — the enquiry did arrive. A failed POST with
`channel: call` or `email` **is** surfaced, because nothing else carried it.

**The WhatsApp number comes from `site.whatsapp`** (`971523995373`). The
prototype hardcoded `971544380684`, which is the _call_ line — every submission
would have gone to the wrong number.

**The email path must carry the composed body.** The prototype's fallback is a
bare `mailto:` with nothing in it; after fifteen fields, a desktop visitor
without WhatsApp Web loses all of them. The current `/contact` already
pre-fills the composed enquiry — do not regress that.

### States the form must have

`todo.md` notes the current form has none of these:

| State          | Behaviour                                                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **idle**       | as designed above                                                                                                                                                                   |
| **submitting** | button shows a busy label + `aria-busy`, guarded against double submit. This is the one legitimate reason to disable it.                                                            |
| **success**    | panel body is **replaced** by a confirmation: what was sent, the `ref` if the backend returns one, `site.quotePromise`, and the numbers. Draft cleared. Dialog does not auto-close. |
| **error**      | inline above the submit, **form data intact**, with WhatsApp and phone offered as the manual path. One automatic retry on network error, then manual.                               |

### Spam

No CAPTCHA (§8). A honeypot field plus a minimum render-to-submit interval is
proportionate here, and neither costs the customer anything.

---

## 13. Where the data comes from

**Render the categories server-side from `getCollection("equipment")`.** The
prototype hand-copied the catalogue into a JS array and it had **already
drifted** — "Bobcat / skid steer" against the collection's "Bobcat / skid steer
loaders" — before it was ever reviewed.

Server-side rendering also means section 1 still works if the script fails; a
client-built picker leaves an empty panel.

Only the _ratings_ need to reach the client (68 rows, keyed by category id) —
emit them once as a JSON script tag from the same collection, never as a second
hand-written copy. With two instances possible on one page (§2), emit that data
**once per document** and let both read it.

---

## 14. Visual design — what to keep from the mockup

The prototype is not just a structure; it has a look, and that look is most of
why it reads as a piece of industrial software rather than a contact form. This
section says which of its devices survive, which yield to the design system,
and — the useful discovery — how little actually conflicts.

**The mockup's aesthetic is largely already the house aesthetic.** `global.css`
describes the radius scale as _"near-square corners, everywhere… two rungs and
no more"_ (3px / 5px) and notes that `rounded-full` now means only "a chip or a
dot". `Eyebrow.astro` already renders a square `h-2 w-2` accent bar, exactly
like the prototype's `::before`. So the prototype's squareness is not a
deviation to be sanded off — at 3px it survives essentially intact.

### 14.1 Devices to keep

These are what make it look like the mockup. Losing them means shipping a
correctly-tokenised form with none of its character.

**(a) The hairline mesh.** The single most distinctive device. Selection grids
are one continuous 1px lattice, not separated cards:

```css
/* picker, rating list — global.css `.mesh` */
display: grid;
gap: 1px;
background: #fff;
border: 1px solid var(--color-line);
border-radius: var(--radius-sm);
overflow: clip;
/* the rule is drawn per cell, not by the container showing through the gap */
.mesh > * {
  background: #fff;
  outline: 1px solid var(--color-line);
}
```

**Why the outline and not the container showing through the gap.** Both look
identical when the grid is full, and only the outline survives a grid that is
not: an unfilled cell area has nothing to draw an outline, so it stays white
instead of painting a grey block. That matters because almost nothing here
divides evenly — the picker is thirteen tiles across four, three and two
columns, and seven of the twelve categories have an odd number of ranges.
Counting items and padding the last row per breakpoint is a rule every caller
would have to remember, which is the kind of rule that gets forgotten. An
outline also costs no layout, so it cannot push the lattice out of true.

Cells butt against each other on a shared hairline. This is what makes the
picker read as a **spec sheet** rather than a set of floating cards, and it is
why the form feels like a technical document. Use it for the category picker
and the rating list.

Note it is a deliberate alternative to `.card` (white surface, border,
`radius-md`) — dense selection grids get the mesh, standalone panels get the
card. Do not mix the two inside one step.

**(b) Numbered sections.** `01`–`04` in mono brand, baseline-aligned beside a
large title with a supporting hint beneath. Ties directly to the index-rail
numbering already used on `/equipment`, and `--color-brand` + Geist Mono give
it for free.

**(c) The running spec line.** Slash-separated, greyed until answered, inked
once set:

```
YOUR REQUEST   Generators / 250 kVA / Hire / Dubai
```

Both a visual signature and real feedback — this is the summary rail's
horizontal form (§6) and the mobile-tablet fallback. `global.css` already
assigns mono to "the structural layer", which is exactly this.

**(d) Grayscale photos that colourise on hover and selection.**
`filter: grayscale(1)` → `none`. Cheap, and it makes the grid calm until you
engage with it. **Never the only selection signal** — the tint background and
the filled radio mark carry it for anyone who cannot see the colour shift.

**(e) Hairline-divided sections with generous vertical rhythm.** Steps
separated by a 1px rule with `clamp(44px, 6vw, 96px)` of padding, matching the
site's roomy section rhythm rather than a compressed form.

**(f) Fluid display headings** — `clamp(38px, 5.4vw, 76px)` maps onto the
existing `text-display` / `text-h1` rungs. No new sizes needed.

### 14.2 What re-tokenises

Straight substitutions, no design judgement involved:

| Prototype                       | This codebase                                                          |
| ------------------------------- | ---------------------------------------------------------------------- |
| `#1652F0`                       | `--color-brand` / `--color-brand-bright`                               |
| `#F3F6FF` blue wash             | `--color-brand-tint`                                                   |
| `#E4E7EC` / `#C9CED6` hairlines | `--color-line` / `--color-line-strong`                                 |
| Archivo + IBM Plex Mono         | Geist + Geist Mono (already loaded — do not add a second font request) |
| Hard 0px corners                | `--radius-sm` (3px) — reads as square, stays in the system             |
| Raw px type (`font-size:17px`)  | The text scale — `text-note`, `text-base`, `text-cell`, `text-subhead` |
| `cubic-bezier(.22,.61,.36,1)`   | `--ease-out-expo` / `--ease-in-out-strong`                             |
| Raw durations                   | the duration tokens; no component gets a raw ms value                  |
| `position: sticky; top: 0`      | `top: var(--spacing-header-gap)` — **inline variant only**, see §6     |
| `scrollIntoView`                | the panel's own `scrollTo`; never the document's                       |

One thing yields to the system rather than the mockup:

- **Buttons stay `Button.astro`** — `rounded-md`, mono, sentence case. The
  prototype's full-width uppercase blue slab is close enough that the existing
  `primary` at `size="lg"` covers it.

And one thing was decided the other way on review (2026-08-22), which is worth
recording as a reversal rather than quietly rewriting:

- **~~Availability badges stay `Pill`~~ — they don't.** The original argument
  was that the same badge appears on `/equipment` and every category page, so
  the form should not grow a private variant of it. That reasoning was sound
  and its conclusion still turned out wrong, because the premise changed
  underneath it: §14.3 settled on nothing in this form being rounded at all, so
  a lone `rounded-full` badge inside a square lattice became the very mismatch
  the rule existed to prevent. `RatingList` sets power type and availability as
  **mono tracked caps with a dot** — which is not an invention either:
  `equipment/RangeTable.astro` already renders the same field exactly that way
  on the category pages. The two renderings of these 68 ranges now agree, where
  keeping the pill would have made them diverge. `Pill` itself is untouched and
  still carries every rounded label elsewhere on the site.

### 14.3 Two decisions I cannot take alone — both taken, 2026-08-22

Both were genuine forks where the mockup and the current site disagreed. Both
were built as live variants on `/lab/quote`, reviewed side by side, and
settled. **The losing variant was deleted in each case, not kept behind a
prop** — the whole point of the fork was that the site should have one answer,
and an unused variant is how a second answer creeps back in.

> **Settled: (a) underline. (b) giant type.**
>
> And a third, which only became visible once those two were on screen
> together: **nothing in this form is rounded.** `rule` / `bar` / `segment` /
> `display` are four square chip faces at four scales, all of them the same
> device — text with a rule under it. `rule` is the default. The rounded chip
> is gone from the form (`Pill` still owns every rounded label elsewhere), and
> §14.2's badge decision reversed as a consequence.
>
> What is deliberately kept as a variant palette, because these are different
> jobs rather than competing answers to one: `ChipGroup`'s four faces,
> `ChoiceTile`'s tile/row/expanding/dashed, `RatingList`'s list/grid and its
> three scroll modes.

**(a) Field style — underline or boxed?**

The prototype uses underline-only fields: no border except the bottom, ~17–20px
type, `padding: 14px 0`. The current `/contact` uses boxed `.q-field` — full
border, `radius-sm`, 14px type — and `global.css` explicitly lists "inputs"
under the `rounded-sm` rung, so the design system currently says boxed.

_My recommendation: underline._ This form is the entire subject of its surface,
not a widget in a sidebar, and at 17px+ the underline treatment is markedly
easier to scan and fill. Keep the 14px vertical padding so the tap target stays
~48px — the one real weakness of underline fields on a phone.

**The consequence to accept before choosing it:** the inline variant on
`/contact` uses the same component, so `/contact` changes appearance too and
`.q-field` retires. That is the right outcome — two visually different forms on
one site is worse than either style — but it is a bigger diff than it looks.

_Settled: underline._ `Field.astro` has no `variant` prop; there is one field
style on the site. **The `/contact` consequence above is still outstanding and
lands in slice 7** — until then `.q-field` and the new field style coexist on
different pages, which is the one window where the site really does have two
form languages. Do not let that window stay open longer than the slice.

There is no box around the field and none around the group either: the rule
under the text is the whole affordance, and a bordered container only repeats a
boundary the underline has already drawn.

**(b) Buy / Hire — giant type or pills?**

The prototype renders mode as `clamp(28px, 3vw, 40px)` display type with an
underline that goes brand on selection. §7 of this doc, and `11`, both say
pills.

_My recommendation: giant type, for this control only._ §3 argues mode is the
site's core distinction and the reason it moved to the opening question; giant
type is what gives it that weight, and a one-tap opening gesture is the one
place on the site where a binary choice earns display type. Everything else in
the form stays chips.

Below 600px it steps down to `text-h3` so both options fit side by side, and it
remains a real radio group throughout.

_Settled: giant type._ One correction to the paragraph above, found on review:
"both options fit side by side" was written when the prototype had dropped
"Not sure yet". §7 restores it, so there are **three** options, and below 600px
they wrap to two lines rather than sitting in a row. That is legible and was
accepted — but the sentence was wrong, and a later reader should not take it as
a spec.

### 14.4 Motion

`CLAUDE.md` and `02` govern: no raw durations, no raw easings, and every
animated block honours `prefers-reduced-motion`.

- Step transitions on mobile: the existing reveal distance and
  `--ease-out-expo`, not the prototype's bespoke `rise` keyframe.
- Grayscale→colour and tint fills are transitions, safe under reduced motion,
  but must still route through the easing tokens.
- The dialog entrance is guarded for reduced motion (§4).
- **`data-reveal` does not belong inside the form.** Scroll-reveal on fields a
  customer is trying to fill is the contact page's own stated rule — `11` says
  "a contact page that animates while you fill it in is a contact page that
  annoys people". That applies here.

### 14.5 Reuse

Reuse before writing markup: `Button`, `Pill`, `Icon`, `Eyebrow`, `Section`,
`SectionHeading`. New primitives this feature legitimately needs:

- a **choice tile** (photo + radio),
- a **chip group** (`Pill` is presentational and has no input inside it),
- a **labelled field** (label + control + hint + error, ids scoped per instance),
- the **dialog shell** itself, which should be generic enough that the next
  overlay on this site does not hand-roll a second one.

A fifth turned up during slice 1 that this section had not anticipated:

- a **dropdown** (`ui/Dropdown.astro`). §7 assumed a native `<select>` for the
  family field and §5's mobile picker assumed a plain scrolling list. Once the
  fields went underline, neither worked: a native select's popup is drawn by
  the operating system and cannot be styled at all, so it can never match the
  rest of the form. It is built on `<details>` rather than a hand-rolled
  `role="listbox"` — real disclosure semantics, keyboard operable with no
  script, and the panel is ordinary markup we style like everything else. The
  panel is **in flow**, pushing rather than floating, because inside a
  scrolling dialog panel an overlay has to be positioned against a container
  that clips and scrolls, which is where dropdowns break. Content is a slot, so
  the same shell holds plain options, the category rows, or a whole
  `RatingList`.

---

## 15. Code structure

This feature is the largest single slice of UI on the site — a dialog, an
inline form, four steps, three conditional term panels and a submission path.
Built the way the prototype was, it becomes one 840-line file nobody wants to
open. This section decides how it is broken up.

The goal is narrow and testable: **for any change someone might want to make,
there is exactly one obvious file to open.**

### 15.1 The five layers

The codebase already works this way; this only writes it down.

| Layer                | Where                                 | May contain                            | May **not** contain                          |
| -------------------- | ------------------------------------- | -------------------------------------- | -------------------------------------------- |
| **1 · Facts**        | `content/`, `data/`, `config/`        | plain data                             | markup, logic, conditionals                  |
| **2 · Logic**        | `lib/`                                | pure functions, types, derived strings | DOM, markup, `import.meta.env` beyond config |
| **3 · Presentation** | `components/ui/`, `components/quote/` | markup, styling, props                 | data imports, `getCollection`, copy literals |
| **4 · Composition**  | `pages/`, `sections/`, a feature root | reads data, binds it to components     | markup beyond layout                         |
| **5 · Behaviour**    | `scripts/`                            | event wiring, state, a root element    | `document.*` queries, copy                   |

**The rule that makes it work: only layer 4 is allowed to read data.**
Everything in layer 3 receives it.

This is not aspirational — `components/equipment/` already follows it exactly.
All six of its components import nothing from `data/` or `config/` and take
everything through props, which is why `RangeTable` can render on a category
page, a hub row and (soon) inside this form without being touched. Meanwhile
every file in `sections/` imports data, because that is their job. Copy that
split.

### 15.2 The file tree

```
src/
├── components/
│   ├── ui/                          ← generic, reusable, page-agnostic
│   │   ├── Dialog.astro             modal shell: <dialog>, backdrop, close, focus
│   │   ├── Checkbox.astro           one square box and a label
│   │   ├── Dropdown.astro           <details> shell, underline trigger, slot panel
│   │   ├── ChipGroup.astro          radio group: rule · bar · segment · display
│   │   ├── ChoiceTile.astro         photo + radio selection tile; rows can expand
│   │   └── Field.astro              label + control + hint + error
│   │
│   └── quote/                       ← this feature only
│       ├── QuoteDialog.astro        Dialog + QuoteForm — the global mount
│       ├── QuoteForm.astro          composes the four steps; owns the variant
│       ├── QuoteSection.astro       one numbered section: 01 + title + rhythm
│       ├── QuoteSummary.astro       the rail (≥1240) / sticky bar (900–1240)
│       ├── QuoteProgress.astro      mobile step counter + bar
│       ├── QuoteSuccess.astro       the post-submit panel
│       ├── CategoryPicker.astro     12 tiles + "Something else"
│       ├── RatingList.astro         one category's ranges, as radios
│       └── steps/
│           ├── StepNeed.astro       01
│           ├── StepSize.astro       02
│           ├── StepTerms.astro      03 — renders one of three panels
│           └── StepContact.astro    04
│
├── lib/
│   ├── forms.ts                     `Option` + `scopedId` — generic, not quote-specific
│   └── quote/
│       ├── schema.ts                payload types + field keys — the contract
│       ├── options.ts               every chip list: durations, emirates, …
│       ├── compose.ts               toPayload() · toMessage() · flatten()
│       ├── validate.ts              pure: state → errors
│       └── submit.ts                the only fetch in the feature
│
├── pages/lab/quote.astro            dev-only preview harness (§15.7)
│
└── scripts/quote/
    ├── dialog.ts                    open/close, history, focus, body lock
    ├── form.ts                      state, steps, conditional reveal
    └── draft.ts                     sessionStorage persistence
```

Five of these are new **`ui/` primitives, not quote components** — a chip
group, a choice tile, a labelled field, a dropdown and a modal shell are all
page-agnostic, and `CLAUDE.md` already reserves `ui/` for exactly that. Putting
them in `quote/` guarantees the next feature hand-rolls its own.

`lib/forms.ts` exists for the same reason one rung down. `Option` and
`scopedId` are what every input primitive needs, and neither is specific to
this feature — a `ui/` component importing them from `lib/quote/` would stop
being page-agnostic the moment it did.

**Guard against over-fragmentation:** a file earns its existence when it has a
name someone would search for. If a step component passes ~150 lines it is
doing two jobs; if it is under ~20 it should probably be inlined.

### 15.3 Dumb components — what it actually means here

Three rules, in order of how much damage they prevent.

**(a) No copy literals in a leaf component.** Every label, legend, placeholder
and option list arrives as a prop or comes from `lib/quote/options.ts`. A
component containing the string `"Under a week"` cannot be reused and cannot be
translated, and the person who needs to change that string has to find it.

**(b) No data imports below layer 4.** `CategoryPicker` does not call
`getCollection`. `QuoteForm` receives `categories` and passes them down. This
is what lets the same picker render server-side on `/contact` and inside the
dialog with no branching.

**(c) Options are data, not markup.** This is the single biggest change from
the prototype, so it is worth showing.

The prototype writes each chip by hand — six near-identical lines per group,
across five groups:

```html
<!-- don't -->
<div class="chips">
  <span class="chip">
    <input type="radio" name="duration" id="d1" value="Under a week" />
    <label for="d1">Under a week</label>
  </span>
  <span class="chip">
    <input type="radio" name="duration" id="d2" value="1–4 weeks" />
    <label for="d2">1–4 weeks</label>
  </span>
  <!-- …four more… -->
</div>
```

Four separate problems in there: the option list is welded into markup, the ids
are global and collide across instances (§2), the styling is repeated per
option, and `value` is a display string with an en dash in it that ends up in
the payload (§12).

The same thing as data plus one component:

```ts
// lib/quote/options.ts
export const DURATIONS: Option[] = [
  { value: "under-1-week", label: "Under a week" },
  { value: "1-4-weeks", label: "1–4 weeks" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-12-months", label: "3–12 months" },
  { value: "12-months-plus", label: "12 months +" },
  { value: "not-fixed", label: "Not fixed yet" },
];
```

```astro
<!-- do -->
<ChipGroup
  name="duration"
  legend="How long"
  options={DURATIONS}
  instance={instance}
  required
/>
```

Adding a duration is now a one-line data edit that cannot break markup. The
value is a stable key, so §12's payload is machine-readable for free. The ids
are generated from `instance`, so two forms on one page cannot collide. And
the chip's appearance lives in one file instead of thirty places.

**(d) Variants are lookup maps, not conditionals** — the existing house style,
straight out of `Pill.astro`:

```ts
const tones: Record<NonNullable<Props["tone"]>, string> = { … };
```

**(e) Every component declares a documented `Props` interface** with a
one-line JSDoc per non-obvious prop, defaults in the destructure, and
`class: extra = ""` passthrough. Again, house style — match `Section.astro`.

### 15.4 The state boundary

One owner. `scripts/quote/form.ts` holds the form state for one instance and is
the only thing that mutates it. Components render, they do not decide.

- Each instance gets a root element and an `instance` id. **The script never
  touches `document`** — every query is `root.querySelector`. This is what
  makes two instances on one page safe (§2), and it is not optional.
- Derived strings (`AVAILABILITY_LABEL[mode]`, the summary lines, the WhatsApp
  message) come from `lib/`, never assembled inline in a template or a handler.
- `validate.ts` is pure — state in, errors out, no DOM. That is what makes the
  submit path testable without a browser.

### 15.5 Reuse — what already exists

Check before writing markup, per `CLAUDE.md`:

| Need                   | Use                                                          |
| ---------------------- | ------------------------------------------------------------ |
| Buttons, CTAs          | `ui/Button.astro`                                            |
| The small accent label | `ui/Eyebrow.astro`                                           |
| Availability badges    | `ui/Pill.astro` + `AVAILABILITY_LABEL` / `AVAILABILITY_TONE` |
| Any glyph              | `ui/Icon.astro` (+ `icons.ts`) — never an inline `<svg>`     |
| Category → name, href  | `lib/equipment.ts` `resolveCategories`, `singular`           |

Two existing components sit close to this feature and need a decision each:

- **`equipment/RangeTable.astro`** renders the same 68 ranges — but with an
  enquiry `<a>` per row, where the form needs an `<input type="radio">`.
  Different control, same data. **Do not fold both into one component** behind
  a `control` prop; that produces a component with two personalities. Keep
  `RatingList.astro` separate and share the _derived_ logic (`hasPowerType`,
  `hasDuty`, availability label and tone) through `lib/equipment.ts`, which
  already holds it.
- **`equipment/DutyGuide.astro`** is wanted almost verbatim, but it renders its
  own `<h2>` and "Sizing guide" eyebrow, which are wrong inside a `<details>`
  in a dialog. **Split it**: a presentational `DutyGuideList` (the scenario
  cards) plus the current page-level wrapper. The form wraps the list in its
  own `<details>`. This is the dumb-leaf principle applied to a component that
  already exists.

### 15.6 One place per change

The test for whether this structure worked:

| To change…                              | Open                                         |
| --------------------------------------- | -------------------------------------------- |
| a duration, emirate or condition option | `lib/quote/options.ts`                       |
| any label, legend or placeholder        | `lib/quote/options.ts` (or the step's props) |
| an equipment category or rating         | `content/equipment/categories.json`          |
| how a chip or tile looks                | `ui/ChipGroup.astro` / `ui/ChoiceTile.astro` |
| the order of the four steps             | `QuoteForm.astro`                            |
| which fields a mode shows               | `steps/StepTerms.astro`                      |
| what gets sent                          | `lib/quote/compose.ts` + `schema.ts`         |
| **the backend**                         | `lib/quote/submit.ts` — nothing else         |
| dialog open/close behaviour             | `scripts/quote/dialog.ts`                    |
| a phone number, email, hours            | `config/site.ts`                             |

If a future change needs two of these files open at once, the boundary is in
the wrong place — move it rather than working around it.

### 15.7 Reviewing the UI — the preview route

The UI has to be seen and signed off before it is assembled into a working
form. Two ways to do that, and the choice matters more than it looks.

**Not a standalone HTML file.** `collins-contact-v2.html` is the argument
against it: to render anything it had to hand-copy the catalogue into a JS
array, and that copy **had already drifted** from `categories.json` before
anyone reviewed it. A throwaway mockup also answers the wrong question — you
approve a look, then it is rebuilt with real tokens and real components and no
longer looks like the thing you approved.

**A dev-only preview route, built from the real components.** Same tokens, same
`getCollection` data, same primitives that ship. What you sign off is what
exists. It costs slightly more to first pixel and nothing after that, because
none of it is thrown away.

```
src/pages/lab/quote.astro     dev-only. Delete before launch.
```

Three things it must do:

- **`astro.config.mjs`** — keep it out of the sitemap:
  `sitemap({ filter: (page) => !page.includes("/lab/") })`
- **`<meta name="robots" content="noindex">`** on the page.
- **Launch checklist item** to remove the route and the filter. The build is
  static, so the page emits HTML whether or not it is linked — a
  `import.meta.env.DEV` guard hides the content but the URL still exists.

#### What the preview page renders

Not just "the form". A **comparison harness** — the point is to settle §14.3,
and both answers have to be on screen together to choose between them:

```
/lab/quote
├── Fields          underline variant  │  boxed variant       ← §14.3(a)
├── Mode control    giant type         │  pills               ← §14.3(b)
├── ChipGroup       default · selected · focus · error
├── ChoiceTile      default · hover · selected · no-photo
├── Category picker 4-up  │  3-up  │  mobile text rows        ← §5
├── Rating list     generators (12) · backhoes (2)            ← the extremes
└── Assembled       step 01, inline and in the dialog
```

Rendering the two rating extremes together is deliberate: a list designed
around generators' twelve rows usually looks broken at backhoe loaders' two.

Each block is the real component with different props — which is only possible
because §15.3 made them dumb. If a variant cannot be produced by passing
different props, that is a design defect in the component, and the preview page
is where it surfaces.

#### The review loop

Per `CLAUDE.md` §3: **the user runs the dev server, not the assistant.** Ask
for it (`--host 0.0.0.0` so screenshots through the Playwright container work
at the `devbox` IP), then review at 1440 / 1024 / 390 before asking for a
decision. Build it, show it, get it confirmed, then move on.

#### Build order

Each row is one session. The preview route exists from the first and grows
with each slice.

| #   | Slice                                                        | Reviewable output                     | State          |
| --- | ------------------------------------------------------------ | ------------------------------------- | -------------- |
| 1   | `lib/quote/` contract + `ui/` primitives + **preview route** | the harness above; §14.3 gets settled | **done** 08-22 |
| 2   | `Dialog` + `QuoteDialog` + step 01 assembled                 | open/close, picker, mode              | **done** 08-22 |
| 3   | Step 02                                                      | both rating extremes, duty escape     | **done** 08-22 |
| 4   | Step 03 — three term panels                                  | mode-conditional reveal               | **done** 08-22 |
| 5   | Step 04 + `QuoteSummary` rail                                | the rail at all three widths          | **done** 08-22 |
| 6   | Submit path — compose, states, success/error                 | success and failure panels            | **done** 08-22 |
| 7   | Inline variant on `/contact`                                 | two instances, one document           | **done** 08-22 |
| 8   | Deep links + site-wide triggers                              | the two-step path                     | **done** 08-22 |

#### What slice 1 actually shipped, and what moved

Three things came out differently from the plan above, all of them because the
harness made them visible earlier than expected:

- **`RatingList` came forward from slice 3.** The harness could not settle
  §14.3 without showing the rating list at both extremes, and once the
  component existed there was no reason to build it twice. Slice 3 is now the
  step around it, not the list itself.
- **`ui/Dropdown.astro` was not in the plan at all** — see §14.5 for why the
  native `<select>` stopped being viable the moment fields went underline.
- **`lib/quote/` is complete and typed but entirely unexercised.** `compose`,
  `validate` and `submit` have no caller yet. Slice 6 is the UI and the scripts
  around them, not the logic — that part is written.

#### What slice 2 shipped, and what moved

`ui/Dialog.astro`, `scripts/quote/dialog.ts`, `quote/QuoteDialog.astro`,
`quote/CategoryPicker.astro` and `steps/StepNeed.astro`, mounted once in
`Base.astro` beside `FloatingButtons`. Four things came out differently from
the plan above.

- **`QuoteSection.astro` was not in §15.2's tree.** All four steps want the
  same number, the same rhythm and the same hairline, and below 900px this
  element is the thing `form.ts` will show one at a time — `data-section` is
  that handle. Building it once is what stops four step components each
  growing their own. Same story as `ui/Dropdown.astro` in slice 1.
- **`ChoiceTile` grew `layout="responsive"` and `ratio="step"`.** §5 asks for
  photo tiles above 600px and text rows below, and §15.7 says a variant that
  cannot be produced by passing different props is a design defect in the
  component. It was: `layout` was a fixed choice, so the picker would have
  needed two copies of the markup — which is two radios sharing one `name`,
  where the second silently wins. The step is CSS now, and the breakpoints are
  the site's shared ones (`cmp`, `nav`), the way `RatingList` already sets its
  column counts.
- **The picker groups by family at every width, not only below 600px.** The
  headings only display on a phone, but grouping the tile grid too means one
  order rather than a second one to keep in step with it. Families come out in
  the catalogue's own order because they are ordered by first appearance in a
  `sortOrder`-sorted list — `Power & air, Material handling, Lifting, Access,
Earthmoving`, which is the order §The numbers already names.
- **The history behaviour needed a workaround, and it is worth knowing about.**
  §4 asks that browser back close the dialog, and §9(b) that the state live in
  a URL parameter. The client router listens on `popstate` as well, and treats
  any entry differing in path _or search_ as a different page — so a bare
  `pushState` of `?quote=1` makes the back button re-fetch and re-swap the page
  it is already on, throwing the panel's DOM away on the way past. Its one
  escape hatch is that it ignores a `popstate` whose state is `null`, so the
  entry the dialog is opened over is nulled on the way in and repaired on the
  way out. It is the only place in the feature that knows anything about the
  router's internals; if `ClientRouter` ever changes that guard, this is the
  line that breaks, and the symptom will be a page flash on closing the dialog.

Three things §4 and §9 describe are deliberately still absent, because each
needs something a later slice builds: **draft persistence** (`draft.ts`, slice
6 — until then the dirty guard is armed by any edit inside the panel and
"Discard" resets the form), **pre-answering from `data-quote-*` and from the
parameter's value** (slice 8 — the parameter is written and read, but only as
a flag), and **the "not looking for a machine?" foot row** (§10c), which links
to `/services/<slug>` pages that do not exist yet and which has to save a draft
before it navigates.

#### What slices 3–6 shipped, and the one thing the data got wrong

`steps/StepSize.astro`, `steps/StepTerms.astro`, `steps/StepContact.astro`,
`QuoteForm.astro`, `QuoteSummary.astro`, `QuoteProgress.astro`,
`QuoteSuccess.astro`, `ui/Checkbox.astro`, `scripts/quote/form.ts` and
`scripts/quote/draft.ts`. Both prerequisites below were done first. Five things
are worth recording.

- **A rating's `label` is not unique inside its category, and the whole feature
  assumed it was.** Forklifts list "3 ton" twice — diesel and electric — and
  scissor lifts and boom lifts do the same at "12 m" and "20 m". Keying the
  radios on the label gave two controls the same id, so `<label for>` bound to
  the wrong row and picking the second silently selected the first; the payload
  could not have said which of the two was wanted either. `rangeKey()` in
  `lib/equipment.ts` is now the key — label plus power type, which is the only
  thing that ever separates them — and the quotable label travels beside it in
  the payload, exactly as §12 requires. **Anything that stores a rating stores
  the key, not the label.**
- **Every category's ratings are rendered and eleven are hidden.** All 68 rows
  server-side is about 25KB and it keeps §13's promise that section 02 works
  without the script. The escape hatch, if that weight ever matters, is the
  JSON catalogue the form already emits for the summary — but it is a last
  resort, not a first move.
- **The availability vocabulary is CSS, not script.** Mode is answered after
  the rating lists have been rendered, so `RatingList` renders both readings
  and an ancestor `[data-mode="buy"]` swaps them. No re-render, nothing
  rewritten in JavaScript.
- **`timeframe` and `emirate` live in two panels each.** They are one field
  whatever the mode, so they share a `name` — but a second instance prefix
  keeps their ids unique, and the script re-ticks the visible copy after a mode
  switch so an answer given under one mode is still visibly the answer under
  another.
- **`EMPTY_STATE` now carries the two defaults** (`transport: "deliver"`,
  `destination: "uae"`). It has to: "is this form blank?" is asked against that
  object, and a default that lived only in the markup made a pristine form look
  edited — which armed the dismissal guard on a dialog nobody had touched.

Still open, and deliberately: `PUBLIC_QUOTE_ENDPOINT` is unset, so
`submitQuote` resolves `{ ok: true }` without a request and the WhatsApp
handoff is the whole delivery — which is §12's supported state, not a gap. The
"not looking for a machine?" foot row (§10c) still waits on `/services/<slug>`
pages that do not exist.

#### What slices 7–8 shipped, and the one thing left open

`/contact` renders the form inline and `.q-field` is gone from it;
`quoteTrigger()` in `lib/equipment.ts` puts the open attributes on every quote
CTA on the site; `dialog.ts` reads them and the URL, and `form.ts` turns them
into answered questions.

- **`/contact` was restructured, not just re-skinned.** The form needs the full
  width — above 1240px its summary is a real second column — so the contact
  methods moved from a sticky left rail to a band across the top. The page's
  own hairline head (`REQUEST A QUOTATION` over a rule that starts brand and
  stops) is the dialog's head device at page scale, so the two mounts read as
  one thing seen twice.
- **Two instances now genuinely coexist on `/contact`** — the inline form plus
  the dialog still mounted from `Base`. 404 generated ids, no collisions, two
  independent drafts. Every shortcut §2 warned about would have shown up here,
  and none did.
- **The pre-answered chip is a phone device only.** §9a asks for
  "Generators · 250 kVA · Hire [change]" at the top. Above 900px the summary
  rail already says exactly that, so the chip only renders below it — two
  summaries of one request is one too many.
- **A rating can be deep-linked by key or by label.** §9's own example is
  `rating=250%20kVA`, a label, while the radios are keyed on `rangeKey()`.
  Both resolve. A label matching two ranges (forklifts have two "3 ton")
  resolves to the first, which beats refusing a link somebody wrote by hand.
- **Triggers keep their `href`.** Every one is still a working link — to
  `/contact`, or to WhatsApp on the category pages and rating rows — so the
  CTA does something useful with no JavaScript, and the dialog is the better
  answer when it can be.

#### The third form, and why it went

`sections/ContactCTA.astro` carried a mini-form this document never accounted
for. It was removed on review (2026-08-22), and the reasoning is worth keeping
because the same argument applies to the next one somebody is tempted to add:

**It asked for more and collected less.** It required an email §8 deliberately
makes optional, split the name in two where §7 asks for one and makes company
optional, never asked the size — the single most useful fact for producing a
quotation — and never asked the emirate. It offered "Buy or rent" as two
options, where the site says _hire_ everywhere and §7 restores a third answer
because customers move between the two. Its WhatsApp message was a different
shape again, so the yard read two lead formats. It had no validation, no
success and no error state.

Against that, keeping it saved exactly one click — and not even a navigation,
since the dialog opens in place. Its own submit opened WhatsApp in a new tab,
so it did not complete on the page either.

**What replaced it is the form's opening question, asked on the homepage.** Buy
outright / Hire / Not sure yet as three links in the `display` face, which is
the same device the form opens with, reading from the same `MODES` — the
homepage cannot word the question differently to the form it opens. One tap
arrives at the machine picker with section 01 already half answered. The
alternative considered and rejected was a two-field name-and-phone teaser: it
is a second lead shape with no machine and no size, which is the exact thing
this document exists to prevent, and being the easy path it would have
cannibalised the form built to stop it.

`.q-field` is now gone from the codebase. There is one field style on the site.

#### Two prerequisites that block later slices

Both are small, both were found during slice 1, and both are cheaper to do at
the top of a session than in the middle of one:

- ~~**`attachments` needs a schema field** (§7).~~ **Done.** An explicit
  `attachments: z.boolean().default(false)`, true on telehandlers, excavators,
  backhoe loaders and skid steers. Deriving it from `family` was considered and
  does not work: telehandlers and forklifts are both material handling and only
  one of them takes attachments.
- ~~**`DutyGuide.astro` needs splitting** (§15.5).~~ **Done.**
  `equipment/DutyGuideList.astro` holds the scenario cells and takes a
  `surface` prop — `card` on a category page, `mesh` inside the form's
  `<details>`, because `global.css` is explicit that the two are not mixed
  inside one step.

Slice 7 is deliberately late: once two instances coexist, any shortcut taken
around §2's id scoping shows up immediately — which is exactly when you want to
find it, not after launch.

---

## 16. Parked

**Operated hire.** The prototype asks whether Collins or the customer supplies
the operator, and states _"Lifting work ships with licensed operators and
rigging crew."_ Nothing in the project data supports this — `services.ts`
offers _operator handover_, which is training at handover, not operated hire.
**Not built.** If the client later confirms they sell it, the field belongs in
the Hire panel, and the labels must read from the customer's point of view:
**"Collins supplies one" / "We have our own"**. The prototype's "Supplied by
you" carried the value "Operator supplied by Collins" — exactly backwards, and
it would have mis-ordered operators.

**The backend.** §12 builds the client against a contract; picking the service
is still open in `todo.md`.

---

## 17. Bugs from the prototype that must not survive the port

Verified in a browser at 1440px and 390px:

1. **Category tiles render with no image at all** — `.tile__media` and
   `.tile__body` are `<span>`s and the CSS never sets `display:block`, so the
   media box measures 0×17px. Moot if we use `<img>`, as §5 requires.
2. **Desktop submit is a dead button** when any earlier step is incomplete —
   the recovery path is guarded behind the mobile media query.
3. **"Continue" stays visible on mobile step 4**, beside "Send request".
4. **Mobile auto-scrolls 424px on load**, discarding the headline.
5. Double-tapping Continue leaves it permanently reading "Pick a machine first".
6. **The WhatsApp number is wrong** — `971544380684` (the call line) instead of
   `site.whatsapp` `971523995373`. Never hardcode it; read `site.ts`.
7. Hero image paths are missing their leading `/` — all twelve would 404.
8. Hardcoded element ids throughout, which cannot survive two instances (§2).
9. Operator chip labels are inverted (§16).
