# 02 — The motion & interaction system to build

Build this **before** the new pages. Every page spec in `05`–`11` assumes these
exist and names them, and `12` (the logo intro) and `13` (the page transition)
both build on Primitives 0 and 2. **One dependency — Lenis — plus six primitives**, roughly
250 lines of new code total.

## Rules that apply to all of it

1. **Lenis is the one library; everything else is CSS and vanilla JS.** Smooth
   scroll is the effect CSS genuinely can't fake, so it earns its keep. The rest
   uses CSS scroll-driven animations (`animation-timeline: view()`, already
   proven in `ParallaxImage.astro`) and `IntersectionObserver` where CSS can't
   reach — **no GSAP, no ScrollTrigger, no Swiper.** If a later effect really
   needs a library, that's a deliberate call on that one effect, not a change of
   default. Don't reach for a package because the reference implementation used
   one.
2. **The client router is on.** Every script initialises inside
   `document.addEventListener("astro:page-load", …)` and tears itself down on
   swap — use the existing `@/scripts/untilPageSwap` helper, as
   `Header.astro` does. A script that only runs on `DOMContentLoaded` will be
   dead after the first in-site navigation.
3. **`prefers-reduced-motion` is not optional.** `rotator.ts` already handles it
   correctly (holds still, no timer at all). Every new primitive matches that
   bar: motion is removed, **content is never hidden**.
4. **Nothing may be invisible without JS.** Reveal animations start from
   `opacity: 1` and are _set_ to hidden by the observer script on init — so if
   the script never runs, the page is simply un-animated rather than blank.

---

## Primitive 0 — Lenis smooth scroll (the foundation) — **shipped**

**Status: done (2026-08-21).** `lenis@1.3.26` is a real dependency, initialised
once in `Base.astro`, and `bun run check` is back to 0 errors. What follows is
the record of why it is wired the way it is — read it before changing any of
those options.

It used to be pulled from unpkg via a plain `<script src>` in `<head>`, which was
render-blocking on every page, added a third-party runtime dependency, and left
`Lenis` as an untyped global (that was the single error `bun run check` reported).
It is now bundled, versioned, typed, and makes no external request.

```astro
<!-- Base.astro, after <ClientRouter />. Deliberately NOT `data-astro-rerun`. -->
<script>
  import Lenis from "lenis";
  import "lenis/dist/lenis.css";

  const lenis = new Lenis({
    autoRaf: true,
    anchors: { offset: -104 },
    autoToggle: true,
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
    lerp: 0.55,
  });

  document.addEventListener("astro:after-swap", () => {
    lenis.resize();
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  });
</script>
```

### The five things that would have bitten

**a) Reduced motion is already handled — don't hand-roll it.** Lenis's
`respectReducedMotion` **defaults to `true`**: it forces `lerp: 1` so scroll
tracks the input device 1:1 and makes programmatic scrolls instant. So the rule
here is only _don't turn it off_ — which is why it is not in the options above.
This is the one primitive where we do **less** than the rest of the system.

**b) It must be a singleton across `ClientRouter` navigations.** A second Lenis
stacks a second rAF loop and the page scrolls at double speed — easy to ship,
confusing to find. The guard is that the `<script>` carries **no**
`data-astro-rerun`, so the router runs it once per document and never again on a
swap. Don't add the attribute "for consistency" with the other component scripts.
On `astro:after-swap` we only re-measure and adopt the position the router
restored — `scrollTo(window.scrollY, { immediate: true })` rather than
`scrollTo(0)`, so a back-navigation still lands where it should and nothing
animates a slide from the old page's offset.

**c) `html { scroll-behavior: smooth }` is gone from `global.css`.** It fought
Lenis for control of anchor jumps; Lenis's own stylesheet overrode it via
`html.lenis-smooth`, so the behaviour depended on which stylesheet won.
**`scroll-padding-top: var(--spacing-header-gap)` stays** — different mechanism,
still useful for no-JS landings and browser find-in-page.

**d) `anchors: true` is not enough — it needs the header offset.** The bare
`true` form scrolls the target to `y = 0`, i.e. underneath the 80px floating
header, and `scroll-padding-top` does **not** rescue it because Lenis does its own
scrolling and never reads it. Hence `anchors: { offset: -104 }` —
`--spacing-header-gap`. Every homepage anchor (`/#equipment`, `/#services`,
`/#contact`) and every `IndexRail` click goes through this path. **If the header
height token ever changes, this number has to change with it.**

**e) Nested scrollers.** Any element with its own scrollbar — the mobile index
chip strip (§Primitive 3), the yard gallery rail (`09 §4`), a mobile nav panel —
would otherwise have its wheel events swallowed by the page. `allowNestedScroll:
true` is set globally; `data-lenis-prevent` on the element is the per-case escape
hatch if one of them still misbehaves.

### The options, and why each one is there

- **`autoToggle: true`** starts and stops Lenis from the wrapper's `overflow`
  property, which covers the mobile-nav / modal / page-transition case
  declaratively — set `overflow: hidden` on `body` and Lenis stands down. It is
  what `13 §Implementation b` relies on, and it is why there is no manual
  `stop()`/`start()` pair that could leave the page frozen.
- **`stopInertiaOnNavigate: true`** kills momentum when an internal link is
  clicked. Necessary with `ClientRouter` — inertia carrying into a swapped page is
  exactly the jump the router exists to prevent.
- **`naiveDimensions`** — **off**, and it was on in the CDN version. Lenis's own
  typings flag it as having a performance impact; it is a workaround for wrong
  dimension calculation, not a default.
- **`lerp: 0.55`** — the library default is `0.1` and **higher = less smoothing**.
  This site is scanned for spec ranges and availability; heavy smoothing on that
  reads as lag. Tune it live on the `/equipment` hub — the longest scroll on the
  site is the honest test.

### What Lenis does _not_ change

Everything in Primitives 1–6 keeps working untouched, because Lenis animates the
real document scroll position rather than transforming a wrapper:
`animation-timeline: view()` in `ParallaxImage.astro`, every `position: sticky`
column, and every `IntersectionObserver` (`themeFlip`, `reveal`, `IndexRail`,
the rotator's scroll gate). Nothing below needs a Lenis-aware code path.

---

## Primitive 1 — `themeFlip.ts` + `data-next-theme` — **highest value**

**What it is:** siteassist's section-driven theme inversion (`01 §1.1`). Sections
declare a theme; the header and the page background follow.

**What exists:** `Header.astro` already flips `data-tone="glass" | "solid"`, but
its rule is hard-coded to the hero's height:

```js
const limit = hero ? hero.offsetHeight - 84 : -1;
header.dataset.tone = window.scrollY > limit ? "solid" : "glass";
```

**Change:** replace the height maths with an IntersectionObserver over
`[data-next-theme]` sections. Section declares, header obeys:

```astro
<Section tone="dark" data-next-theme="dark">
  <!-- header goes glass/white-on-dark -->
  <Section data-next-theme="light">
    <!-- header goes solid/frosted --></Section
  ></Section
>
```

Add a third value `glass` for full-bleed photo banners (`PageBanner.astro`), so
`/about`, `/services` and every `/industries/[slug]` get the same
over-the-photo header the homepage hero gets — today they don't, because the
listener only looks for `.hero`.

**Extend `Section.astro`** with a `theme?: "light" | "dark" | "glass"` prop that
writes the attribute, defaulting from the existing `tone`. One line of markup
per section, no per-page JS.

**Payoff:** the whole site starts reading as one continuous surface. This is the
single change that most closes the gap to the reference.

---

## Primitive 2 — `reveal.ts` + `[data-reveal]`

**What it is:** the on-scroll entrance. One observer, one attribute, CSS does the
animation.

```html
<h2 data-reveal>…</h2>
<!-- rise + fade -->
<div data-reveal="lines">…</div>
<!-- line-mask heading (01 §1.8) -->
<ul data-reveal data-reveal-stagger>
  <!-- children stagger 60ms apart -->
</ul>
```

**Implementation:** ~35 lines. Observer with `rootMargin: "0px 0px -12% 0px"`,
`once: true`, adds `.is-in`. The CSS lives in `global.css` `@layer components`
next to `.wrap` / `.card`:

```css
[data-reveal] {
  opacity: 0;
  translate: 0 14px;
  transition:
    opacity 0.7s,
    translate 0.7s;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
[data-reveal].is-in {
  opacity: 1;
  translate: 0 0;
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    translate: 0;
    transition: none;
  }
}
```

The Hero's existing `.reveal-1`…`.reveal-5` load choreography stays as it is —
that's an on-load sequence, not a scroll one. Same easing curve
(`cubic-bezier(.16,1,.3,1)`) so the two read as one system.

**The `lines` variant:** wrap each heading line in `<span class="line"><span>`,
clip the outer, translate the inner from `100%`. Our headings are already
authored as arrays of lines in `content.ts` (`title: ["Built for the job,",
"ready when you are."]`) — **so we can do line masks without SplitText at all.**
That's a genuine advantage over the reference, and it's free.

---

## Primitive 3 — `ui/IndexRail.astro` — generalise `CategoryIndex`

**What exists:** `components/equipment/CategoryIndex.astro` — sticky numbered
rail, IntersectionObserver scroll-spy with `rootMargin: "-45% 0px -45% 0px"`,
`top-header-gap`, hidden below `nav`. It is already the reference's `/solutions`
nav (`01 §1.6`), and arguably cleaner.

**Change:** lift it to `components/ui/IndexRail.astro` with a generic prop:

```ts
interface Props {
  items: { id: string; label: string }[];
  ariaLabel: string;
  class?: string;
}
```

Then `CategoryIndex.astro` becomes a 6-line wrapper that maps the collection to
`{ id, label }`, and `/services`, `/industries`, `/about` and `/yard` all get the
rail for one import each.

**Add one thing the reference has and we don't:** below the `nav` breakpoint,
render the rail as a **horizontally scrolling chip strip** that auto-centres the
active chip (`scrollTo({ left: item.offsetLeft + item.offsetWidth/2 -
wrap.offsetWidth/2, behavior: "smooth" })`). Right now we just hide it on
mobile, which loses the "how much is left" signal on the device where it matters
most.

---

## Primitive 4 — `rotator.ts` gains a progress bar and a scroll gate

Two small additions to the existing file, both from `01 §1.3`:

**a) `onProgress`.** Today `rotator.ts` runs a bare `setTimeout`. Add an
optional callback fired via rAF so the caller can drive a fill bar:

```ts
createRotator({
  root,
  count,
  interval: 6000,
  onSelect: (i) => paint(i),
  onProgress: (i, t) => bars[i].style.setProperty("--t", String(t)), // t: 0→1
});
```

`TrustStrip.astro` already renders `.bar` / `.bar-fill` elements per tab —
they're currently animated by a CSS transition. Driving them from the rotator's
own clock means the bar and the switch can't drift apart, and hover-pause
freezes the bar mid-fill instead of snapping it.

**b) Start on scroll, not on load.** Wrap the initial `select(0)` in an
`IntersectionObserver(…, { threshold: 0.35, once })`. Today `TrustStrip`,
`Services` and `Testimonials` all start their timers at page load, so if a
visitor takes 20 seconds to reach the "Why Collins" card they arrive at tab 3
with two bars already spent. This is the fix.

---

## Primitive 5 — `ui/FollowerList.astro` — numbered rows, one shared image

**What it is:** `01 §1.4`. N numbered rows in a column, **one** image panel
beside them; hovering (or focusing) a row crossfades that row's photo in.
Desktop only; below `nav` it degrades to a plain numbered list with each image
inline, or no images at all.

```astro
<FollowerList
  items={services.map((s, i) => ({
    number: i + 1,
    label: s.title,
    blurb: s.body,
    image: s.image,
    href: `/services/${s.slug}`,
  }))}
/>
```

**Used by:** `/services` (six), `/industries` (eight), homepage services teaser.
It's the component that lets a list of 6–9 things stay one screen tall and still
carry photography — which is exactly the problem the homepage has today with
three services in a 3-item accordion.

Implementation is ~40 lines and needs **no JS at all** on desktop: absolutely
position the images in the shared panel, and use
`.row:hover ~ .panel .img-n { opacity: 1 }`… actually no — use a tiny
pointerenter handler setting `panel.dataset.active = i`, and CSS
`[data-active="3"] .img:nth-child(3) { opacity: 1 }`. That keeps keyboard focus
working via the same handler on `focusin`.

---

## Primitive 6 — sticky media column (CSS only, no component)

`01 §1.5`. Not a component — a documented recipe, because it's two rules:

```html
<div class="grid grid-cols-[1fr_1fr] items-start gap-16">
  <div><!-- long scrolling text --></div>
  <div class="sticky top-header-gap"><!-- media --></div>
</div>
```

The constraint worth writing down: **the sticky child's parent must not be a
flex/grid item with a stretched height** and no ancestor may have
`overflow: hidden` — and per `ParallaxImage.astro`'s doc comment, if that
ancestor clips it must use `overflow: clip`, or the parallax inside it freezes.

Use `top-header-gap` (104px), never a raw px — the token exists precisely so
sticky elements clear the floating header.

---

## The motion tokens

Both of these are second-use-becomes-a-token cases per the project rules, and the
full set — including the veil's curves and durations — is specified in
**`13 §Tokens`**. Add them there, once, rather than growing a second list here:

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1); /* the site's entrance curve —
                                                    Hero.reveal already uses it */
--duration-reveal: 700ms;
```

---

## Build order

| #   | Item                                                                             | Est. | Unblocks                                             |
| --- | -------------------------------------------------------------------------------- | ---- | ---------------------------------------------------- |
| 0   | ~~**Lenis** — install, singleton, reduced-motion guard, anchor offset~~ **done** | —    | the feel of every page; the rest is tuned against it |
| 1   | `themeFlip.ts` + `Section` `theme` prop                                          | S    | everything; visible immediately                      |
| 2   | `reveal.ts` + CSS + `lines` variant                                              | S    | every new page                                       |
| 3   | `IndexRail.astro` (lift + mobile strip)                                          | M    | `/services`, `/industries`, `/about`, `/yard`        |
| 4   | `rotator.ts` — progress + scroll gate                                            | S    | homepage polish, `/services` tabs                    |
| 5   | `FollowerList.astro`                                                             | M    | `/services`, `/industries`                           |
| 6   | sticky-media recipe (docs only)                                                  | —    | `/about`, `/yard`                                    |

Run `/ponytail` before writing any of it and `/ponytail-review` on the diff
before calling it done — these six primitives are shared infrastructure, so an
unnecessary option or a premature abstraction here gets copied into every page
that uses them. See `00 §How we build these`.

Then verify with `bun run check` (0 errors) and `bun run build`, followed by
`bun run format` — per `CLAUDE.md`, inside the `devbox` container.
