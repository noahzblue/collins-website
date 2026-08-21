# 13 — Page transitions: the blue veil + the arrival reveal

_Written 2026-08-21. Depends on `02 §Primitive 0` (Lenis, now installed) and
`02 §Primitive 2` (`reveal.ts`). Shares its blue and its direction of travel with
the onboarding sequence in `12`._

Every in-site navigation plays the same two-beat move:

1. **Cover** — a brand-blue panel rises from the bottom and fills the screen.
   The page swaps behind it.
2. **Reveal** — the panel keeps travelling **upward** and off the top, and the
   new page's content **rises the last 16px into place** behind it, staggered.

The panel never reverses. It enters bottom→top and exits bottom→top, so the
whole navigation reads as one object passing over the screen rather than a
curtain that opens and closes. That single direction is the thing to protect if
anything else about this spec gets cut.

---

## Why this is 1.1s and not 2s

The intro in `12` is once per session, so it can take three seconds. **This runs
on every single link click** — a visitor who reads four pages sees it four
times, and by the third they are no longer watching it, they are waiting for it.
Emil Kowalski's frequency test is the right lens: occasional → standard
animation; every-few-seconds → shorten or remove.

So the budget is:

| Beat                             | ms                                             | Notes                                                        |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| cover (`translateY(100%) → 0`)   | **520**                                        | `--ease-in-out-strong`                                       |
| covered hold                     | **80–120**                                     | the swap happens here; prefetch means it is already in cache |
| reveal (`0 → translateY(-100%)`) | **620**                                        | `--ease-in-veil` — an exit _should_ accelerate away          |
| content rise                     | 700, starting **200ms before** the veil clears | overlaps deliberately                                        |

**≈1.2s door to door, ~600ms of it fully blue.** Slower than that and the site
starts feeling like it is buffering; the prefetch config (`prefetchAll`,
`viewport`) exists precisely so the veil never has to wait on a network round
trip. Treat **1.4s as the hard ceiling** and tune downward, not upward.

`ease-in` on the exit looks like a violation of "never use `ease-in` for UI" —
it is not. That rule is about elements the user is waiting on. The veil on its
way out is leaving, and leaving should accelerate; the thing the user is waiting
on is the content behind it, which uses `--ease-out-expo`.

---

## Implementation

### The panel persists across swaps

The router replaces the body, so the veil has to be told to survive it —
otherwise the element animating the cover is thrown away mid-navigation:

```astro
<!-- src/components/layout/PageVeil.astro — rendered once, in Base.astro -->
<div id="veil" transition:persist aria-hidden="true"></div>
```

```css
#veil {
  position: fixed;
  inset: 0;
  z-index: 90; /* over the header and the floating buttons */
  background: var(--color-brand);
  transform: translateY(100%);
  pointer-events: none;
  will-change: transform;
}
#veil[data-state="in"] {
  transform: translateY(0);
  transition: transform var(--duration-veil-in) var(--ease-in-out-strong);
  pointer-events: auto; /* eat clicks while covered — no double navigations */
}
#veil[data-state="out"] {
  transform: translateY(-100%);
  transition: transform var(--duration-veil-out) var(--ease-in-veil);
}
```

### Hooking the router

`astro:before-preparation` hands you the loader; wrap it and the swap waits for
the cover to finish. The lifecycle events are globally typed by Astro
(`DocumentEventMap`), so `event.loader` needs no import and no cast.

```ts
const veil = document.getElementById("veil")!;
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const done = (el: Element) =>
  new Promise<void>((r) =>
    el.addEventListener("transitionend", () => r(), { once: true }),
  );

document.addEventListener("astro:before-preparation", (event) => {
  if (reduce.matches) return;
  const load = event.loader;
  event.loader = async () => {
    veil.dataset.state = "in";
    await Promise.all([done(veil), load()]); // cover AND fetch, whichever is slower
  };
});

document.addEventListener("astro:page-load", () => {
  if (veil.dataset.state !== "in") return;
  veil.dataset.state = "out";
  done(veil).then(() => {
    veil.style.transition = "none"; // snap back below the fold …
    veil.dataset.state = "";
    veil.offsetHeight; // … force the reflow before …
    veil.style.transition = ""; // … transitions come back
  });
});
```

**The reset is the bug you will ship if you skip it.** After the veil exits it
sits at `-100%`; the next navigation must find it at `+100%`. Move it back with
transitions disabled and a forced reflow between, or the second navigation
animates the veil _down_ through the screen first.

### Three things that will bite

**a) Turn off Astro's own transition.** With `<ClientRouter />` the browser
cross-fades the document root by default, so you get a fade _and_ a veil, half a
beat apart. Kill the root pair:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
}
```

**b) Lenis must stand down while covered.** `autoToggle: true` is already set in
`Base.astro`, so setting `overflow: hidden` on `<body>` for the covered window is
enough — no `lenis.stop()`/`start()` pair to get stuck. `Base.astro` already
re-measures and re-syncs on `astro:after-swap`.

**c) `event.signal`.** A visitor who clicks a second link mid-transition aborts
the first navigation. Bail out of the exit when `event.signal.aborted`, or the
veil will exit for a page that is no longer coming.

---

## The arrival reveal

The second half of the user-facing effect: **elements jump up from slightly
below their resting position as they are revealed.** This is the same primitive
as `02 §Primitive 2` — one attribute, one observer, CSS does the animating — with
one addition: on arrival, everything already in the first viewport plays
immediately in a stagger instead of waiting for a scroll.

```css
[data-reveal] {
  opacity: 0;
  translate: 0 16px;
  transition:
    opacity var(--duration-reveal) var(--ease-out-expo),
    translate var(--duration-reveal) var(--ease-out-expo);
}
[data-reveal].is-in {
  opacity: 1;
  translate: 0 0;
}
```

| Rule     | Value                               | Why                                                                                                                                                                                 |
| -------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| distance | **16px**                            | far enough to read as a rise, near enough that it never looks like a slide. 14px on the scroll variant, 16px here — the veil is still moving, so it needs slightly more to register |
| duration | **700ms**                           | it plays against a 620ms veil exit; matching them makes the two read as one motion                                                                                                  |
| stagger  | **60ms**, capped at 6 items         | past ~360ms of cumulative delay the last element arrives after the user has started reading the first                                                                               |
| start    | veil exit **−200ms**                | overlap, do not sequence. Sequencing is what makes a transition feel like a wait                                                                                                    |
| order    | DOM order within the first viewport | not by position — a two-column section should not zig-zag                                                                                                                           |

**Nothing may be invisible without JS** (`02`, rule 4): the observer _sets_ the
hidden state on init, so a script that never runs leaves a fully readable page.
The same applies to the veil — it lives below the fold at rest, so a broken
script means plain, instant navigations, not a blue screen.

### Link press feedback

Separate from the transition, and worth doing at the same time: a link that
starts a 1.2s move should acknowledge the click _immediately_.

```css
@media (hover: hover) and (pointer: fine) {
  .btn:active {
    transform: scale(0.97);
    transition: transform 140ms var(--ease-out-expo);
  }
}
```

140ms, on `Button.astro` and the card/row links in `CategoryRow`, `CategoryCard`
and `FollowerList`. Without it there is a ~50ms void between the click and the
veil where the interface looks asleep.

---

## Reduced motion

| Piece          | `prefers-reduced-motion: reduce`                               |
| -------------- | -------------------------------------------------------------- |
| veil           | not played at all — instant navigation                         |
| arrival reveal | `opacity` only, 200ms, no `translate`                          |
| link press     | unchanged (140ms scale is feedback, not decoration)            |
| Lenis          | already handled by `respectReducedMotion` (`02 §Primitive 0a`) |

Reduced motion means _less and gentler_, not _none_ — the fade stays because it
still explains that the content is new.

---

## Tokens

Add to `@theme` in `global.css`. Every value above resolves to one of these; no
component gets a raw duration or curve.

```css
--ease-out-expo: cubic-bezier(
  0.16,
  1,
  0.3,
  1
); /* entrances — Hero.reveal already uses it */
--ease-in-out-strong: cubic-bezier(
  0.77,
  0,
  0.175,
  1
); /* on-screen movement: the veil covering, the dot */
--ease-in-veil: cubic-bezier(0.55, 0, 1, 0.45); /* exits — accelerate away */

--duration-veil-in: 520ms;
--duration-veil-out: 620ms;
--duration-reveal: 700ms;
```

The built-in CSS easings are too weak for any of these — `ease-out` on the veil
reads as mushy at 520ms. Use the curves.

---

## Build order

| #   | Item                                                             | Est. | Notes                                                   |
| --- | ---------------------------------------------------------------- | ---- | ------------------------------------------------------- |
| 1   | tokens in `global.css`                                           | XS   | everything below needs them                             |
| 2   | `PageVeil.astro` + the router hook                               | S    | the whole effect, ~50 lines                             |
| 3   | kill `::view-transition-*(root)`                                 | XS   | do it in the same commit or you will chase a ghost fade |
| 4   | `reveal.ts` + `[data-reveal]` (`02 §Primitive 2`) + arrival mode | S    | reusable on every page in `05`–`11`                     |
| 5   | `:active` press states                                           | XS   |                                                         |
| 6   | `12` — the onboarding sequence                                   | M    | reuses 1, 2 and 4                                       |

Verify in a browser, not by reading the diff: navigate `/` → `/equipment` →
a category → back, twice, watching for the reset bug in `§Implementation`. Then
`bun run check`, `bun run build`, `bun run format` inside `devbox` per
`CLAUDE.md`.
