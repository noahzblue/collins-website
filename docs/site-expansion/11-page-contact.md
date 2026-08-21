# 11 — `/contact`

**Phase 2** — needs two decisions (form backend, map embed), no new copy.

`ContactCTA.astro` stays on the homepage as the short version. This is the full
one: three numbers, two locations, real hours, and a form that asks the right
question.

---

## Why the anchor isn't enough

`/#contact` gives one phone number, one address, and a form whose only label is
"Request a quote — we reply within one business day." The profile gives three
numbers, two locations, a licence register, Mon–Sat hours, and a far better
prompt:

> Send us the machine, the duty and the dates, or just describe the job and we
> will specify it for you. **Quotations are issued the same working day wherever
> possible.**

"Within one business day" vs "the same working day" — the site is currently
promising _less_ than the company does.

---

## Layout

```
1  Header        no photo banner — this page should feel like a desk, not a brochure
                 h1 "Let's talk about your next project."  + the p.9 paragraph
2  Split         methods left (sticky) · form right
3  Locations     two cards — office and yard — with a map
4  Hours + legal Mon–Sat 8:00–18:30 · register · licensing authority
```

Deliberately **no `PageBanner`** here. Every other new page opens on a full-bleed
photo; the contact page opening straight into content signals "this is the
functional one" and gets the form 400px higher up the page.

## 2. Methods + form

**Left column, sticky** (`top-header-gap`), reusing the method-row pattern
already in `ContactCTA.astro` — icon square in `bg-brand-tint`, label, value:

|              |                                                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Call**     | +971 54 438 0684 · +971 52 399 5373 · +971 50 913 2703 — three separate `tel:` rows, not a dropdown                                 |
| **WhatsApp** | `site.whatsapp.href` — **give this the most visual weight.** In the UAE plant trade WhatsApp is the enquiry channel, not a fallback |
| **Email**    | info@collinscouae.com                                                                                                               |
| **Office**   | Ras Al Khor 2, Dubai                                                                                                                |
| **Yard**     | Sajjah, Sharjah                                                                                                                     |
| **Hours**    | Monday to Saturday, 8:00 am – 6:30 pm                                                                                               |

**Right column, the form.** Fields, in the order the profile's prompt implies —
machine, duty, dates:

```
Name*                     Company
Phone*                    Email
Equipment category*  ▾    (the 12, from the collection — already wired
                           in ContactCTA.astro; reuse that)
Buy or hire*         ▾    Buy outright · Hire · Not sure yet
Duty / spec               "500 kVA, continuous, low noise"
Dates                     from → to
Delivery location    ▾    the 7 emirates
Message
                          [ Send enquiry ]
    Quotations are issued the same working day wherever possible.
```

Two things worth building here:

- **"Buy or hire" as a segmented control, not a select.** It's the site's core
  distinction (`05 §3`) and putting it in a dropdown hides it. Three pills,
  `Pill.astro` already exists.
- **The placeholder text should be a real spec.** `"500 kVA, continuous duty,
low noise"` teaches the customer what to write far better than
  `"Enter details"`.

**Decision needed — form backend.** Today `ContactCTA.astro` composes a WhatsApp
message and opens it; the fields already carry real `name`/`required`
attributes so a POST endpoint can drop in without markup changes. Options:

| Option                                        | Trade-off                                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Keep WhatsApp-only**                        | zero infra, matches how the trade works, but no record in an inbox and it fails on desktop without WhatsApp Web          |
| **WhatsApp + email fallback** _(recommended)_ | primary button opens WhatsApp; a secondary submit POSTs to a form service (Formspree/Web3Forms) so there's a paper trail |
| **Real endpoint**                             | needs a server or a serverless function; the site is static today                                                        |

## 3. Locations

Two cards side by side — **office** and **yard** — each with address, what
happens there, and a "Directions" link to Google Maps. `site.geo` already holds
head-office coordinates; the yard needs its own pair.

The distinction is worth spelling out, because it's a real question a customer
has:

> **Ras Al Khor 2, Dubai** — head office. Commercial, quotations, accounts.
> **Sajjah, Sharjah** — the yard. Stock, workshop, collection and dispatch.

**Map:** one embed, not two. Recommend a **static map image with a link out**
rather than an interactive iframe — Google Maps embeds are ~900kb, set third
party cookies, and are the single heaviest thing that would be on this site.

## 4. Hours + legal

A closing hairline band, mono:

```
MONDAY TO SATURDAY · 8:00 AM – 6:30 PM
COLLINS EQUIPMENTS SALES & RENTAL L.L.C · REGISTER 2766346
LICENSED BY THE DUBAI DEPARTMENT OF ECONOMY & TOURISM
```

---

## Motion

Almost none, on purpose. A contact page that animates as you try to fill it in
is a contact page that annoys people. One `data-reveal` on the header, sticky
left column, and that's it. **No parallax, no rotation, no reveals on the form
fields.**

---

## Files

```
src/pages/contact.astro           new
src/config/site.ts                + phones[], yard address + geo, register,
                                    licensingAuthority; hours → Mon–Sat
src/components/ui/ContactRows.astro  reuse
src/components/sections/ContactCTA.astro  edit — see 05 §9
```

`site.ts` is documented as the single source of truth, so **every one of these
facts lands there once** and the homepage CTA, footer, floating buttons, contact
page and JSON-LD (`04`) all read from it.

## Definition of done

- [ ] All three phone numbers, each a working `tel:`
- [ ] Hours say **Mon–Sat** everywhere on the site, not just here (`03 §A1`)
- [ ] Form's promise matches the profile: **same working day**, not "one business day"
- [ ] WhatsApp path works on desktop and mobile
- [ ] Both locations present, distinguished, with directions
- [ ] No 900kb map iframe
- [ ] `/ponytail-review` run on the diff — every finding applied, or a written reason it wasn't
