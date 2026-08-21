/**
 * Section-driven theme inversion — the single biggest thing that makes a site
 * read as one continuous surface rather than a stack of cards
 * (docs/site-expansion/01 §1.1).
 *
 * A section declares what the chrome over it should look like:
 *
 *   <Section theme="dark">   … header goes glass, white-on-dark
 *   <Section theme="light">  … header goes solid, frosted white
 *   <PageBanner>             … theme="glass": over a full-bleed photo
 *
 * The header then obeys, with no per-page JS. This replaces the old rule,
 * which measured `.hero`'s height and so only ever worked on the homepage —
 * every subpage banner got the frosted header over its photo.
 *
 * `glass` and `dark` render the same way; they are kept apart because a photo
 * banner and an ink band are different authoring intents, and only the photo
 * one needs the header's inner highlight to read as a lit edge.
 */

export type Theme = "light" | "dark" | "glass";

const TONE: Record<Theme, string> = {
  light: "solid",
  dark: "glass",
  glass: "glass",
};

export function initThemeFlip(header: HTMLElement, signal: AbortSignal) {
  const sections = [
    ...document.querySelectorAll<HTMLElement>("[data-next-theme]"),
  ];

  // No page has zero themed sections after this work, but a new one might:
  // fall back to the safe reading state rather than to nothing.
  if (sections.length === 0) {
    header.dataset.tone = "solid";
    return;
  }

  let ticking = false;

  /* Whichever section is crossing the top of the viewport owns the header.
     Read bottom-up so the last section whose top has passed the line wins —
     that is the one actually under the header. */
  const apply = () => {
    ticking = false;
    const line = header.offsetHeight + 16;
    let theme: Theme = "light";

    for (let i = sections.length - 1; i >= 0; i--) {
      const box = sections[i].getBoundingClientRect();
      if (box.top <= line && box.bottom > line) {
        theme = (sections[i].dataset.nextTheme as Theme) ?? "light";
        break;
      }
    }
    header.dataset.tone = TONE[theme];
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  };

  apply();
  window.addEventListener("scroll", onScroll, { passive: true, signal });
  window.addEventListener("resize", onScroll, { signal });
}
