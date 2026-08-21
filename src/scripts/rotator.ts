/**
 * The one rotating-panel behaviour on the site: a set of triggers where
 * selecting one shows its panel, with optional auto-advance that pauses while
 * the block is hovered and holds still for reduced-motion users.
 *
 * Used by the "Why Collins" tab card, the services accordion and the founder
 * quote band — all three previously carried their own copy of this.
 *
 *   createRotator({
 *     root, count: tabs.length, interval: 6000,
 *     onSelect:   (i)    => paint(i),
 *     onProgress: (i, t) => bars[i].style.setProperty("--t", String(t)),
 *   });
 *
 * Two details that make an auto-rotating panel feel intentional rather than
 * twitchy (docs/site-expansion/01 §1.3):
 *
 * - **The progress bar is the timer.** `onProgress` runs off the same clock as
 *   the advance, so the bar and the switch cannot drift, and hover freezes the
 *   fill mid-travel instead of snapping it.
 * - **It starts on screen, not on load.** A visitor who reads the hero for
 *   twenty seconds should not arrive at tab three with two bars already spent.
 */
export interface RotatorOptions {
  /** Hover on this element pauses auto-advance. Also the scroll-gate target. */
  root: HTMLElement;
  count: number;
  /** Paint the UI for index `i`. Called once on start and on every change. */
  onSelect: (index: number) => void;
  /** ms between auto-advances. Omit for click-only (no timer at all). */
  interval?: number;
  /** Fill fraction for the active panel, 0→1, on every animation frame. */
  onProgress?: (index: number, t: number) => void;
  /** Runs when the pointer leaves, before the timer re-arms. */
  onResume?: () => void;
  /**
   * Aborts the hover-pause listeners. Only needed where a rotator is torn
   * down before its page is — a layout that runs one below a breakpoint and
   * none above it, say. Pair it with `stop()`; without a signal, repeatedly
   * re-creating a rotator on the same root stacks dead listeners on it.
   */
  signal?: AbortSignal;
}

export interface Rotator {
  select: (index: number) => void;
  /**
   * Cancel the timer. Panels stay exactly as they are — this stops the clock,
   * it does not reset the selection. A later `select()` re-arms it.
   */
  stop: () => void;
}

export function createRotator({
  root,
  count,
  onSelect,
  interval,
  onProgress,
  onResume,
  signal,
}: RotatorOptions): Rotator {
  const auto =
    interval !== undefined &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let index = 0;
  let paused = false;
  /** ms of the current interval already spent — survives a hover pause. */
  let elapsed = 0;
  let last = 0;
  let frame = 0;

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const tick = (now: number) => {
    // `root.isConnected` stops the chain after a client-router navigation: the
    // swapped-out page's rotator finds itself detached and stops, leaving only
    // the new page's rotator running.
    if (!root.isConnected) return stop();

    if (!paused) elapsed += now - last;
    last = now;

    const t = Math.min(elapsed / interval!, 1);
    onProgress?.(index, t);

    if (t >= 1) return select((index + 1) % count);
    frame = requestAnimationFrame(tick);
  };

  const arm = () => {
    stop();
    if (!auto) return;
    elapsed = 0;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };

  const select = (i: number) => {
    index = i;
    onSelect(i);
    onProgress?.(i, 0);
    arm();
  };

  if (auto) {
    root.addEventListener(
      "mouseenter",
      () => {
        paused = true;
      },
      { signal },
    );
    root.addEventListener(
      "mouseleave",
      () => {
        paused = false;
        onResume?.();
      },
      { signal },
    );
  }

  /* Start when the block is on screen. Reduced-motion and click-only rotators
     have no timer to gate, so they paint their first panel immediately. */
  let gate: IntersectionObserver | null = null;
  if (auto) {
    onSelect(0);
    onProgress?.(0, 0);
    gate = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        gate!.disconnect();
        arm();
      },
      { threshold: 0.35 },
    );
    gate.observe(root);
  } else {
    select(0);
  }

  return {
    select,
    // The scroll gate has to go too: a rotator stopped before it ever came
    // into view would otherwise arm itself the moment it did.
    stop: () => {
      stop();
      gate?.disconnect();
    },
  };
}
