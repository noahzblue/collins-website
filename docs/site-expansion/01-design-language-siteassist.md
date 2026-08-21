# 01 — What siteassist.com actually does

_Audited 2026-08-21 from the live pages **and their source**: `/`, `/platform`,
`/solutions`, `/about`, `/case-studies/m3-motorway`. Every technique below was
read out of their markup or inline scripts, not guessed from a screenshot._

Their stack, for context: Webflow + **GSAP 3.15** (ScrollTrigger, SplitText,
CustomEase, MorphSVG) + **Lenis 1.2.3** smooth scroll + **Swiper 11** +
Finsweet Attributes. Roughly 1,100 lines of hand-written inline JS on top.

**We are not porting their stack wholesale — we're porting the _ideas_, plus one
library.** Section 3 below says which ones, and `02-motion-system.md` says how.

The standing policy for this site: **Lenis for smooth scroll, everything else in
plain CSS and vanilla JS.** Another library goes in only when you decide a
specific effect is worth it — not by default, and not because a technique was
first seen implemented with one.

---

## 1. The thirteen techniques

### 1.1 Section-driven theme inversion — _the single biggest thing_

Every section carries `data-next-theme="dark|light|transparent"`. A scroll
listener finds whichever section crosses the top of the viewport and writes that
value onto `<body data-theme-status>`. All theming is then plain CSS:

```css
[data-theme-status="light"] {
  background: white;
}
[data-theme-status="light"] [data-section-nav],
[data-theme-status="light"] [data-section-nav] a {
  color: #000;
}
[data-theme-status="dark"] [data-section-nav] {
  background: rgba(0, 0, 0, 0.5);
}
```

The **page background and the floating nav invert together** as you scroll past a
dark band. It's why the site feels like one continuous object rather than a
stack of cards. It costs one attribute per section and ~30 lines of CSS.

> Collins already does half of this: `Header.astro` flips `data-tone` from
> `glass` to `solid` once you clear the hero. But it only knows about _the hero_
> (`hero.offsetHeight - 84`). Generalising that one listener to read
> `data-next-theme` off any section is a small change with a large payoff — see
> `02`.

### 1.2 Attribute-driven global parallax

One init function, zero per-component JS:

```html
<div
  data-parallax="trigger"
  data-parallax-start="20"
  data-parallax-end="-20"
  data-parallax-scrub="true"
  data-parallax-disable="tablet"
>
  <img data-parallax="target" />
</div>
```

Defaults are `20% → -20%` on `yPercent`, scrubbed, `top bottom → bottom top`,
with `gsap.matchMedia()` for per-breakpoint disabling and `clamp()` on the
ScrollTrigger start/end so nothing pops at the top of the page.

> Collins has the better version of this already. `ParallaxImage.astro` uses
> **CSS `animation-timeline: view()`** — no scroll listener, no rAF, no per-element
> JS. Keep ours: it survives Lenis untouched, because Lenis animates the _real_
> document scroll position rather than transforming a wrapper, so scroll-driven
> CSS animations, `position: sticky` and `IntersectionObserver` all keep working.
> What we're missing is the _habit_: they parallax roughly 20 elements per page;
> we use it in one place.

### 1.3 The tab system with an autoplay progress bar

The pattern on their home + `/platform` "Modules": a vertical list on the left,
a synced image on the right. The **active row expands its description**
(`height: 0 → auto`), and a **1px bar under the active row fills left-to-right
over 5 seconds** and then advances to the next tab. Hovering or clicking takes
over. Crucially:

```js
ScrollTrigger.create({
  trigger: wrapper,
  start: "top 80%",
  once: true,
  onEnter: () => switchTab(0),
});
```

— the rotation **does not start until the block is on screen**, so you never
arrive at a section mid-cycle. Outgoing visual leaves with `autoAlpha: 0,
xPercent: 3`; incoming arrives from `xPercent: 3`. 0.3s, `power3`.

They also ship a mobile variant that **predicts the collapse** of the outgoing
row and subtracts its height from the scroll target before scrolling, so tapping
row 4 doesn't jump you past it.

> Collins has `rotator.ts` doing the state half of this (auto-advance, hover
> pause, reduced-motion hold). Missing: the **progress bar as the timer** — the
> single detail that makes an auto-rotating panel feel intentional instead of
> twitchy — and the **start-on-scroll** guard. Both are ~15 lines in `02`.

### 1.4 The "follower" list — numbered rows, one shared image

Their homepage Solutions list: nine numbered rows (`01`…`09`), and **one
preview image container**. Hovering a row scales its image to 1:

```css
@media (min-width: 992px) {
  .solutions-item:hover .solutions-img {
    transform: scale(1);
    transition-duration: 600ms;
  }
}
```

Nine list items, one visual slot, no grid of nine thumbnails. It's a dense index
that still gets to show photography. Desktop-only by design; on mobile it
degrades to a plain list.

> **This is the pattern our `/services` page should use** for the six
> capabilities, and `/industries` for the eight sectors.

### 1.5 Sticky media beside scrolling text

`data-sticky-feature-visual-wrap` — the module image pins while the text column
scrolls past it. Used on `/platform`. Cheap, and it's what stops a six-item
feature list from reading as a six-item feature list.

### 1.6 The solutions page: a sticky numbered side-nav with scroll-spy

Nine numbered nav items pinned beside nine content blocks, ScrollTrigger keeping
the active one lit, and click handlers that split desktop/mobile behaviour:

- **desktop** — `lenis.scrollTo(target, { duration: 1.5, easing: easeInOutCubic })`,
  and the nav state is _not_ set on click; ScrollTrigger lights each item as you
  pass it, so you watch the index progress 1→2→3 as you travel.
- **mobile** — instant jump (`immediate: true`), nav state set immediately, and
  the horizontal nav strip scrolls to centre the active chip.

> Collins already has this: `CategoryIndex.astro` on `/equipment`, using
> IntersectionObserver with `rootMargin: "-45% 0px -45% 0px"`. **Generalise it
> into `ui/IndexRail.astro`** and `/services`, `/industries`, `/about` all get it
> free. See `02`.

### 1.7 Scroll-direction-reactive marquee

The logo marquee runs continuously, and a ScrollTrigger `onUpdate` **inverts its
direction when you scroll up** (`animation.timeScale(-dir)`), plus a scrubbed
`x: ±scrollSpeed vw` shove on top. It's a small thing you feel rather than
notice.

> Collins' `PartnerStrip.astro` already has a `marquee` variant in the hero base
> panel. Direction inversion is optional polish, not a priority.

### 1.8 SplitText line-mask heading reveals

Headings are split into lines, each wrapped in a mask, each rising in on scroll.
Their CSS hints at the fiddly part they had to fix:

```css
.gsap_split_line {
  padding-right: 0.1em !important;
} /* stop clipping */
.gsap_split_line.gsap_split_line1-mask {
  text-indent: 0.675em !important;
}
```

> Worth having, **not** worth GSAP + SplitText (~40kb) for. `02` specifies a
> CSS-only two-line-mask version for section headings only.

### 1.9 Attribute-driven CSS accordions

JS toggles one attribute; CSS does everything else:

```js
singleAccordion.setAttribute(
  "data-accordion-status",
  isActive ? "not-active" : "active",
);
```

with `data-accordion-close-siblings="true"` opt-in. No height measuring, no
inline styles.

> Collins' `Services.astro` already uses the better modern idiom for this —
> `grid-template-rows: 0fr → 1fr` with `overflow: hidden`. Keep ours.

### 1.10 Fade-crossfade testimonial slider

Swiper with `effect: "fade"`, `crossFade: true`, `loop`, `grabCursor`, arrows
mounted _outside_ the slider. No slide-in, no scale, just a crossfade — which is
why a 30px pull quote can rotate without the layout jumping.

> Ours (`Testimonials.astro`) already stacks slides in one grid cell for exactly
> this reason. Parity.

### 1.11 The technical-detail garnish

Their hero carries coordinates: `51.8652ºN, 0.3915ºW`. There's a
`blinking-dot` component, numbered indices everywhere, mono labels, hairline
dividers, a `spacer` component with variants. It's the "instrument panel"
register — it signals _engineering_ without saying the word.

> Collins already does this well: the hero prints `25.1776º N 55.3488º E`, and
> there's a pulsing `status-dot`. **This is our strongest existing overlap with
> the reference** — lean into it on the new pages.

### 1.12 Lenis smooth scroll, everywhere

`new Lenis({ autoRaf: true, lerp: 0.6 })`, stopped when the demo modal opens,
restarted on Escape. Their parallax defaults are tuned for it ("our default is
`true` because that feels nice with Lenis").

> **We're taking this one.** It is the single library in the plan, and it is the
> right one to spend on: smooth scroll is the effect you cannot fake in CSS, and
> it's most of why their pages feel weighted rather than snappy. It also plays
> well with what we already have — Lenis drives the real scroll position, so
> `ParallaxImage.astro`'s `animation-timeline: view()`, every `position: sticky`
> column and every `IntersectionObserver` continue to work unchanged.
>
> Four things it costs us, all handled in `02 §Primitive 0`: it must be disabled
> under `prefers-reduced-motion`; it must be a singleton across `ClientRouter`
> navigations or the rAF loops stack; `html { scroll-behavior: smooth }` in
> `global.css` has to give way to it; and nested scrollable elements need
> `data-lenis-prevent` — which is exactly why the reference uses that attribute
> five times.
>
> Note their `lerp: 0.6` is a **fast** setting (higher lerp = less smoothing;
> the library default is `0.1`). Start near theirs — heavy smoothing on a site
> people are scanning for spec ranges reads as lag, not luxury.

### 1.13 Structure of an inner page — the repeated skeleton

Every one of their inner pages is the same five beats:

```
1. Full-bleed photo hero    — one word or short phrase + one sentence of intent
2. The index                — numbered list of what this page contains
3. The blocks               — one per index item, alternating, sticky media
4. Proof                    — testimonials / logos / certifications
5. "Let's talk"             — one heading, one button, then footer
```

`/solutions` = hero + 9 numbered blocks + quotes + CTA. `/platform` = hero + 6
tabbed modules + 4 benefit cards + mobile section + quotes + CTA. `/about` =
hero + philosophy + 5 accordion departments + CTA.

**The closing CTA is identical on every page.** That consistency is doing real
work: you always know where the page ends and what it wants.

---

## 2. What makes it feel expensive (the non-animated half)

The user asked specifically about creativity _with and without_ animation. Most
of siteassist's quality is in the static layer:

| Device                                   | What it does                                                                                                                |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Numbers on everything**                | `01`–`09` on solution rows, modules, sections. Turns a list into an index; tells you how much is left.                      |
| **One idea per screen**                  | Their feature blocks are ~500px of whitespace + one image + 40 words. Never two ideas side by side.                         |
| **Mono for structure, sans for reading** | Buttons, nav, labels, numbers, quotes = Geist Mono. Paragraphs = Geist. Collins already ported this (`geist-type-port.md`). |
| **Sentence-case, short headings**        | "Modules". "How We Help". "Let's talk". Never a heading that explains.                                                      |
| **Photography does the selling**         | Real site photography with UI overlays. Every image is _their product in the field_, never stock abstraction.               |
| **Zero shadows**                         | Hairline borders and background steps only.                                                                                 |
| **Alt text is written properly**         | Their `alt` strings are 200+ characters and descriptive. It's a tell for how much care the build got.                       |

---

## 3. The verdict — what we take, what we skip

| Technique                              | Take?                        | Why                                                                                                   |
| -------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1.1 Section theme inversion            | ✅ **yes, priority**         | biggest cohesion win; we're 60% there already                                                         |
| 1.3 Tab progress bar + start-on-scroll | ✅ **yes**                   | 15 lines onto `rotator.ts`                                                                            |
| 1.4 Numbered follower list             | ✅ **yes**                   | this is `/services` and `/industries`                                                                 |
| 1.5 Sticky media column                | ✅ **yes**                   | pure CSS `position: sticky`                                                                           |
| 1.6 Sticky index rail w/ scroll-spy    | ✅ **yes**                   | already built for `/equipment`; generalise it                                                         |
| 1.8 Line-mask heading reveal           | ✅ CSS-only version          | not worth GSAP SplitText                                                                              |
| 1.11 Instrument-panel garnish          | ✅ **yes**                   | our strongest existing match                                                                          |
| 1.13 The five-beat page skeleton       | ✅ **yes, as law**           | every new page in `06`–`11` uses it                                                                   |
| 1.2 Attribute parallax                 | 🟡 ours is better            | use `ParallaxImage.astro` more often                                                                  |
| 1.7 Marquee direction inversion        | 🟡 optional                  | nice-to-have, low value                                                                               |
| 1.9 Accordion via attribute            | ❌ ours is better            | `0fr → 1fr` grid trick already in `Services.astro`                                                    |
| 1.10 Swiper crossfade                  | ❌ already have it           | `Testimonials.astro`, no library                                                                      |
| 1.12 Lenis smooth scroll               | ✅ **yes — the one library** | the one effect CSS can't fake; leaves our scroll-driven CSS working                                   |
| GSAP / ScrollTrigger                   | ❌ **not now**               | ~90kb for effects we can do in CSS + IntersectionObserver. Revisit only if a specific effect earns it |

**Net new dependencies: one — Lenis.** Everything else in the ✅ column is CSS
and vanilla JS. If a future effect genuinely needs a library, that's a call to
make deliberately, one effect at a time.

---

## 4. Where Collins should _not_ copy them

siteassist sells SaaS to safety managers. Collins sells and hires machines to
site managers. Three deliberate divergences:

1. **They can be abstract; we can't.** Their hero says "Total Control of
   High-Risk Work". Ours has to say what's in the yard and how fast it leaves.
   Every Collins page needs a **number, a range, or a date** above the fold —
   `10 kVA to 1,250 kVA`, `Mon–Sat 8:00–18:30`, `same working day`.
2. **They have no price-adjacent CTA; we need one everywhere.** Their global CTA
   is "Request a demo". Ours is **"Request a quote"** plus a **WhatsApp** path —
   in the UAE plant trade, WhatsApp _is_ the enquiry channel. That's already in
   `FloatingButtons.astro`; every new page must keep it reachable.
3. **They have four case studies; we have none yet.** Don't build the
   testimonial/logo furniture until there's something real to put in it. See
   `10-page-projects.md`.
