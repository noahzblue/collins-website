/**
 * Smooth scroll — the one Lenis instance, and the site's anchor handling.
 *
 * Created once per document (imported from the head in `layouts/Base.astro`,
 * deliberately without `data-astro-rerun`), so a client-router page swap can
 * never stack a second instance and a second rAF loop on top of the first.
 *
 * ## Why anchors are handled here rather than by Lenis
 *
 * Lenis's own `anchors` option is broken for our purposes, and quietly: its
 * click handler (`lenis.mjs`, `onClick`) starts an animated `scrollTo` but
 * **never calls `preventDefault()`**. The browser therefore performs the native
 * jump in the same tick, Lenis measures a rect that has already moved, and the
 * two disagree — in practice every in-page anchor click landed the page 104px
 * from where it started instead of at the target, then snapped back on the
 * next frame. That is what made the index rail look like it did nothing.
 *
 * So: `anchors` stays off, and `initAnchors` below does the whole job —
 * cancel the default, animate, then write the hash to the URL.
 */
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export const lenis = new Lenis({
  autoRaf: true,
  // Start/stop with the wrapper's `overflow`, so `overflow: hidden` on <body>
  // (mobile nav, any modal) freezes the page without a manual stop()/start()
  // pair that can get stuck.
  autoToggle: true,
  // Lets a nested scroller (a wide table, a snap rail) consume the delta it
  // can use and hand the rest back to the page, which is what keeps the cursor
  // from getting stuck inside one. Do not pair this with `data-lenis-prevent`:
  // that attribute makes Lenis stand down entirely and the page stops dead.
  allowNestedScroll: true,
  stopInertiaOnNavigate: true,
  // Higher = less smoothing. Library default is 0.1, which reads as lag on a
  // site that gets scanned for spec ranges.
  lerp: 0.55,
  // `respectReducedMotion` defaults to true — do not turn it off.
});

/**
 * Scroll to an element (or the top) with the header cleared. Exported so a
 * component that owns its own trigger — one that is not a link — can reuse the
 * site's single scrolling behaviour instead of inventing a second.
 *
 * **No offset is passed, on purpose.** Lenis reads `scroll-padding-top` off
 * the scrolling element and subtracts it itself, so the `--spacing-header-gap`
 * rule in global.css already clears the floating header on this path exactly
 * as it does for a native jump. An explicit offset here would be the same
 * 104px counted twice — and an element carrying `scroll-mt-header-gap` as
 * well would make it three times, which is what used to land a section a third
 * of a screen too low.
 */
export function scrollToTarget(target: HTMLElement | null) {
  lenis.scrollTo(target ?? 0);
}

/**
 * One document-level handler for every same-page anchor on the site: the index
 * rail, the services follower list, the homepage's section links and anything
 * added later. Delegated, so it survives client-router swaps without rebinding.
 */
function initAnchors() {
  document.addEventListener("click", (event) => {
    // Leave modified and non-primary clicks to the browser: they mean "open
    // somewhere else", and hijacking them loses a real navigation.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const link = (event.target as Element | null)?.closest?.("a[href]");
    if (!(link instanceof HTMLAnchorElement) || link.target === "_blank")
      return;

    const url = new URL(link.href);
    const here = new URL(window.location.href);
    // Same document, and it actually points at something.
    if (url.host !== here.host || url.pathname !== here.pathname) return;
    if (!url.hash || url.hash === "#") return;

    const id = decodeURIComponent(url.hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    scrollToTarget(target);
    // The URL still has to change — deep links, the back button and "copy link
    // to this section" all depend on it. `pushState` rather than assigning
    // `location.hash`, which would re-trigger the native jump we just cancelled.
    history.pushState(null, "", url.hash);
  });

  // Back/forward between hashes on the same page: the browser will not scroll
  // for us once the default has been cancelled, so drive it the same way.
  window.addEventListener("popstate", () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    scrollToTarget(document.getElementById(id));
  });

  // A page loaded with a hash: the native landing is fine, but Lenis has to be
  // told about it or its first rAF pulls the page back to zero — the same race
  // the click handler exists to avoid.
  const onLoad = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (target) lenis.scrollTo(target, { immediate: true });
  };
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });
}

initAnchors();

/* The client router replaces the body and restores scroll itself. Re-measure
   the new page, and adopt whatever position the router set so Lenis doesn't
   animate a slide from the old one. */
document.addEventListener("astro:after-swap", () => {
  lenis.resize();
  lenis.scrollTo(window.scrollY, { immediate: true, force: true });
});
