/**
 * Open, close, history, focus and the body scroll lock for the quote dialog.
 *
 *   initQuoteDialog(dialog, { signal: untilPageSwap() });
 *
 * Everything here is one instance's business and is queried through the dialog
 * element it is handed — the only things it reaches out of that root for are
 * the three that are genuinely document-wide: the triggers that open it, the
 * body it freezes, and the history it writes (docs/site-expansion/14 §15.4).
 *
 * The dialog itself is a native `<dialog>` opened with `showModal()`, so the
 * focus trap, Escape, `inert` behind and the top layer are the platform's.
 * What is left is the part the platform does not have an opinion about:
 *
 * - **A dirty form must survive a dismissal.** Fifteen fields behind an
 *   accidental Escape is the single most likely way this feature earns a
 *   complaint. Escape on a dirty dialog is intercepted and asks; a backdrop
 *   click on a dirty dialog does not close at all, and says so by pointing at
 *   the control that does (docs 14 §4).
 * - **Browser back closes the dialog rather than leaving the page.** On
 *   Android the back gesture is how people close an overlay, and without this
 *   they leave the site instead.
 * - **The page behind must not scroll, and must not lose its place.**
 *
 * And two rules that are easy to miss until they look broken. Both are a page
 * saying its CTAs are not dialog triggers:
 *
 * > **If the page already has an inline instance, every CTA on that page
 * > scrolls to it instead of opening the dialog.**
 *
 * Opening a modal containing an identical form on top of the form you are
 * looking at is the kind of thing that makes software feel unattended
 * (docs 14 §2).
 *
 * > **On the homepage, every CTA is a link to /contact and stays one.**
 *
 * The homepage's job is to hand over, not to interrupt: its CTAs are the
 * header button, the footer link and the three answers in the closing band,
 * and all three are the same short journey to a page that is entirely the
 * form. Everywhere else the dialog is the point — it is what keeps someone on
 * the category page they were reading.
 */

import type { QuoteIntent } from "@/lib/quote/schema";

/** The parameters that travel beside `?quote=` (docs 14 §9b). */
const RATING_PARAM = "rating";
const MODE_PARAM = "mode";

export interface QuoteDialogOptions {
  /** Aborted when the client router swaps this page out. */
  signal: AbortSignal;
  /** Query parameter that marks the dialog open. */
  param?: string;
  /** Selector for anything that opens it. */
  trigger?: string;
  /**
   * Whether there is anything worth protecting from a stray Escape.
   * `scripts/quote/form.ts` answers this properly — it compares the form
   * against a blank one. The fallback below is "an edit event has fired in
   * here", which keeps the guard working if the form script never ran.
   */
  dirty?: () => boolean;
  /** What "Discard" does. Defaults to resetting every form in the panel. */
  onDiscard?: () => void;
  /**
   * Called with whatever the trigger or the link asked for, every time the
   * dialog opens. `scripts/quote/form.ts` turns it into answered questions.
   */
  onOpen?: (intent: QuoteIntent) => void;
}

export function initQuoteDialog(
  dialog: HTMLDialogElement,
  {
    signal,
    param = "quote",
    trigger = "[data-quote-open]",
    dirty: formDirty,
    onDiscard,
    onOpen,
  }: QuoteDialogOptions,
) {
  const find = <T extends HTMLElement>(selector: string) =>
    dialog.querySelector<T>(selector);

  const heading = find("[data-dialog-title]");
  const guard = find("[data-dialog-guard]");
  const closeButton = find("[data-dialog-close]");

  /** What opened it, so focus can go back there. */
  let opener: HTMLElement | null = null;
  /** The fallback signal: set by any edit inside the panel. */
  let touched = false;
  /** What arms the dismissal guard. */
  const dirty = () => (formDirty ? formDirty() : touched);
  /** True while we own the top history entry (see `pushEntry`). */
  let pushed = false;
  /** The router's history state for the entry underneath, held for repair. */
  let borrowed: unknown = null;
  /** The page's scroll position while it is frozen. */
  let pageY = 0;
  /** Set once the router has started a page swap — history and scroll are
   *  its business from that moment, not ours. */
  let swapping = false;

  /* ── The page behind ──────────────────────────────────────────── */

  const freezePage = () => {
    pageY = window.scrollY;
    const { style } = document.body;
    // Lenis is configured with `autoToggle`, which stands down from the
    // wrapper's own `overflow` — so this one line is the whole scroll stop.
    // A manual lenis.stop()/start() pair is exactly what that config was
    // written to avoid, and it is the pair that gets stuck (docs 14 §4).
    style.overflow = "hidden";
    // iOS throws the page's scroll position away when the body stops
    // scrolling unless the body is pinned. The negative offset is what keeps
    // the page looking untouched behind the panel.
    style.position = "fixed";
    style.insetInline = "0";
    style.top = `-${pageY}px`;
  };

  const thawPage = () => {
    const { style } = document.body;
    style.overflow = "";
    style.position = "";
    style.insetInline = "";
    style.top = "";
    // Not during a page swap: the router restores its own scroll position,
    // and two of us setting it is a fight the reader watches.
    if (!swapping) window.scrollTo(0, pageY);
  };

  /* ── History ──────────────────────────────────────────────────────
     The router listens on `popstate` too, and it treats any entry whose URL
     differs in path *or search* as a different page — so a bare `pushState`
     of `?quote=1` would make the back button re-fetch and re-swap the page it
     is already on, throwing the panel's DOM away on the way past.

     Its one escape hatch is that it ignores a `popstate` whose state is
     `null`. So the entry we hide the dialog behind is nulled on the way in
     and repaired on the way out: back closes the panel, the router stays out
     of it, and nothing about its bookkeeping is left changed. The state we
     borrow carries the router's scroll position for that entry, which is the
     part that would be missed if it were dropped rather than put back. */

  const url = () => new URL(location.href);
  const isMarked = () => url().searchParams.has(param);

  /** What a trigger asks for. Anything absent simply is not asked for. */
  const intentOf = (element: HTMLElement): QuoteIntent => ({
    item: element.dataset.quoteItem,
    rating: element.dataset.quoteRating,
    mode: element.dataset.quoteMode,
  });

  /**
   * What the URL asks for. `?quote=1` is the bare "open it" form, so the
   * value is only treated as a category when it is not that.
   */
  const intentFromUrl = (): QuoteIntent => {
    const search = url().searchParams;
    const item = search.get(param) ?? "";
    return {
      item: item && item !== "1" ? item : undefined,
      rating: search.get(RATING_PARAM) ?? undefined,
      mode: search.get(MODE_PARAM) ?? undefined,
    };
  };

  /**
   * The inline copy of the same form, if this page renders one. `/contact`
   * does; nothing else does yet.
   *
   * Deliberately looked up per call rather than cached: the client router
   * swaps the body under this script's feet, and a stale element reference
   * would point at a form that is no longer in the document.
   */
  const inlineForm = () =>
    document.querySelector<HTMLElement>(
      '[data-quote-form][data-variant="inline"]',
    );

  /**
   * Is this the homepage?
   *
   * Sibling rule to the inline one above, and the same shape: a page can say
   * that its quote CTAs are not dialog triggers. The homepage says so because
   * every one of its CTAs — the header button, the footer link, the three
   * answers in the closing band — is a link to /contact, and the page reads
   * better handing the visitor over than opening a fifteen-field form on top
   * of the thing they were still reading.
   *
   * Read per call, not cached, for the reason `inlineForm()` is: the router
   * swaps pages under this script and the answer changes when it does.
   */
  const isLanding = () => location.pathname.replace(/\/+$/, "") === "";

  /**
   * Take the customer to the form that is already on the page.
   *
   * Instant, not smooth: Lenis owns the document's scroll animation, and a
   * native smooth scroll running at the same time is a fight the reader
   * watches. `html { scroll-padding-top }` lands it clear of the fixed header
   * (styles/global.css).
   */
  const revealInline = (form: HTMLElement) => {
    form.scrollIntoView({ behavior: "auto", block: "start" });
    form
      .querySelector<HTMLInputElement>('input[name="mode"]')
      ?.focus({ preventScroll: true });
  };

  const pushEntry = (intent: QuoteIntent) => {
    // Already marked — this is a link that arrived with the parameter on it,
    // so the entry exists and pushing a second one would stack duplicates.
    if (isMarked()) return;
    const next = url();
    // The whole request goes into the URL, which is what makes it shareable —
    // the one thing a route would have given us for free (docs 14 §9b).
    next.searchParams.set(param, intent.item ?? "1");
    if (intent.rating) next.searchParams.set(RATING_PARAM, intent.rating);
    if (intent.mode) next.searchParams.set(MODE_PARAM, intent.mode);
    borrowed = history.state;
    history.replaceState(null, "", location.href);
    history.pushState(null, "", next);
    pushed = true;
  };

  /** Put the router's state back, and take the parameter off the URL. */
  const repairEntry = () => {
    if (swapping) return;
    const next = url();
    const marked = next.searchParams.has(param);
    next.searchParams.delete(param);
    next.searchParams.delete(RATING_PARAM);
    next.searchParams.delete(MODE_PARAM);
    if (borrowed !== null || marked) {
      history.replaceState(borrowed ?? history.state, "", next);
    }
    borrowed = null;
  };

  /* ── Open and close ───────────────────────────────────────────── */

  const open = (from?: HTMLElement | null, intent: QuoteIntent = {}) => {
    if (dialog.open) return;
    opener = from ?? null;
    // Before the freeze, not after: pinning the body drops the document's
    // scroll to zero, and the router records scroll into the very history
    // state this borrows.
    pushEntry(intent);
    freezePage();
    dialog.showModal();
    // The heading, not the first input: a screen reader user should hear what
    // this is before being dropped into a text field. `autofocus` in the
    // markup does the same job on first open; this re-asserts it on every
    // one, because a re-opened dialog keeps whatever had focus last.
    heading?.focus({ preventScroll: true });
    onOpen?.(intent);
  };

  const hideGuard = () => guard?.setAttribute("hidden", "");
  const showGuard = () => {
    guard?.removeAttribute("hidden");
    guard?.querySelector<HTMLElement>("[data-dialog-keep]")?.focus();
  };

  /** A close the customer asked for — it may be refused by the guard. */
  const requestClose = () => {
    if (dirty() && guard) showGuard();
    else dialog.close();
  };

  dialog.addEventListener("close", () => {
    hideGuard();
    thawPage();
    if (pushed) {
      // Unwinding our own entry fires `popstate`, which is where the
      // borrowed state goes back.
      pushed = false;
      history.back();
    } else {
      repairEntry();
    }
    // Native focus restoration only works while the trigger is still in the
    // document — after a page swap it may not be, so fall back to the one
    // element that is on every page.
    const anchor = opener?.isConnected
      ? opener
      : document.querySelector<HTMLElement>("#site-header a");
    anchor?.focus();
    opener = null;
  });

  /* ── Dismissal ────────────────────────────────────────────────── */

  // Escape. `cancel` is the platform's own "the customer asked to leave" —
  // intercepting it here is what keeps a filled-in form from vanishing.
  dialog.addEventListener("cancel", (event) => {
    if (!dirty() || !guard) return;
    event.preventDefault();
    showGuard();
  });

  // A click that lands on the dialog element itself came from the backdrop —
  // every part of the panel is a child of it.
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    if (!dirty()) {
      dialog.close();
      return;
    }
    // Refusing silently reads as a broken overlay, so point at the way out.
    closeButton?.setAttribute("data-nudge", "");
    closeButton?.focus();
    window.setTimeout(() => closeButton?.removeAttribute("data-nudge"), 400);
  });

  closeButton?.addEventListener("click", requestClose);
  guard?.querySelector("[data-dialog-keep]")?.addEventListener("click", () => {
    hideGuard();
    heading?.focus({ preventScroll: true });
  });
  guard
    ?.querySelector("[data-dialog-discard]")
    ?.addEventListener("click", () => {
      if (onDiscard) onDiscard();
      else for (const form of dialog.querySelectorAll("form")) form.reset();
      touched = false;
      dialog.close();
    });

  // The fallback. Cheap, and it cannot miss a control the way a field-by-field
  // list would — but it cannot tell an edit from an edit that was undone,
  // which is why `form.ts` overrides it.
  dialog.addEventListener("input", () => {
    touched = true;
  });
  dialog.addEventListener("change", () => {
    touched = true;
  });

  /* ── The world outside ────────────────────────────────────────── */

  document.addEventListener(
    "click",
    (event) => {
      const node = event.target;
      if (!(node instanceof Element)) return;
      const target = node.closest<HTMLElement>(trigger);
      if (!target) return;

      // The homepage does not open the dialog: its CTAs are links to
      // /contact and they stay links. Returning before `preventDefault()` is
      // the whole implementation — the anchor's own href takes over, and the
      // router picks it up exactly as it would any other link on the page.
      if (isLanding() && target.closest("a[href]")) return;

      // A trigger is usually a link to /contact, so the anchor still works
      // with no JavaScript — which is why the default has to be stopped here
      // rather than left off the markup.
      event.preventDefault();

      const inline = inlineForm();
      if (inline) {
        revealInline(inline);
        return;
      }
      open(target, intentOf(target));
    },
    // Capture, and this is load-bearing. The client router listens for clicks
    // on `document` too, it registers at module-eval in `<head>` while this
    // runs on `astro:page-load`, and it only stands down for an event that is
    // *already* defaultPrevented. In the bubble phase it therefore navigates
    // first and the panel opens over a page that is on its way out — the
    // dialog flashes up and /contact loads underneath it. Claiming the event
    // one phase earlier is what makes `preventDefault()` above mean anything.
    { signal, capture: true },
  );

  window.addEventListener(
    "popstate",
    () => {
      if (dialog.open) {
        // Our entry is gone, so there is nothing left to unwind.
        pushed = false;
        dialog.close();
      } else if (isMarked()) {
        // Forward, back onto the marked entry — re-open rather than strand
        // the customer on a URL that says the dialog is up.
        open(null, intentFromUrl());
        return;
      }
      repairEntry();
    },
    { signal },
  );

  // A top-layer element surviving a body swap is undefined behaviour, so it
  // goes before the swap does. Deliberately NOT on `signal`: that signal is
  // aborted by this very event, and an aborted listener is removed before it
  // is called.
  document.addEventListener(
    "astro:before-swap",
    () => {
      if (!dialog.open) return;
      // The router owns history and scroll from here.
      swapping = true;
      pushed = false;
      borrowed = null;
      dialog.close();
    },
    { once: true },
  );

  /**
   * A link that arrived with the parameter already on it. Nothing is
   * pre-answered yet — that is slice 8 (docs 14 §9b).
   *
   * It waits for the onboarding intro (docs 12) rather than animating over
   * it: two entrances at once reads as a misfire. The intro is switched off
   * today, and `html[data-intro]` is how it announces itself — so this stays
   * correct if it is ever restored.
   */
  const openWhenArrived = () => {
    // On a page that already shows the form, the parameter scrolls to it and
    // does not open a second copy (docs 14 §9).
    const inline = inlineForm();
    if (inline) {
      revealInline(inline);
      repairEntry();
      return;
    }
    const root = document.documentElement;
    if (!root.hasAttribute("data-intro")) {
      open(null, intentFromUrl());
      return;
    }
    const waiting = new MutationObserver(() => {
      if (root.hasAttribute("data-intro")) return;
      waiting.disconnect();
      open(null, intentFromUrl());
    });
    waiting.observe(root, { attributeFilter: ["data-intro"] });
    signal.addEventListener("abort", () => waiting.disconnect(), {
      once: true,
    });
  };

  if (isMarked()) openWhenArrived();
}
