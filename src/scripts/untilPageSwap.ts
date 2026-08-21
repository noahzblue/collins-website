/**
 * An AbortSignal that fires when the client router swaps this page out.
 *
 * Component scripts re-run on every navigation (`data-astro-rerun`), so
 * anything bound to `window`/`document` or looping on requestAnimationFrame
 * has to stop when its page goes — otherwise each visit leaves another copy
 * running against a detached DOM.
 *
 *   const gone = untilPageSwap();
 *   window.addEventListener("scroll", onScroll, { passive: true, signal: gone });
 *   const frame = () => {
 *     if (gone.aborted) return;
 *     ...
 *     requestAnimationFrame(frame);
 *   };
 *
 * Listeners on an element inside the page don't need this — they're collected
 * with the element itself.
 */
export function untilPageSwap(): AbortSignal {
  const controller = new AbortController();
  document.addEventListener("astro:before-swap", () => controller.abort(), {
    once: true,
  });
  return controller.signal;
}
