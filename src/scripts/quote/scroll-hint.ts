/**
 * When "More below" (quote/ScrollHint.astro) shows, and when it never
 * shows again.
 *
 * The cue teaches one thing, that the form scrolls, so it is spent the
 * moment that is learned. "Learned" is stored in localStorage and means any
 * of:
 *
 * - the customer scrolled the panel, before or after the cue showed;
 * - they clicked the cue, which scrolls the panel for them;
 * - the cue showed and the dialog closed, so they have seen it once.
 *
 * Until then, each time the dialog opens: wait while the customer reads the
 * first screen, and show the cue only if they have not scrolled and there
 * is real content below. A phone never gets it; the form is paged there.
 *
 * Takes the cue's own element and the panel that scrolls, and queries
 * nothing else.
 */

const KEY = "collins:quote-scroll-hint";
const WAIT = 1400; // ms on the first screen before the cue comes in
const MOVED = 40; // px of scroll that counts as "they know"
const BELOW = 160; // px of content below that makes a cue worth showing

const learned = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
const remember = () => {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* Private mode: the cue may come back next visit. Harmless. */
  }
};

export interface ScrollHintApi {
  /** The dialog has opened: start watching. */
  arm: () => void;
}

export function initScrollHint(
  hint: HTMLElement,
  scroller: HTMLElement,
  { signal }: { signal: AbortSignal },
): ScrollHintApi {
  const cue = hint.querySelector<HTMLElement>("[data-scroll-hint-cue]");
  const wide = window.matchMedia("(min-width: 901px)");
  let timer = 0;
  let shown = false;

  const hide = () => {
    if (!shown) return;
    shown = false;
    hint.toggleAttribute("data-leaving", true);
    window.setTimeout(() => {
      hint.hidden = true;
      hint.removeAttribute("data-leaving");
    }, 200);
  };

  const learn = () => {
    window.clearTimeout(timer);
    remember();
    hide();
  };

  const arm = () => {
    window.clearTimeout(timer);
    if (learned() || !wide.matches) return;
    timer = window.setTimeout(() => {
      if (learned() || !wide.matches) return;
      if (scroller.scrollTop > MOVED) return learn();
      const below =
        scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
      if (below < BELOW) return;
      shown = true;
      hint.hidden = false;
    }, WAIT);
  };

  scroller.addEventListener(
    "scroll",
    () => {
      if (scroller.scrollTop > MOVED && !learned()) learn();
    },
    { passive: true, signal },
  );

  cue?.addEventListener(
    "click",
    () => {
      learn();
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      scroller.scrollBy({
        top: Math.round(scroller.clientHeight * 0.6),
        behavior: smooth ? "smooth" : "auto",
      });
    },
    { signal },
  );

  // Seen once, through a whole visit, counts as learned.
  hint.closest("dialog")?.addEventListener(
    "close",
    () => {
      window.clearTimeout(timer);
      if (shown) learn();
    },
    { signal },
  );

  signal.addEventListener("abort", () => window.clearTimeout(timer));

  return { arm };
}
