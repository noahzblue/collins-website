/**
 * The one rotating-panel behaviour on the site: a set of triggers where
 * selecting one shows its panel, with optional auto-advance that pauses while
 * the block is hovered and holds still for reduced-motion users.
 *
 * Used by the "Why Collins" tab card, the services accordion and the
 * testimonial slider — all three previously carried their own copy of this.
 *
 *   createRotator({
 *     root, count: tabs.length, interval: 6000,
 *     onSelect: (i) => { ... paint the DOM ... },
 *   });
 */
export interface RotatorOptions {
  /** Hover on this element pauses auto-advance. */
  root: HTMLElement;
  count: number;
  /** Paint the UI for index `i`. Called once on init and on every change. */
  onSelect: (index: number) => void;
  /** ms between auto-advances. Omit for click-only (no timer at all). */
  interval?: number;
  /** Runs when the pointer leaves, before the timer re-arms. */
  onResume?: () => void;
}

export interface Rotator {
  select: (index: number) => void;
}

export function createRotator({
  root,
  count,
  onSelect,
  interval,
  onResume,
}: RotatorOptions): Rotator {
  const auto =
    interval !== undefined &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let index = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const arm = () => {
    clearTimeout(timer);
    // `root.isConnected` stops the chain after a client-router navigation:
    // the swapped-out page's rotator re-arms once, finds itself detached and
    // stops, leaving only the new page's rotator running.
    if (auto)
      timer = setTimeout(() => {
        if (root.isConnected) select((index + 1) % count);
      }, interval);
  };

  const select = (i: number) => {
    index = i;
    onSelect(i);
    arm();
  };

  if (auto) {
    root.addEventListener("mouseenter", () => clearTimeout(timer));
    root.addEventListener("mouseleave", () => {
      onResume?.();
      arm();
    });
  }

  select(0);
  return { select };
}
