/**
 * How a part of the quote form appears and disappears.
 *
 * Every show and hide inside the form goes through `setShown`, so the form
 * moves one way everywhere. `hidden` stays the source of truth: CSS, the
 * form's queries (`:not([hidden])`) and assistive tech all read it as before,
 * and this file only decides how the change looks.
 *
 * Two kinds, because two different things happen on screen:
 *
 * - **grow**: something opens inside the flow and pushes what follows down
 *   (the duty box, an error, a summary row). It grows from nothing and
 *   collapses back, so the content under it slides rather than jumps.
 * - **fade**: one panel takes another's place (a rating list for another
 *   machine, the hire terms for the buy terms, a phone step). The old one goes
 *   at once and the new one rises in. Letting the old one linger would push
 *   the new one down mid-move.
 * - **dissolve**: the same swap for something that must not move, such as
 *   the picked machine's photo in a fixed frame. Opacity only.
 *
 * Text that changes in place (a summary value, the step title, the picked
 * machine's name) goes through `setText`, which eases the new words in.
 *
 * Nothing animates when the element's parent is not on screen (a closed
 * dialog, a restored draft before open) or when the visitor asks for reduced
 * motion: then the attribute flips and that is all.
 */

export type MotionKind = "grow" | "fade" | "dissolve";

const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)"; // --ease-out-expo
const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)"; // --ease-in-out-strong

const running = new WeakMap<HTMLElement, Animation>();

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const onScreen = (element: HTMLElement) =>
  !!element.parentElement && element.parentElement.getClientRects().length > 0;

const stop = (element: HTMLElement) => {
  running.get(element)?.cancel();
  running.delete(element);
  element.style.removeProperty("overflow");
};

interface Options {
  kind?: MotionKind;
  /** Horizontal start offset for `fade`, in px. A phone step coming from
   *  the right passes a positive number, from the left a negative one. */
  from?: number;
  /** Runs once the element is hidden for good, after any exit. */
  onHidden?: () => void;
}

export function setShown(
  element: HTMLElement | null | undefined,
  on: boolean,
  { kind = "grow", from = 0, onHidden }: Options = {},
): void {
  if (!element) return;
  const leaving = element.dataset.motion === "leaving";
  const visible = !element.hidden && !leaving;
  if (on === visible) return;

  stop(element);
  delete element.dataset.motion;

  const animate = onScreen(element) && !reduced();

  if (on) {
    element.hidden = false;
    if (!animate) return;
    if (kind === "grow") {
      const height = element.offsetHeight;
      element.style.overflow = "clip";
      const animation = element.animate(
        [
          { height: "0px", opacity: 0 },
          { height: `${height}px`, opacity: 1 },
        ],
        { duration: 320, easing: EASE_OUT },
      );
      running.set(element, animation);
      animation.onfinish = () => stop(element);
    } else {
      const frames =
        kind === "dissolve"
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              {
                opacity: 0,
                transform: `translate(${from}px, ${from ? 0 : 8}px)`,
              },
              { opacity: 1, transform: "none" },
            ];
      const animation = element.animate(frames, {
        duration: kind === "dissolve" ? 200 : 300,
        easing: EASE_OUT,
      });
      running.set(element, animation);
      animation.onfinish = () => running.delete(element);
    }
    return;
  }

  if (!animate || kind !== "grow") {
    element.hidden = true;
    onHidden?.();
    return;
  }

  // Collapse, then hide. `data-motion` marks the exit so a repaint that asks
  // for "hidden" again in the meantime does not restart it.
  element.dataset.motion = "leaving";
  const height = element.offsetHeight;
  element.style.overflow = "clip";
  const animation = element.animate(
    [
      { height: `${height}px`, opacity: 1 },
      { height: "0px", opacity: 0 },
    ],
    { duration: 220, easing: EASE_IN_OUT },
  );
  running.set(element, animation);
  animation.onfinish = () => {
    stop(element);
    delete element.dataset.motion;
    element.hidden = true;
    onHidden?.();
  };
}

/**
 * Replace an element's text, easing the new text in: a short rise out of a
 * slight blur, which reads as the value updating rather than flickering. The
 * blur hides the moment the old words become the new ones. Nothing animates
 * when the text is unchanged, off screen, or motion is reduced.
 */
export function setText(
  element: HTMLElement | null | undefined,
  text: string,
): void {
  if (!element || element.textContent === text) return;
  const animate =
    element.textContent !== "" &&
    element.getClientRects().length > 0 &&
    !reduced();
  element.textContent = text;
  if (!animate) return;
  element.animate(
    [
      { opacity: 0, transform: "translateY(3px)", filter: "blur(2px)" },
      { opacity: 1, transform: "none", filter: "blur(0)" },
    ],
    { duration: 220, easing: EASE_OUT },
  );
}

const morphing = new WeakMap<HTMLElement, Animation>();

/**
 * Change what is inside `container` without the page jumping: the
 * container's height eases from what it was to what it now is, while
 * `change` swaps its contents at once.
 *
 * This is the rule for any swap of one set of things for another (the hire
 * rows for the buy rows in the summary, the hire terms for the buy terms).
 * Growing the new set while collapsing the old one shows both at once, so
 * the block first gets taller, then shorter; tapped quickly, the rows
 * squash on top of each other (reported 2026-11-24). Here there is only
 * ever one set, and only the edge moves.
 *
 * Interruptible: a second change mid-move starts from the height on screen.
 * Inside `change`, use `dissolve` (or `fade`) for what appears, never
 * `grow`; the container already animates the height.
 */
export function morph(
  container: HTMLElement | null | undefined,
  change: () => void,
): void {
  if (!container) return;
  const animate = container.getClientRects().length > 0 && !reduced();
  if (!animate) {
    change();
    return;
  }
  const from = container.getBoundingClientRect().height;
  morphing.get(container)?.cancel();
  change();
  const to = container.getBoundingClientRect().height;
  if (Math.abs(to - from) < 1) {
    morphing.delete(container);
    container.style.removeProperty("overflow");
    return;
  }
  container.style.overflow = "clip";
  const animation = container.animate(
    [{ height: `${from}px` }, { height: `${to}px` }],
    { duration: 300, easing: EASE_OUT },
  );
  morphing.set(container, animation);
  animation.onfinish = () => {
    morphing.delete(container);
    container.style.removeProperty("overflow");
  };
}
