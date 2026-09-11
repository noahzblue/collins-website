# 16 — Designing for the phone

_The thinking, not the CSS. Read this before touching a breakpoint._

A desktop layout is an **answer to a question about space**. The phone asks a
different question, so it needs a different answer — not a squeezed copy of the
old one. Reflowing is not designing. `flex-direction: column` is a mechanical
operation; it has no opinion about what the section is for, and a section that
survives it intact was probably not doing much on desktop either.

Everything below is a way of deciding. None of it is a rule you can apply
without looking at the content.

---

## 1 · Find the claim before you move anything

Every section makes **one claim** and offers **one next step**. Everything else
— the second photograph, the supporting paragraph, the stat, the decorative
counter — is elaboration that a wide screen could afford.

Name the claim in a sentence before you write a single responsive rule. Then
sort the rest of the section into _carries the claim_ and _decorates it_. On a
phone the claim is non-negotiable and the decoration is a budget line.

**Failure mode:** preserving the _shape_ of the desktop section and losing its
_intent_ — every element still present, at 60% size, making the point 60% as
well. If you cannot say what the claim is, you cannot know what you are allowed
to cut, so you will cut nothing and shrink everything.

---

## 2 · Height is the currency. Spend it deliberately

On a wide screen the scarce resource is attention across a large field. On a
phone it is **vertical distance** — the only thing the reader spends to get
anywhere, and the only thing they can run out of.

Measure in **screens**, not pixels: total document height ÷ viewport height.
That number is the honest description of the page, and it is the number to
quote before and after a pass.

Working intuitions, not laws:

- A teaser section — one that exists to hand off to a deeper page — earns about
  **one screen**, and one and a half if it carries real photography.
- A section past **three screens** is not a long section. It is a design that
  has not been made yet.
- The reader's tolerance is not uniform. Height spent near the top is cheap;
  height spent in the sixth section is expensive, because by then they are
  deciding whether the page ends.

**Failure mode:** optimising the section you are looking at instead of the page
you are building. Six sections each "only" two screens is a twelve-screen page,
and no single section looks guilty.

---

## 3 · The five moves, in order of preference

When a block is too tall, there are exactly five things to do about it. Try
them in this order — each one costs more than the last.

### i. Shrink

Type down a rung, padding in, gaps closer, icons smaller. Preserves everything:
same structure, same content, same reading order. Always try this first.

**When it stops working:** when you hit an invariant (§4) or when the block is
still too tall at the floor. Shrinking is bounded, and a design that needs
_unbounded_ shrinking to fit has a structural problem shrinking cannot reach.

### ii. Turn the axis

A vertical list becomes a horizontal rail with scroll-snap. Height collapses to
the height of one item.

**When:** items are **peers**, visually led, and the reader **browses** rather
than compares. Photographs of things are the ideal case.

**Cost:** roughly one and a half items are visible at once, and the reader
loses any sense of how many there are. Pay it only when "how many" is not part
of the message. Let the next item peek into frame — the overflow is the
affordance, and a rail that needs arrows and dots to be discoverable is a rail
that was the wrong move.

### iii. Re-column

One wide column becomes two narrow ones; the crop changes to suit. Height
roughly halves.

**When:** items are small, glanceable, and **countable** — where seeing the
shape of the whole set is part of the point. Also when the item's natural crop
is taller than it is wide, so a narrow column is not a compromise but a better
frame.

**Cost:** labels get a short measure. Anything with a real sentence in it does
not survive two columns on a phone.

### iv. Re-shape

Split the component into a different thing: N blocks become **one block plus a
selector**. A tab rail, a segmented control, a progress row — a small, cheap
control that swaps a single content slot.

**When:** items are text-heavy and the reader only needs **one at a time**.
This is the most powerful move and the only one that changes the component's
contract, so it is also the one most likely to break something.

**Cost:** it introduces state, and state introduces every question in §5.
Crossfade rather than reflow when the slot changes — a control that moves under
the thumb that is reaching for it is a bug, not a detail.

### v. Cut

Remove it.

Under-used, and often correct. A section that cannot justify a screen of a
phone should be asked what it was justifying on a desktop. The width was
hiding the question, not answering it.

---

## 4 · What must not shrink

Shrinking has a floor, and naming the floor is what stops "make it smaller"
from becoming a race to the bottom. These do not scale with the viewport:

- **Tap targets.** A thumb is the same size on every device. Roughly 44px, and
  the target is the _hit area_, not the glyph — small text inside a generous
  target is fine, a small target is not.
- **Hairlines.** 1px is 1px. Rules, dividers and borders are structure; thinning
  them to "match" smaller type just makes them disappear.
- **Contrast.** Smaller type needs _more_ contrast, not the same. Muted-on-white
  that reads at 15px can be illegible at 12px in sunlight, which is where
  phones are.
- **The measure.** Below roughly 30 characters a line, prose stops being prose
  and becomes a column of fragments. This is what caps how narrow a text column
  may get, and it is the real reason most content does not survive two columns.
- **The bottom of the type scale.** Every scale has a rung below which type is
  texture rather than language. Find it once, write it down, never go under it.
- **Meaning.** Accessible names, labels and alt text do not get abbreviated
  because the visible layout did. If a control's visible label is removed to
  save space, its accessible name stays whole.

---

## 5 · Hiding is a debt, not a saving

Progressive disclosure does not delete content. It **moves the cost** from
height onto a tap, plus the reader's uncertainty about whether tapping is worth
it. Sometimes that trade is excellent. Often it is not.

**The test:** would a reader who never taps misunderstand the section?

- If **no** — the hidden content is elaboration (a spec table, a long FAQ, the
  fourth of four supporting points) — hide it freely.
- If **yes** — the hidden content _is_ the claim — you may not hide it. The
  classic failure is a two-sided comparison behind an accordion: the section
  exists to say "these two things are the same fleet on different terms", and
  showing one at a time says the opposite.

A corollary worth stating plainly: **if the content is small, do not build a
mechanism for it.** Two short panels do not need an accordion. The mechanism is
not free — it costs a control, a state, an ARIA pattern, a script, and a
reader's tap — and if the thing it saves is 200px, it is a bad trade and also
several hundred lines someone has to maintain.

And when a mechanism does turn out to be unnecessary, **delete it rather than
disabling it**. A control that never controls anything is worse than no
control: it is in the tab order, it announces itself to a screen reader, and it
invites a press that does nothing.

---

## 6 · Motion costs more down here

The same animation is proportionally larger on a small screen, closer to the
eye, and competing with the reader's own scrolling.

- **Nothing moves under a thumb.** Anything the reader is about to touch holds
  still. Swap content by crossfade, not by reflow.
- **Auto-advance competes with scroll.** A thing that changes on its own while
  the reader is dragging the page reads as the page misbehaving. Reserve it for
  content that is genuinely ambient.
- **But stillness must look deliberate.** A frozen element that is obviously
  _meant_ to move — a video that didn't start, a carousel that didn't turn —
  reads as broken, which is worse than not having it. If the rich version is
  dropped on a phone, the fallback has to look like a decision.
- **Weight is a design constraint, not an afterthought.** Large media exists to
  decorate one screen. The reader on a mobile connection pays for it before
  they see anything. Decide explicitly; do not inherit the desktop asset.

---

## 7 · Density is a system property, not a per-element decision

If the system's sizes are tokens, "the phone is smaller" is **one statement** —
a re-pitch of the scale at one breakpoint — and every component that picked a
rung from that scale moves together, coherently, including components that do
not exist yet.

If the system's sizes are literals, "the phone is smaller" is several hundred
edits that drift apart the moment anyone adds a component.

Two consequences worth internalising:

- **Every arbitrary value is a hole in the system.** Something written outside
  the scale cannot be re-pitched centrally and must be handled by hand, by
  somebody who remembers it exists. A mobile pass rots at exactly these points.
  Keep a list; audit it rather than trusting it.
- **Spacing is a scale too.** The vertical rhythm between bands is the single
  largest lever on total page height, and it belongs in the system next to the
  type — not copied into nine components as a literal.

---

## 8 · Breakpoints describe posture, not devices

Do not pick a number because it appears in a list of device widths. Pick the
width at which **the layout's assumption stops being true** — the point where a
two-column comparison stops being a comparison, or a sticky side panel runs out
of travel.

And be explicit about the middle. A tablet in portrait is neither a big phone
nor a small desktop; it reads at near-desktop distance with near-phone width.
Decide which of the two it is closer to _for this layout_ and say so in a
comment, because the next person will assume the other one.

**Failure mode:** one breakpoint doing two jobs. If the same number controls
both "the nav collapses" and "the type gets smaller", one of those is wrong —
they are answers to different questions and they belong at different widths.

---

## 9 · Porting versus starting from the phone

**Porting** (a desktop design exists): the work is an audit. For each element,
ask _what was the width buying here?_ — comparison, hierarchy, atmosphere,
scanability — and then decide what replaces it now that the width is gone.
Elements whose answer is "nothing, it was filling space" are §3(v).

**Starting from the phone:** the claim comes first, and width is spent on
elaboration as it becomes available. This produces better small screens almost
automatically. Its own failure mode is real though: a desktop that is a
stretched phone — one centred column in an ocean of margin, because nothing was
ever designed to _use_ the width.

Neither direction is free. The discipline is the same in both: know what each
breakpoint's extra space is _for_.

---

## 10 · Verify by measurement, calibrate by taste

Two different activities. Do not confuse them.

**Measure** — objective, and a screenshot will not tell you any of it:

- Document height in screens, per section, before and after.
- Horizontal overflow is always zero. Always. `scrollWidth === clientWidth` on
  the document; anything wider than its container is either clipped on purpose
  or a bug.
- Computed sizes on the real element. "The token moved" and "this element never
  used the token" look identical in a picture.
- The **widest** content, not the average: the longest label, the largest
  number, the untranslatable compound word. Layouts break on maxima.
- The **smallest** viewport you support, not the fashionable one, and landscape
  as well as portrait.

**Calibrate** — subjective, and only a human can settle it. How small is _too_
small, how tight is _too_ tight, whether a rail feels premium or cheap: these
are taste, and taste has to be asked for. The most valuable output of any
mobile pass is the set of corrections a human gives you, because that is where
the floor actually is. Ask early, with something real to react to.

---

## The pass, as a sequence

1. Measure the page. Height in screens, and per section. Write it down.
2. For each section, name its claim in a sentence.
3. Re-pitch the system's scale — type and spacing — at the phone breakpoint.
   Re-measure. Most sections are now done.
4. Rank what is left by height. Work down the list, not across the page.
5. For each, walk §3 in order: shrink, turn, re-column, re-shape, cut. Stop at
   the first move that works. Justify anything past (i) in a comment at the
   call site, because the next reader will otherwise "simplify" it back.
6. Audit the escape hatches — everything written outside the scale — and give
   each one a phone size by hand.
7. Verify by §10. Then show a human and get the floor.

---

## The single sentence

**Decide what each section is for, spend height on that, and make everything
you remove a decision you can defend — not a casualty of the viewport.**
