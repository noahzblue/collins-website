/**
 * The site's on-scroll entrance. One observer, one attribute, CSS does the
 * animating (see `[data-reveal]` in styles/global.css).
 *
 *   <h2 data-reveal>…</h2>                    rise + fade
 *   <h2 data-reveal="lines">…</h2>            line-mask heading
 *   <ul data-reveal data-reveal-stagger>…</ul> children 60ms apart
 *
 * Two rules this file exists to keep:
 *
 * 1. **Nothing may be invisible without JS.** The hidden state lives in
 *    `.reveal-armed`, which only this script adds. If the script never runs
 *    the page is un-animated, not blank.
 * 2. **Arrival plays immediately.** Anything already inside the first viewport
 *    when the page loads reveals in a stagger straight away rather than
 *    waiting for a scroll it may never get — that is the second half of the
 *    page transition (docs/site-expansion/13).
 */

/** Cumulative delay between staggered siblings. */
const STAGGER = 60;
/** Past ~360ms the last item lands after the reader has started the first. */
const STAGGER_CAP = 6;

const setDelay = (el: HTMLElement, index: number) => {
  el.style.setProperty(
    "--reveal-delay",
    `${Math.min(index, STAGGER_CAP) * STAGGER}ms`,
  );
};

/** Wrap each `<br>`-separated line so the CSS line mask has something to clip. */
const splitLines = (el: HTMLElement) => {
  if (el.querySelector(".line")) return; // already wrapped (re-init after swap)
  el.innerHTML = el.innerHTML
    .split(/<br\s*\/?>/i)
    .map((line) => `<span class="line"><span>${line}</span></span>`)
    .join("");
};

export function initReveal() {
  const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  if (targets.length === 0) return;

  for (const el of targets) {
    if (el.dataset.reveal === "lines") splitLines(el);
    // Stagger groups set the delay on their own children, so the group itself
    // reveals as one object and the children cascade inside it.
    if (el.hasAttribute("data-reveal-stagger")) {
      [...el.children].forEach((child, i) => {
        if (child instanceof HTMLElement) {
          child.setAttribute("data-reveal", "");
          setDelay(child, i);
        }
      });
    }
  }

  // Re-query: the stagger pass above minted new [data-reveal] children.
  const all = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  for (const el of all) el.classList.add("reveal-armed");

  const show = (el: HTMLElement) => {
    el.classList.remove("reveal-armed");
    el.classList.add("is-in");
  };

  // Arrival: everything in the first viewport plays now, in DOM order, so a
  // two-column section doesn't zig-zag. Force a frame first so the browser
  // has painted the armed state and actually transitions out of it.
  const fold = window.innerHeight;
  const rest: HTMLElement[] = [];
  let arrived = 0;

  requestAnimationFrame(() => {
    for (const el of all) {
      if (el.getBoundingClientRect().top < fold) {
        // Only set an arrival delay where the element isn't already inside a
        // stagger group that gave it one.
        if (!el.style.getPropertyValue("--reveal-delay"))
          setDelay(el, arrived++);
        el.style.setProperty("--reveal-distance", "16px");
        show(el);
      } else {
        rest.push(el);
      }
    }

    if (rest.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    for (const el of rest) observer.observe(el);
  });
}
