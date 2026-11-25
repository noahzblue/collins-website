/**
 * The quote form's behaviour — one instance, one root element.
 *
 * State lives in the DOM. There is no parallel object kept in step with the
 * controls: `readState()` reads the form and everything downstream is derived
 * from that. A form is already a state container, and the second copy is what
 * drifts (docs/site-expansion/14 §15.4).
 *
 * Everything is queried through the `<form>` it is handed. **The script never
 * touches `document` for anything belonging to an instance** — that is what
 * makes two copies on one page safe, and it is not optional (§2). The one
 * exception is the catalogue JSON, which §13 says to emit once per document
 * and let every instance read.
 *
 * What it owns:
 *
 * - the conditional reveals — which rating list, which terms panel, whether
 *   the duty box or the attachments field exists at all;
 * - the running summary, which is `compose.ts`'s answer painted into slots;
 * - the four steps below 900px, and only below 900px;
 * - validation, which is `validate.ts`'s answer painted onto fields;
 * - the submit path — handoff first, in the gesture, then the POST.
 *
 * What it does not own: any copy (`lib/quote/options.ts`), any derived string
 * (`lib/quote/compose.ts`), the rules (`lib/quote/validate.ts`), or the
 * network (`lib/quote/submit.ts`). Those are all pure and testable without a
 * browser; this file is the part that cannot be.
 */

import type { Availability } from "@/lib/equipment";
import { toMessage, toPayload, toSummary } from "@/lib/quote/compose";
import {
  DESTINATIONS,
  FIELD_COPY,
  HONEYPOT,
  MODES,
  NAV,
  PREFILL,
  SECTION_ERRORS,
  SECTIONS,
  SUMMARY,
} from "@/lib/quote/options";
import {
  EMPTY_STATE,
  OTHER_CATEGORY,
  UNSURE_RATING,
  type Channel,
  type QuoteContext,
  type QuoteIntent,
  type QuoteMode,
  type QuoteState,
  type QuoteVariant,
  type SectionId,
} from "@/lib/quote/schema";
import { submitQuote } from "@/lib/quote/submit";
import { validate, type QuoteError } from "@/lib/quote/validate";
import { lenis } from "@/scripts/scroll";
import { clearDraft, isDirty, loadDraft, saveDraft } from "./draft";
import { morph, setShown, setText, type MotionKind } from "./motion";
import { initCategoryPicker, type CategoryPickerApi } from "./picker";
import { initScrollHint } from "./scroll-hint";

/** The order of the four sections. `QuoteForm.astro` renders them in it. */
const ORDER: SectionId[] = ["need", "size", "terms", "contact"];

/**
 * A bot fills every input it finds and does it the instant the page parses.
 * A person cannot answer fifteen fields in three seconds. Between them, the
 * honeypot and this interval are the whole spam defence — and unlike a CAPTCHA
 * neither costs the customer anything (docs 14 §8).
 */
const MIN_FILL_MS = 3000;

/** What one category's ranges look like once they reach the client (§13). */
interface Catalogue {
  [id: string]: {
    name: string;
    /* Keyed by `rangeKey()`, because a label is not unique inside a
       category — see `lib/equipment.ts`. */
    ranges: Record<
      string,
      { label: string; powerType: string | null; availability: Availability }
    >;
  };
}

export interface QuoteFormOptions {
  /** Aborted when the client router swaps this page out. */
  signal: AbortSignal;
}

export interface QuoteFormApi {
  /** True when the customer has answered anything — arms the dismissal guard. */
  isDirty: () => boolean;
  /** Back to a blank form, draft cleared. What "Discard" does. */
  reset: () => void;
  /** Pre-answer sections 01 and 02 from a trigger or a link (docs 14 §9). */
  prefill: (intent: QuoteIntent) => void;
  /** The dialog has just opened. Arms the one-time "More below" cue. */
  opened: () => void;
}

export function initQuoteForm(
  root: HTMLElement,
  { signal }: QuoteFormOptions,
): QuoteFormApi | null {
  const form = root.querySelector<HTMLFormElement>("[data-quote-form]");
  if (!form) return null;

  const instance = form.dataset.instance ?? "quote";
  const variant = (form.dataset.variant ?? "dialog") as QuoteVariant;
  const mountedAt = Date.now();

  const find = <T extends HTMLElement>(selector: string) =>
    form.querySelector<T>(selector);
  const findAll = <T extends HTMLElement>(selector: string) => [
    ...form.querySelectorAll<T>(selector),
  ];

  /* This instance's own copy first, and any copy on the page second.
     §13 asks for one blob per document; two instances currently render two
     identical ones, and preferring the local tag means an instance always
     reads the data it was rendered with rather than a neighbour's. */
  const catalogue: Catalogue = (() => {
    const tag =
      root.querySelector("[data-quote-catalogue]") ??
      document.querySelector("[data-quote-catalogue]");
    try {
      return JSON.parse(tag?.textContent ?? "{}") as Catalogue;
    } catch {
      return {};
    }
  })();

  /* The panel that scrolls. Inside the dialog it is the body; inline it is the
     document. Lenis owns the document and not this container, and
     `scrollIntoView` would move both — so the container is asked directly
     (docs 14 §4). */
  const scroller = form.closest<HTMLElement>("[data-dialog-scroll]");

  const sections = ORDER.map((id) =>
    find<HTMLElement>(`[data-section="${id}"]`),
  );
  const live = find<HTMLElement>("[data-quote-live]");
  const successPanel = root.querySelector<HTMLElement>("[data-quote-success]");
  /* Two copies: one at the end of the form for phones, one in the summary
     rail under its Send button. CSS shows the one for the current width. */
  const errorPanels = findAll<HTMLElement>("[data-quote-error]");
  const showError = (on: boolean) => {
    for (const panel of errorPanels) show(panel, on);
  };
  const submitButtons = findAll<HTMLButtonElement>("[data-quote-submit]");
  const submitLabels = findAll<HTMLElement>("[data-submit-label]");

  /* The machine picker's field and viewer. Its radios are ordinary form
     radios; the picker only paints the field and runs the viewer. */
  const pickers = findAll<HTMLElement>("[data-category-picker]")
    .map((picker) => initCategoryPicker(picker, { signal }))
    .filter((picker): picker is CategoryPickerApi => picker !== null);

  /** Below this the four sections become four steps. */
  const sheet = window.matchMedia("(max-width: 900px)");

  let step = 0;
  let busy = false;
  /** Errors already shown. Blur repaints one field; submit paints all. */
  let shown: QuoteError[] = [];

  /** Every show and hide in the form moves the same way (./motion.ts). */
  const show = (
    element: Element | null | undefined,
    on: boolean,
    kind: MotionKind = "grow",
  ) => {
    if (element instanceof HTMLElement) setShown(element, on, { kind });
  };

  /* A radio click fires `input` and `change`, and a keystroke fires `input`
     per character. One repaint per frame is enough for either. */
  let queued = 0;
  const schedule = () => {
    if (queued) return;
    queued = requestAnimationFrame(() => {
      queued = 0;
      sync();
    });
  };

  /* ── Reading the form ─────────────────────────────────────────── */

  const raw = (name: string): string => {
    const field = form.elements.namedItem(name);
    if (!field) return "";
    if (field instanceof RadioNodeList) return field.value;
    if (field instanceof HTMLInputElement) {
      return field.type === "checkbox"
        ? field.checked
          ? "on"
          : ""
        : field.value;
    }
    if (
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      return field.value;
    }
    return "";
  };

  const readState = (): QuoteState => ({
    ...EMPTY_STATE,
    mode: (raw("mode") || null) as QuoteMode | null,
    category: raw("category") || null,
    otherItem: raw("otherItem"),
    family: raw("family"),
    rating: raw("rating") || null,
    duty: raw("duty"),
    quantity: Number(raw("quantity")) || 1,
    attachments: raw("attachments"),
    startDate: raw("startDate"),
    duration: raw("duration") || null,
    emirate: raw("emirate") || null,
    transport: raw("transport") || null,
    condition: raw("condition") || null,
    timeframe: raw("timeframe") || null,
    destination: raw("destination") || null,
    docs: raw("docs") === "on",
    name: raw("name"),
    company: raw("company"),
    phone: raw("phone"),
    email: raw("email"),
    channel: (raw("channel") || "email") as Channel,
    notes: raw("notes"),
  });

  /** The facts the state does not carry, from the catalogue (§13). */
  const buildContext = (state: QuoteState): QuoteContext => {
    const entry =
      state.category && state.category !== OTHER_CATEGORY
        ? catalogue[state.category]
        : undefined;
    const range =
      entry && state.rating && state.rating !== UNSURE_RATING
        ? entry.ranges[state.rating]
        : undefined;

    return {
      category: entry ? { id: state.category!, name: entry.name } : null,
      rating: range
        ? {
            // The quotable string, not the key the radio carries.
            label: range.label,
            powerType: range.powerType ?? undefined,
            availability: range.availability,
          }
        : null,
      source: { page: location.pathname, variant },
      submittedAt: new Date().toISOString(),
    };
  };

  const today = () => new Date().toISOString().slice(0, 10);

  /* ── Painting ─────────────────────────────────────────────────── */

  const paintSummary = (state: QuoteState) => {
    const slots = toSummary(state, buildContext(state));
    const wanted = new Map(
      slots.map((slot) => [slot.key as string, slot.value]),
    );

    /* Buy and hire ask different things, so a mode change swaps whole
       rows. The list's height eases while the rows swap (motion.ts `morph`);
       growing one set while collapsing the other showed both at once. */
    for (const list of findAll<HTMLElement>("[data-summary-slots]"))
      morph(list, () => {
        for (const row of list.querySelectorAll<HTMLElement>(
          "[data-summary-slot]",
        )) {
          const key = row.dataset.summarySlot ?? "";
          const applies = wanted.has(key);
          show(row, applies, "dissolve");
          if (!applies) continue;

          const value = wanted.get(key) ?? null;
          const cell = row.querySelector<HTMLElement>("[data-summary-value]");
          if (!cell) continue;
          setText(cell, value ?? SUMMARY.pending);
          cell.toggleAttribute("data-answered", value !== null);
        }
      });
  };

  /**
   * Everything that depends on an answer already given. Runs on every change,
   * because working out what changed costs more than repainting.
   */
  const sync = () => {
    const state = readState();

    // The rating list's availability vocabulary is CSS off this attribute:
    // both readings are rendered and one is shown (docs 14 §3).
    form.dataset.mode = state.mode ?? "";
    form.dataset.category = state.category ?? "";
    // A draft, a prefill or a reset ticks radios without a `change`.
    for (const picker of pickers) picker.paint();

    /* 02 — three shapes, one section. One shape replaces another, so the
       section's height eases rather than jumping (motion.ts `morph`). */
    const isOther = state.category === OTHER_CATEGORY;
    let panel: HTMLElement | null = null;
    morph(find("[data-size-empty]")?.parentElement, () => {
      show(find("[data-size-empty]"), !state.category, "fade");
      show(find("[data-size-machine]"), !!state.category && !isOther, "fade");
      show(find("[data-size-other]"), isOther, "fade");
      for (const candidate of findAll<HTMLElement>("[data-rating-panel]")) {
        const active = candidate.dataset.ratingPanel === state.category;
        show(candidate, active, "fade");
        if (active) panel = candidate;
      }
    });
    const activePanel = panel as HTMLElement | null;

    const sizingMe = state.rating === UNSURE_RATING;
    /* One duty box, shared by every machine's list: it lives inside the
       "Not sure" answer of whichever list is showing (RatingList.astro).
       Moving the element keeps what was typed in it. */
    const duty = find<HTMLElement>('[data-conditional="duty"]');
    const dutySlot = activePanel?.querySelector("[data-unsure-slot]");
    if (duty && dutySlot && duty.parentElement !== dutySlot)
      dutySlot.append(duty);
    show(duty, sizingMe);
    // The one moment the sizing guide helps is the moment somebody says they
    // cannot size it themselves (docs 14 §10b).
    if (sizingMe)
      activePanel?.querySelector("[data-duty-guide]")?.setAttribute("open", "");

    show(
      find('[data-conditional="attachments"]'),
      !!activePanel?.hasAttribute("data-attachments"),
    );
    // Trailers: which one, and where it is going. "How many" is not a
    // question a movement has an answer to.
    show(
      find('[data-conditional="quantity"]'),
      !activePanel?.hasAttribute("data-no-quantity"),
    );

    /* 03 — one panel per mode, and never two. The hire and buy terms are
       different heights; the section eases between them. */
    morph(find("[data-terms-empty]")?.parentElement, () => {
      show(find("[data-terms-empty]"), !state.mode, "fade");
      for (const candidate of findAll<HTMLElement>("[data-mode-panel]")) {
        show(candidate, candidate.dataset.modePanel === state.mode, "fade");
      }
    });

    show(
      find("[data-export-note]"),
      state.mode === "buy" &&
        !!state.destination &&
        state.destination !== DESTINATIONS[0].value,
    );

    paintSummary(state);
    // Only once there is something worth keeping — writing a blank draft on
    // load would mean every visitor leaves one behind.
    if (isDirty(state)) saveDraft(instance, state);
    else clearDraft(instance);
  };

  /* ── Errors ───────────────────────────────────────────────────── */

  const errorSlots = (field: string) =>
    findAll<HTMLElement>(`[data-error-for="${field}"]`);

  const paintError = (field: string, message: string | null) => {
    for (const slot of errorSlots(field)) {
      // The old text stays while the slot collapses, then goes: an empty
      // slot would have no height to collapse from.
      if (message) slot.textContent = message;
      setShown(slot, !!message, {
        onHidden: () => {
          slot.textContent = "";
        },
      });
    }
    for (const group of findAll<HTMLElement>(
      `[data-chip-group="${field}"] [role="radiogroup"]`,
    )) {
      group.classList.toggle("chip-group-error", !!message);
      group.toggleAttribute("aria-invalid", !!message);
    }

    for (const control of findAll<HTMLElement>(`[data-field="${field}"]`)) {
      control.classList.toggle("ctl-error", !!message);
      if (message) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
    }
  };

  /** The control an error belongs to: the first radio of a group, or the
   *  field itself. The rating's radios live in the visible panel only. */
  const controlFor = (field: string) =>
    form.querySelector<HTMLElement>(`[data-chip-group="${field}"] input`) ??
    form.querySelector<HTMLElement>(`[data-field="${field}"]`) ??
    form.querySelector<HTMLElement>(
      `[data-rating-panel]:not([hidden]) input[name="${field}"]`,
    ) ??
    form.querySelector<HTMLElement>(`input[name="${field}"]`);

  /**
   * Each section lists its own errors at its top. The rows are buttons built
   * here, from `shown`, so the list can never disagree with the fields.
   */
  const paintSectionErrors = () => {
    ORDER.forEach((id, index) => {
      const box = sections[index]?.querySelector<HTMLElement>(
        "[data-section-errors]",
      );
      if (!box) return;
      const mine = shown.filter((error) => error.section === id);
      show(box, mine.length > 0);
      // Keep the last rows while the box collapses.
      if (!mine.length) return;

      /* Leave the list alone when nothing in it changed. Clicking a row
         blurs the field you were in, the blur repaints these errors, and a
         rebuilt list swaps the button out between mousedown and click: the
         click lands on nothing and the jump needs a second try. */
      const signature = mine.map((e) => `${e.field}:${e.message}`).join("|");
      if (box.dataset.signature === signature) return;
      box.dataset.signature = signature;
      const title = box.querySelector<HTMLElement>(
        "[data-section-errors-title]",
      );
      const list = box.querySelector<HTMLElement>("[data-section-errors-list]");
      setText(title, SECTION_ERRORS.title(mine.length));
      list?.replaceChildren(
        ...mine.map((error) => {
          const item = document.createElement("li");
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.errorJump = error.field;
          const label = document.createElement("span");
          label.className = "q-errors-field";
          label.textContent =
            (FIELD_COPY as Record<string, { label: string }>)[error.field]
              ?.label ?? error.field;
          // The message is its own span so only it underlines on hover.
          const message = document.createElement("span");
          message.className = "q-errors-message";
          message.textContent = error.message;
          button.append(label, message);
          item.append(button);
          return item;
        }),
      );
      // A list that changed while open eases its new rows in rather than
      // swapping them bare (motion.ts).
      if (list && list.getClientRects().length)
        for (const [i, item] of [...list.children].entries())
          (item as HTMLElement).animate(
            [
              { opacity: 0, transform: "translateY(4px)" },
              { opacity: 1, transform: "none" },
            ],
            {
              duration: 220,
              delay: i * 40,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "backwards",
            },
          );
    });
  };

  const clearErrors = () => {
    for (const error of shown) paintError(error.field, null);
    shown = [];
    paintSectionErrors();
  };

  const paintErrors = (errors: QuoteError[]) => {
    clearErrors();
    for (const error of errors) paintError(error.field, error.message);
    shown = errors;
    paintSectionErrors();
  };

  /**
   * After an answer changes, drop the errors it fixed. Never adds one: a
   * field the customer has not reached yet stays quiet until submit.
   */
  const refreshShown = () => {
    if (!shown.length) return;
    const current = validate(readState(), today());
    const still: QuoteError[] = [];
    for (const error of shown) {
      const match = current.find((c) => c.field === error.field);
      paintError(error.field, match?.message ?? null);
      if (match) still.push(match);
    }
    shown = still;
    paintSectionErrors();
  };

  /* ── Steps ────────────────────────────────────────────────────── */

  /** `direction` is where the new step comes from: 1 from the right
   *  (forward), -1 from the left (back), 0 for no travel. */
  const applyStepVisibility = (direction = 0) => {
    sections.forEach((section, index) => {
      if (section)
        setShown(section, !sheet.matches || index === step, {
          kind: "fade",
          from: direction * 24,
        });
    });
  };

  const paintProgress = () => {
    const id = ORDER[step];
    form.dataset.step = id;
    const count = find<HTMLElement>("[data-progress-count]");
    const title = find<HTMLElement>("[data-progress-title]");
    const fill = find<HTMLElement>("[data-progress-fill]");
    setText(count, NAV.counter(step + 1, ORDER.length));
    setText(title, SECTIONS[id].title);
    fill?.style.setProperty("--t", String((step + 1) / ORDER.length));
  };

  /**
   * The panel's own scroll inside the dialog; Lenis on the page inline (§4).
   * `offset` is extra room to leave above the target, for a pinned section
   * head that would otherwise cover it.
   */
  const scrollTo = (element: HTMLElement | null, smooth = true, offset = 0) => {
    const behavior: ScrollBehavior = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
      ? "auto"
      : smooth
        ? "smooth"
        : "auto";

    if (!scroller) {
      /* The inline variant: the document is the scroller and Lenis owns it,
         so Lenis does the easing. It reads `scroll-padding-top` itself, which
         clears the fixed header (scripts/scroll.ts). */
      lenis.scrollTo(element ?? 0, {
        offset: -offset,
        immediate: behavior === "auto",
      });
      return;
    }
    const top = element
      ? element.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop
      : 0;
    scroller.scrollTo({ top: Math.max(0, top - 8 - offset), behavior });
  };

  /**
   * The boxes an answer can open that ask you to type ("Not sure? Size it
   * for me" opens the duty box). On a phone the box opens below the fold,
   * under the step bar, and the customer could not see where to type.
   */
  const typingBoxes = findAll<HTMLElement>("[data-conditional]").filter(
    (box) =>
      box.querySelector(
        'textarea, input:not([type="radio"]):not([type="checkbox"])',
      ) !== null,
  );

  /** Scroll just far enough that `box` sits fully above the phone's step
   *  bar (or the bottom of the sheet). Nothing moves if it already fits. */
  const revealAboveNav = (box: HTMLElement) => {
    if (!box.getClientRects().length) return;
    const nav = find<HTMLElement>("[data-quote-nav]");
    const navTop =
      nav && nav.getClientRects().length && nav.offsetHeight
        ? nav.getBoundingClientRect().top
        : (scroller?.getBoundingClientRect().bottom ?? window.innerHeight);
    const overflow = box.getBoundingClientRect().bottom - (navTop - 24);
    if (overflow <= 0) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (scroller)
      scroller.scrollBy({
        top: overflow,
        behavior: smooth ? "smooth" : "auto",
      });
    else lenis.scrollTo(window.scrollY + overflow, { immediate: !smooth });
  };

  /** A box that has just opened, once it has grown (motion.ts, 320ms). Focus
   *  goes in only with a mouse: on a touchscreen it would throw up the
   *  keyboard over the box you were about to read. */
  const bringIntoView = (box: HTMLElement) => {
    window.setTimeout(() => {
      revealAboveNav(box);
      if (window.matchMedia("(pointer: fine)").matches)
        box
          .querySelector<HTMLElement>("textarea, input")
          ?.focus({ preventScroll: true });
    }, 340);
  };

  /* A field tapped on a phone. The keyboard opening shrinks the sheet
     (dialog.ts follows the visual viewport), and iOS scrolls the focused
     field into view against the sheet's old height, so the field ends up
     under the keyboard. Wait for the viewport to settle, then lift the field,
     with its box when it sits in one, above the step bar. */
  form.addEventListener(
    "focusin",
    (event) => {
      const field = event.target;
      if (
        !(field instanceof HTMLTextAreaElement) &&
        !(
          field instanceof HTMLInputElement &&
          !["radio", "checkbox", "button", "submit"].includes(field.type)
        )
      )
        return;
      if (!window.matchMedia("(pointer: coarse)").matches) return;
      const box = field.closest<HTMLElement>("[data-conditional]") ?? field;
      const viewport = window.visualViewport;
      let done = false;
      const settle = () => {
        if (done) return;
        done = true;
        viewport?.removeEventListener("resize", onResize);
        // One more frame so the sheet has taken the new height.
        requestAnimationFrame(() => revealAboveNav(box));
      };
      let timer = 0;
      const onResize = () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(settle, 120);
      };
      viewport?.addEventListener("resize", onResize, { signal });
      // The keyboard may already be up (moving between fields): no resize.
      timer = window.setTimeout(settle, 450);
    },
    { signal },
  );

  /** Bring one field into view under its section's pinned head, and focus it. */
  const jumpTo = (field: string) => {
    const control = controlFor(field);
    if (!control) return;
    const section = control.closest<HTMLElement>("[data-section]");
    const head = section?.querySelector<HTMLElement>("[data-section-head]");
    // Below 900 the head does not pin, so it takes no room.
    const pinned =
      head && getComputedStyle(head).position === "sticky"
        ? head.offsetHeight + 16
        : 16;
    /* Aim at the whole group or field, so its label and message show too. */
    const target =
      control.closest<HTMLElement>("fieldset, [data-rating-panel]") ??
      control.parentElement ??
      control;
    scrollTo(target, true, pinned);
    control.focus({ preventScroll: true });
  };

  /**
   * Move to a step. **Never called on load** — the prototype jumped 424px on
   * init and threw its own headline away before it was read (docs 14 §6).
   */
  const goTo = (index: number) => {
    const before = step;
    step = Math.min(Math.max(index, 0), ORDER.length - 1);
    applyStepVisibility(Math.sign(step - before));
    paintProgress();
    /* iOS Safari does not repaint the sticky step bar when only the
       `data-step` rule changes which buttons it shows: Back stayed missing
       and Continue was drawn with a stripe cut out of it. Taking the bar
       out of the render tree for one layout forces a full repaint. */
    const nav = find<HTMLElement>("[data-quote-nav]");
    if (nav) {
      nav.style.display = "none";
      void nav.offsetHeight;
      nav.style.removeProperty("display");
    }
    const id = ORDER[step];
    if (live)
      live.textContent = NAV.announce(
        step + 1,
        ORDER.length,
        SECTIONS[id].title,
      );
    scrollTo(sheet.matches ? null : sections[step]);
  };

  /**
   * Where an invalid submit goes: the top of the first section with a
   * problem, where its error box lists everything to fix. Focus goes to the
   * first control without moving the scroll, so the box stays in view.
   */
  const focusFirstError = (errors: QuoteError[]) => {
    const first = errors[0];
    if (!first) return;
    const index = ORDER.indexOf(first.section);
    if (index < 0) return;
    if (sheet.matches && index === step) scrollTo(null);
    else goTo(index);
    controlFor(first.field)?.focus({ preventScroll: true });
  };

  /* ── Submitting ───────────────────────────────────────────────── */

  /* While the request is in flight the form says so three ways, all calm:
     the send button steps through `SUMMARY.sending`, the answers dim behind
     it (`data-sending`, styled in QuoteForm.astro), and the phone's step bar
     runs a slow sweep (QuoteProgress.astro). */
  let sendingTimer = 0;
  const setBusy = (on: boolean) => {
    busy = on;
    form.toggleAttribute("data-sending", on);
    for (const button of submitButtons) {
      button.disabled = on;
      button.setAttribute("aria-busy", String(on));
    }
    window.clearInterval(sendingTimer);
    let line = 0;
    const paint = () => {
      for (const label of submitLabels)
        setText(label, on ? SUMMARY.sending[line] : SUMMARY.submit);
    };
    paint();
    if (on)
      sendingTimer = window.setInterval(() => {
        line = Math.min(line + 1, SUMMARY.sending.length - 1);
        paint();
      }, 1600);
  };

  /* Back to the top of the sheet, for good. A smooth scroll still running
     (a field brought into view on the last step, or a fling) ignores a
     plain jump to the top and carries on, which left the success screen
     scrolled to its foot (reported 2026-11-23). Cancelling it means setting
     the position directly, then again after the next frames in case the
     browser was mid-step. */
  const toTop = () => {
    const jump = () => {
      if (scroller) scroller.scrollTop = 0;
      else lenis.scrollTo(0, { immediate: true, force: true });
    };
    jump();
    requestAnimationFrame(() => requestAnimationFrame(jump));
    window.setTimeout(jump, 160);
  };

  const showSuccess = (state: QuoteState, ref?: string) => {
    if (!successPanel) return;
    const recap = successPanel.querySelector<HTMLElement>(
      "[data-success-recap]",
    );
    if (recap) {
      /* Fill and unhide the rows the component already rendered — never build
         them here. An element created at runtime carries no scoped-style class,
         so `document.createElement("div")` came out of `QuoteSuccess`'s CSS
         completely unstyled (see the note at the top of that file). */
      const answered = new Map(
        toSummary(state, buildContext(state))
          .filter((slot) => slot.value !== null)
          .map((slot) => [slot.key, slot.value as string]),
      );
      for (const row of recap.querySelectorAll<HTMLElement>(
        "[data-recap-slot]",
      )) {
        const value = answered.get(row.dataset.recapSlot as never);
        row.hidden = value === undefined;
        const cell = row.querySelector<HTMLElement>("[data-recap-value]");
        if (cell) cell.textContent = value ?? "";
      }
    }

    const refRow =
      successPanel.querySelector<HTMLElement>("[data-success-ref]");
    const refValue = successPanel.querySelector<HTMLElement>(
      "[data-success-ref-value]",
    );
    if (refRow) refRow.hidden = !ref;
    if (refValue && ref) refValue.textContent = ref;

    form.hidden = true;
    toTop();
    setShown(successPanel, true, { kind: "fade" });
    clearDraft(instance);
    successPanel
      .querySelector<HTMLElement>("[data-success-title]")
      ?.focus({ preventScroll: true });
  };

  const send = (state: QuoteState) => {
    const context = buildContext(state);
    const message = toMessage(state, context);

    /* Every request is emailed to Collins by `/api/quote`, whatever the
       channel — `channel` is only how the customer wants to be answered. The
       WhatsApp and mailto handoffs were removed on 2026-11-21 (docs 14 §12),
       so the POST is the only delivery and its result is the answer. */
    setBusy(true);
    showError(false);

    /* Never shorter than a moment. A reply that lands in 150ms flashed the
       loader and the success screen arrived as a jolt; held for most of a
       second, the send reads as something that happened. */
    const settle = new Promise((resolve) => window.setTimeout(resolve, 900));
    Promise.all([submitQuote(toPayload(state, context), message), settle]).then(
      ([result]) => {
        setBusy(false);
        if (result.ok) showSuccess(state, result.ref);
        else showError(true);
      },
    );
  };

  /* ── Wiring ───────────────────────────────────────────────────── */

  form.addEventListener("input", schedule);
  form.addEventListener("change", (event) => {
    const target = event.target;
    // A different machine means a different size ladder, and the answer to
    // the old one is not an answer to the new one.
    if (target instanceof HTMLInputElement && target.name === "category") {
      const ratings = form.elements.namedItem("rating");
      if (ratings instanceof RadioNodeList) {
        for (const input of ratings) {
          if (input instanceof HTMLInputElement) input.checked = false;
        }
      }
    }
    // A chip tapped or a box ticked answers the question now, not on blur.
    refreshShown();
    const closed = typingBoxes.filter(
      (box) =>
        box.hidden &&
        target instanceof Element &&
        box.closest("[data-section]") === target.closest("[data-section]"),
    );
    schedule();
    // `schedule` repaints on the next frame; look one frame after that.
    if (closed.length)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const opened = closed.find((box) => !box.hidden);
          if (opened) bringIntoView(opened);
        }),
      );
  });

  // On blur, never on keystroke — an error that appears while you are still
  // typing the answer is an error you learn to ignore (docs 14 §11).
  form.addEventListener(
    "focusout",
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const field = target.getAttribute("name");
      if (!field || !shown.length) return;
      const current = validate(readState(), today());
      const match = current.find((error) => error.field === field);
      paintError(field, match?.message ?? null);
      shown = shown.filter((error) => error.field !== field);
      if (match) shown = [...shown, match];
      paintSectionErrors();
    },
    true,
  );

  form.addEventListener("click", (event) => {
    const jump = (event.target as Element | null)?.closest<HTMLElement>(
      "[data-error-jump]",
    );
    if (jump?.dataset.errorJump) jumpTo(jump.dataset.errorJump);
  });

  find("[data-quote-next]")?.addEventListener("click", () => {
    const errors = validate(readState(), today()).filter(
      (error) => error.section === ORDER[step],
    );
    // Mobile "Continue" validates the step it is on and names what is missing
    // — the prototype's dead-end was leaving it silent (docs 14 §11).
    paintErrors(errors);
    if (errors.length) {
      focusFirstError(errors);
      return;
    }
    goTo(step + 1);
  });

  find("[data-quote-back]")?.addEventListener("click", () => goTo(step - 1));

  successPanel
    ?.querySelector("[data-quote-restart]")
    ?.addEventListener("click", () => {
      reset();
      setShown(successPanel, false, { kind: "fade" });
      setShown(form, true, { kind: "fade" });
      scrollTo(null, false);
    });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (busy) return;

    const state = readState();

    /* Spam, answered silently. Telling a bot it was caught only teaches the
       next one (docs 14 §12). */
    const honeypot = form.elements.namedItem(HONEYPOT);
    const trapped =
      (honeypot instanceof HTMLInputElement && honeypot.value !== "") ||
      Date.now() - mountedAt < MIN_FILL_MS;
    if (trapped) {
      showSuccess(state);
      return;
    }

    const errors = validate(state, today());
    paintErrors(errors);
    // Submit always does something. A no-op is never acceptable (§11).
    if (errors.length) {
      focusFirstError(errors);
      if (live) live.textContent = errors[0].message;
      return;
    }
    send(state);
  });

  sheet.addEventListener("change", () => applyStepVisibility(), { signal });

  /* ── Pinned heads ─────────────────────────────────────────────── */

  /* A section head is pinned once the content above it has scrolled past
     its `top`. A 1px sentinel just before each head leaves the root's top
     edge at that moment; that is the whole test. The hairline it turns on
     is CSS (QuoteSection). */
  const heads = findAll<HTMLElement>("[data-section-head]");
  if (heads.length && "IntersectionObserver" in window) {
    let observer: IntersectionObserver | null = null;
    const watch = () => {
      observer?.disconnect();
      const top = parseFloat(getComputedStyle(heads[0]).top) || 0;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const head = entry.target.nextElementSibling;
            const rootTop = entry.rootBounds?.top ?? 0;
            head?.toggleAttribute(
              "data-stuck",
              !entry.isIntersecting && entry.boundingClientRect.top < rootTop,
            );
          }
        },
        { root: scroller, rootMargin: `${-top - 1}px 0px 0px 0px` },
      );
      for (const head of heads) {
        let sentinel = head.previousElementSibling;
        if (
          !(sentinel instanceof HTMLElement) ||
          !sentinel.hasAttribute("data-head-sentinel")
        ) {
          sentinel = document.createElement("div");
          sentinel.setAttribute("data-head-sentinel", "");
          sentinel.setAttribute("aria-hidden", "true");
          head.before(sentinel);
        }
        observer.observe(sentinel);
      }
    };
    watch();
    signal.addEventListener("abort", () => observer?.disconnect());

    /* Between 900 and 1240 the summary is a bar pinned across the top, and
       the heads pin under it. Its height changes as answers fill it, so it
       is measured rather than guessed. */
    const bar = form.querySelector<HTMLElement>("[data-quote-summary]");
    if (bar && "ResizeObserver" in window) {
      const resize = new ResizeObserver(() => {
        form.style.setProperty("--q-bar-h", `${bar.offsetHeight}px`);
        watch();
      });
      resize.observe(bar);
      signal.addEventListener("abort", () => resize.disconnect());
    }
  }

  /* ── Start ────────────────────────────────────────────────────── */

  const apply = (state: QuoteState) => {
    for (const [field, value] of Object.entries(state)) {
      const group = form.elements.namedItem(field);
      if (!group) continue;
      if (group instanceof RadioNodeList) {
        /* Every machine's list has its own "unsure" radio under one name, so
           a rating only counts inside the restored machine's panel. Without
           this the last list's copy won and the showing list read unticked. */
        const panel =
          field === "rating" && state.category
            ? form.querySelector(
                `[data-rating-panel="${CSS.escape(state.category)}"]`,
              )
            : null;
        for (const input of group) {
          if (input instanceof HTMLInputElement) {
            input.checked =
              value !== null &&
              input.value === String(value) &&
              (!panel || panel.contains(input));
          }
        }
      } else if (group instanceof HTMLInputElement) {
        if (group.type === "checkbox") group.checked = value === true;
        else group.value = value === null ? "" : String(value);
      } else if (
        group instanceof HTMLTextAreaElement ||
        group instanceof HTMLSelectElement
      ) {
        group.value = value === null ? "" : String(value);
      }
    }
  };

  const reset = () => {
    // `form.reset()` restores what the server rendered — quantity 1, transport
    // "deliver", channel "email" — which is the right blank form, and a
    // better one than `EMPTY_STATE` would give.
    form.reset();
    clearDraft(instance);
    clearErrors();
    step = 0;
    applyStepVisibility();
    paintProgress();
    sync();
  };

  // A hire start date in the past is not a start date. The `min` is set here
  // rather than in the markup because a static build would bake in the build
  // date and happily accept yesterday three weeks later.
  const startDate = find<HTMLInputElement>("[data-min-today]");
  if (startDate) startDate.min = today();

  const draft = loadDraft(instance);
  if (draft) apply(draft);

  applyStepVisibility();
  paintProgress();
  sync();

  /* ── Pre-answering ────────────────────────────────────────────── */

  /** Tick one radio by value, optionally only inside a given container. */
  const check = (name: string, value: string, within?: HTMLElement) => {
    const scope = within ?? form;
    const input = scope.querySelector<HTMLInputElement>(
      `input[name="${name}"][value="${CSS.escape(value)}"]`,
    );
    if (!input) return false;
    input.checked = true;
    return true;
  };

  /**
   * A rating given as a key, or as the label a hand-written link would use.
   *
   * §9 shows `rating=250%20KVA` — a label — and the radios are keyed on
   * `rangeKey()`, so both have to resolve. A label that matches two ranges
   * (forklifts have two "3 ton") resolves to the first, which is better than
   * refusing a link that a person wrote by hand.
   */
  const resolveRating = (item: string, given: string) => {
    if (given === UNSURE_RATING) return given;
    const ranges = catalogue[item]?.ranges;
    if (!ranges) return null;
    if (ranges[given]) return given;
    const wanted = given.trim().toLowerCase();
    const match = Object.entries(ranges).find(
      ([, range]) => range.label.trim().toLowerCase() === wanted,
    );
    return match?.[0] ?? null;
  };

  const prefill = (intent: QuoteIntent) => {
    // Anything the catalogue does not recognise is dropped in silence. A bad
    // link must never produce an error state (docs 14 §9).
    let answered = false;

    if (intent.mode && MODES.some((option) => option.value === intent.mode)) {
      answered = check("mode", intent.mode) || answered;
    }

    const item = intent.item;
    const known = !!item && (item === OTHER_CATEGORY || !!catalogue[item]);
    if (item && known) {
      answered = check("category", item) || answered;
      // Sync first: the rating radios live in a panel that is hidden until the
      // category is set, and a hidden panel is still queryable — but ticking
      // one in the wrong panel would set the wrong size.
      sync();
      if (intent.rating) {
        const key = resolveRating(item, intent.rating);
        const panel = find<HTMLElement>(
          `[data-rating-panel="${CSS.escape(item)}"]`,
        );
        if (key && panel) answered = check("rating", key, panel) || answered;
      }
    }

    if (!answered) return;
    sync();

    /* The chip is a phone device only — above 900px the summary rail already
       says all of this (docs 14 §9a). */
    const chip = find<HTMLElement>("[data-quote-prefill]");
    const line = find<HTMLElement>("[data-prefill-line]");
    if (line) {
      const state = readState();
      line.textContent = toSummary(state, buildContext(state))
        .filter((slot) => slot.value !== null)
        .map((slot) => slot.value)
        .join(" · ");
    }
    show(chip, true);

    // Where the work actually starts: the first section the link did *not*
    // answer. This is the single largest conversion lever here, and it is
    // also the one that has to be counted rather than assumed — a trigger
    // that knew the machine has answered two of the four sections and lands
    // on the terms, but the homepage's buy-or-hire answers one, and sending
    // that to the terms steps straight over the machine picker. Below 900px
    // it does worse than that: the picker is `hidden`, so the first thing
    // the customer would learn about section 02 is a validation error.
    goTo(ORDER.indexOf(item && known ? "terms" : "size"));
    if (live) live.textContent = PREFILL.announce;
  };

  find("[data-prefill-change]")?.addEventListener("click", () => {
    goTo(0);
  });

  const hintRoot = root.querySelector<HTMLElement>("[data-scroll-hint]");
  const hint =
    hintRoot && scroller
      ? initScrollHint(hintRoot, scroller, { signal })
      : null;

  return {
    isDirty: () => isDirty(readState()),
    reset,
    prefill,
    opened: () => hint?.arm(),
  };
}
