# 12 — The onboarding sequence (logo intro)

_Source: Figma → `Codec` → section `ONBOARDING LOGO ANIMATION VIDEO`
(`node-id=3751-3`), read frame by frame on 2026-08-21. Thirteen 1728×1117
keyframes, no Figma keyframe/motion data attached — the timing below is derived,
the geometry is measured._

This is the **first thing a visitor sees, once per session**. It is also the
long-form version of the page transition in `13`: same blue, same direction of
travel. Build `13` first if you only have time for one — it runs on every
navigation; this runs once.

---

## What the storyboard actually shows

Read the frames as a single travelling dot that becomes the whole screen, then
becomes the logo, then gets out of the way.

| #   | Node       | Frame state                                                                                        | Measured                                          |
| --- | ---------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 1   | `3751:4`   | white screen, dot not yet visible                                                                  | dot at `(858, 924)`, invisible                    |
| 2   | `3751:6`   | **blue dot appears**, low on the screen                                                            | 12×12, centred x, y-centre `930` = **83.3%** down |
| 3   | `3751:8`   | dot has **risen to near the top**                                                                  | y-centre `252` = **22.6%**                        |
| 4   | `3751:10`  | dot **falls back to dead centre**                                                                  | y-centre `559` = **50.0%**                        |
| 5   | `3751:12`  | dot **stretches into a full-width bar**                                                            | `1728×33`, still vertically centred               |
| 6   | `3751:14`  | bar **floods the screen**                                                                          | `1728×1117`, flat brand blue                      |
| 7   | `3751:16`  | on blue: wordmark clipped to **zero width**; a white sliver at the wordmark baseline               | mask `1×58`; sliver `12×1` at `(858, 588)`        |
| 8   | `3751:59`  | sliver **grows back into a 12px dot**                                                              | `12×12` at `(858, 577)`                           |
| 9   | `3751:102` | dot **slides left to the wordmark's start**                                                        | `(731, 576)` — wordmark box starts at x `727`     |
| 10  | `3751:145` | **"COLLINS" wipes in left→right**; the dot has run ahead of it and shrunk into the trailing period | mask `0→277` wide; dot now `6×6` at `(1007, 580)` |
| 11  | `3751:191` | **"EQUIPMENTS LLC" drops in** under it                                                             | subline mask height `1 → 17`                      |
| 12  | `3751:237` | a **seed disc** appears at the wordmark's centre; the wordmark is now **brand blue, not white**    | disc `11×6` at `(859, 556)`                       |
| 13  | `3751:285` | the disc **opens to cover the screen** — the page is underneath                                    | ellipse `2110×2032` centred on `(864, 559)`       |

Sampled colour: **`rgb(0, 81, 240)`** — that is `--color-brand` (`#0050f0`)
within render rounding. The intro uses the site's own blue, no new token.
The final frame's `#d9d9d9` is Figma's placeholder grey standing in for "the
page"; it is not a colour to implement.

### The two moves worth understanding

**a) The colour flip is done by the disc, not by the wordmark.** In frame 12 the
wordmark is already brand blue while the background is still brand blue — so it
renders as nothing at all, which is why that frame screenshots as flat blue. The
disc is _behind_ the wordmark and _above_ the blue field, so as it opens from the
wordmark's own centre the letters fill in from the middle outwards. Implement it
exactly that way — a `color`/`fill` tween from white to blue will read as a
dissolve and lose the effect.

**b) The dot is one continuous object for the whole 3 seconds.** It arrives, it
scouts to the top, it settles, it becomes the screen; on the blue it re-forms at
the baseline, runs the wipe, and parks as the period after "COLLINS". Never
destroy and recreate it — one element, one transform chain. That continuity is
the whole idea, and it is what a viewer feels without being able to name.

---

## The asset already fits — exactly

`src/assets/collins-logo.svg` has `viewBox="0 0 277 92"` and **nine paths**:

- **paths 1–8** are the "COLLINS" wordmark, occupying `y 0–58`
- **path 9** is "EQUIPMENTS LLC", occupying `y 75–92` (17 units tall)

The Figma frames use a `277×58` wordmark box and a `276×17` subline box. Those
are the same numbers. **Do not draw a new asset and do not re-export from
Figma.** Wrap the existing paths in two groups so each band can be clipped
independently:

```svg
<svg viewBox="0 0 277 92" fill="currentColor" …>
  <g id="wm">…the 8 wordmark paths…</g>
  <g id="wm-sub">…the EQUIPMENTS LLC path…</g>
</svg>
```

`Logo.astro` inlines the file with `?raw` and renders identically with the groups
added — this is a non-breaking change to a shared asset, so make it its own
commit.

Derived positions, expressed against the wordmark box so they scale with it:

| Thing               | Value                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| wordmark width      | `clamp(200px, 16vw, 277px)` (Figma: 277 on a 1728 frame = 16.0vw)         |
| the period          | `6px`, at `x: 101.1%` of the wordmark width, `y: 86%` of the 58-unit band |
| the travelling dot  | `12px` throughout, until it shrinks to the 6px period                     |
| bar height (step 5) | `32px` (Figma 33)                                                         |

---

## The timeline

One dot, eleven phases. Durations are the spec; the easing column is the part
that carries the feel.

| Phase | What moves                                                                                                 | ms          | Easing                 |
| ----- | ---------------------------------------------------------------------------------------------------------- | ----------- | ---------------------- |
| A     | dot fades + scales in at `83vh` (`scale(.4) → 1`, never from `0`)                                          | 0 → 160     | `--ease-out-expo`      |
| B     | dot rises `83vh → 22.5vh`                                                                                  | 160 → 640   | `--ease-in-out-strong` |
| C     | dot settles back `22.5vh → 50vh`                                                                           | 640 → 900   | `--ease-out-expo`      |
| D     | dot stretches to a `100vw × 32px` bar                                                                      | 900 → 1140  | `--ease-out-expo`      |
| E     | bar floods to `100vh`                                                                                      | 1140 → 1440 | `--ease-in-out-strong` |
| F     | white dot re-forms at the wordmark baseline (`scaleY 0 → 1`)                                               | 1500 → 1600 | `--ease-out-expo`      |
| G     | dot slides to the wordmark's left edge                                                                     | 1600 → 1800 | `--ease-in-out-strong` |
| H     | wordmark wipes in `inset(0 100% 0 0) → inset(0)`, dot rides the leading edge and shrinks to the 6px period | 1800 → 2200 | `--ease-in-out-strong` |
| I     | subline wipes down `inset(0 0 100% 0) → inset(0)`                                                          | 2180 → 2380 | `--ease-out-expo`      |
| —     | hold                                                                                                       | 2380 → 2560 | —                      |
| J     | wordmark flips to brand blue **instantly** at 2560, disc opens `scale(.02) → 1.5`                          | 2560 → 3160 | `--ease-in-out-strong` |
| K     | page content rises into place (`13 §The arrival reveal`)                                                   | 2700 → 3400 | `--ease-out-expo`      |

**≈2.6s until the page starts appearing, ≈3.2s to fully settled.** That is long
by UI standards and correct by intro standards — Emil Kowalski's frequency test
puts first-run/rare animations in the "can add delight" bucket, and the 300ms
ceiling applies to things people trigger dozens of times a day, not to a
once-per-session title card. **If it tests long, cut B+C to 380ms total and H to
320ms** — that lands at ≈2.6s end to end without touching the choreography.

### Phases D and E are one element, not three

```css
/* The dot is 12px. Everything else is transform on that same 12px. */
.dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--color-brand);
}

/* D — 12px → full width, 32px tall */
transform: translate(-50%, -50%) scale(calc(100vw / 12), calc(32 / 12));
/* E — → full height. Rounding goes away as it grows; ease it out over the
   first 30% of the phase or the corners will read as a lozenge. */
transform: translate(-50%, -50%) scale(calc(100vw / 12), calc(100vh / 12));
```

Transform-only, so the whole sequence stays off the main thread — which matters
here more than anywhere else on the site, because it is competing with the first
page load for CPU.

### The disc (phase J)

```css
.disc {
  position: fixed;
  left: 50%;
  top: 50%; /* the wordmark's centre, not the viewport's */
  width: 100vmax;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fff; /* = the page's own background */
  transform: translate(-50%, -50%) scale(0.02);
}
```

`scale(1.5)` on a `100vmax` circle gives a `75vmax` radius, which clears the
viewport diagonal at every aspect ratio. It starts at `0.02` and not at `0`
because the storyboard gives it a visible seed frame — nothing in the real world
appears from nothing.

---

## Rules

1. **Once per session.** `sessionStorage.getItem("collins:intro")`. A visitor who
   goes home → equipment → home must not sit through it twice, and the client
   router means the script would otherwise still be alive to do it.
2. **Homepage only.** A visitor landing on `/equipment/generators` from Google
   wants the generators, not a title card.
3. **No flash for the returning visitor.** The overlay ships in the HTML with
   `hidden`, and a single `is:inline` script in `<head>` — before first paint —
   removes `hidden` only when the session flag is absent. This is the one place
   on the site where a blocking inline script is the right answer; everything
   else goes through `astro:page-load`.
4. **Skippable.** Any `pointerdown`, `keydown` or `wheel` jumps to the end state
   in 250ms. Never trap someone in an intro.
5. **`prefers-reduced-motion`: do not play it at all.** Set the flag, render the
   page. This animation is decoration; there is no information in it to preserve.
6. **It must not be a `data-astro-rerun` script.** Same reason as Lenis in
   `Base.astro` — one document, one intro.

---

## The Core Web Vitals cost — decide this before building

The overlay covers the page for ~2.6s, and a solid-colour `<div>` is not an LCP
candidate. So on a cold session **LCP is whatever paints when the disc opens** —
around 2.6s, against a 2.5s "good" threshold. Lighthouse and PageSpeed always
run a cold session, so the lab score takes the hit even though most real
visitors (rules 1 and 2 above) never see the intro at all.

Three options, in order of preference:

| Option                                                   | LCP                                            | Cost                                                 |
| -------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| **Ship it, gated by rules 1–2, trimmed to ≈2.6s**        | field data mostly unaffected, lab score dented | you accept a worse PageSpeed number                  |
| Cut to the ≈1.6s version (drop phases B, C and the hold) | passes                                         | loses the scouting move, which is the memorable part |
| Intro only when `document.referrer` is off-site          | passes for internal traffic                    | more code, and Lighthouse still sees the slow path   |

Recommendation: **option 1**, and measure it in the field rather than arguing
with the lab number. But it is a real trade and it belongs to whoever owns the
site's SEO, not to the person writing the animation.

---

## Files

| File                                | Role                                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| `src/components/layout/Intro.astro` | overlay markup + the `is:inline` head guard + the timeline |
| `src/assets/collins-logo.svg`       | add `<g id="wm">` / `<g id="wm-sub">`, no visual change    |
| `src/styles/global.css`             | the shared easing/duration tokens (`13 §Tokens`)           |

Drive the timeline with **WAAPI** (`element.animate([...], {...})`), not a chain
of `setTimeout` + class flips: it is hardware-accelerated like CSS, it gives you
one `finished` promise per phase to sequence against, and `cancel()` on a
skipped intro is one call instead of clearing five timers. Phases that overlap
(H+I, J+K) are separate `animate()` calls with `delay`, not nested callbacks.

Run `/ponytail` before writing it. It is ~120 lines and it is very easy to make
it 400.
