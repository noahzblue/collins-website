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
  EMAIL_SUBJECT,
  HONEYPOT,
  MODES,
  NAV,
  PREFILL,
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
import { clearDraft, isDirty, loadDraft, saveDraft } from "./draft";

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
  const errorPanel = find<HTMLElement>("[data-quote-error]");
  const submitButtons = findAll<HTMLButtonElement>("[data-quote-submit]");
  const submitLabels = findAll<HTMLElement>("[data-submit-label]");

  /** Below this the four sections become four steps. */
  const sheet = window.matchMedia("(max-width: 900px)");

  let step = 0;
  let busy = false;
  /** Errors already shown. Blur repaints one field; submit paints all. */
  let shown: QuoteError[] = [];

  const show = (element: Element | null, on: boolean) => {
    if (element instanceof HTMLElement) element.hidden = !on;
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
    channel: (raw("channel") || "whatsapp") as Channel,
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

    for (const row of findAll<HTMLElement>("[data-summary-slot]")) {
      const key = row.dataset.summarySlot ?? "";
      const applies = wanted.has(key);
      row.hidden = !applies;
      if (!applies) continue;

      const value = wanted.get(key) ?? null;
      const cell = row.querySelector<HTMLElement>("[data-summary-value]");
      if (!cell) continue;
      cell.textContent = value ?? SUMMARY.pending;
      cell.toggleAttribute("data-answered", value !== null);
    }
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

    /* 02 — three shapes, one section. */
    const isOther = state.category === OTHER_CATEGORY;
    show(find("[data-size-empty]"), !state.category);
    show(find("[data-size-machine]"), !!state.category && !isOther);
    show(find("[data-size-other]"), isOther);

    let panel: HTMLElement | null = null;
    for (const candidate of findAll<HTMLElement>("[data-rating-panel]")) {
      const active = candidate.dataset.ratingPanel === state.category;
      candidate.hidden = !active;
      if (active) panel = candidate;
    }

    const sizingMe = state.rating === UNSURE_RATING;
    show(find('[data-conditional="duty"]'), sizingMe);
    // The one moment the sizing guide helps is the moment somebody says they
    // cannot size it themselves (docs 14 §10b).
    if (sizingMe)
      panel?.querySelector("[data-duty-guide]")?.setAttribute("open", "");

    show(
      find('[data-conditional="attachments"]'),
      !!panel?.hasAttribute("data-attachments"),
    );

    /* 03 — one panel per mode, and never two. */
    show(find("[data-terms-empty]"), !state.mode);
    for (const candidate of findAll<HTMLElement>("[data-mode-panel]")) {
      candidate.hidden = candidate.dataset.modePanel !== state.mode;
    }
    // `timeframe` and `emirate` are one field across two panels, so the copy
    // that just became visible has to show the answer the hidden one holds.
    recheck("timeframe", state.timeframe);
    recheck("emirate", state.emirate);

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

  /** Tick the visible radio of a group whose answer lives in a hidden twin. */
  const recheck = (name: string, value: string | null) => {
    if (!value) return;
    const group = form.elements.namedItem(name);
    if (!(group instanceof RadioNodeList)) return;
    for (const input of group) {
      if (!(input instanceof HTMLInputElement)) continue;
      const hidden = !!input.closest("[data-mode-panel][hidden]");
      if (!hidden && input.value === value && !input.checked)
        input.checked = true;
    }
  };

  /* ── Errors ───────────────────────────────────────────────────── */

  const errorSlots = (field: string) =>
    findAll<HTMLElement>(`[data-error-for="${field}"]`);

  const paintError = (field: string, message: string | null) => {
    for (const slot of errorSlots(field)) {
      slot.textContent = message ?? "";
      slot.hidden = !message;
    }
    // Two panels can carry the same field — `timeframe` is on both buy and
    // "not sure yet" — so every copy is marked, not the first one found.
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

  const clearErrors = () => {
    for (const error of shown) paintError(error.field, null);
    shown = [];
  };

  const paintErrors = (errors: QuoteError[]) => {
    clearErrors();
    for (const error of errors) paintError(error.field, error.message);
    shown = errors;
  };

  /* ── Steps ────────────────────────────────────────────────────── */

  const applyStepVisibility = () => {
    sections.forEach((section, index) => {
      if (section) section.hidden = sheet.matches && index !== step;
    });
  };

  const paintProgress = () => {
    const id = ORDER[step];
    form.dataset.step = id;
    const count = find<HTMLElement>("[data-progress-count]");
    const title = find<HTMLElement>("[data-progress-title]");
    const fill = find<HTMLElement>("[data-progress-fill]");
    if (count) count.textContent = NAV.counter(step + 1, ORDER.length);
    if (title) title.textContent = SECTIONS[id].title;
    fill?.style.setProperty("--t", String((step + 1) / ORDER.length));
  };

  /** The panel's own scroll, never the document's and never Lenis's (§4). */
  const scrollTo = (element: HTMLElement | null, smooth = true) => {
    const behavior: ScrollBehavior = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
      ? "auto"
      : smooth
        ? "smooth"
        : "auto";

    if (!scroller) {
      /* The inline variant: the document is the scroller, so this is the one
         place `scrollIntoView` is right — `html { scroll-padding-top }` lands
         it below the fixed header. Instant, because Lenis owns the document's
         smoothing and two things easing the same scroll is a fight the reader
         watches. */
      element?.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }
    const top = element
      ? element.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop
      : 0;
    scroller.scrollTo({ top: Math.max(0, top - 8), behavior });
  };

  /**
   * Move to a step. **Never called on load** — the prototype jumped 424px on
   * init and threw its own headline away before it was read (docs 14 §6).
   */
  const goTo = (index: number) => {
    step = Math.min(Math.max(index, 0), ORDER.length - 1);
    applyStepVisibility();
    paintProgress();
    const id = ORDER[step];
    if (live)
      live.textContent = NAV.announce(
        step + 1,
        ORDER.length,
        SECTIONS[id].title,
      );
    scrollTo(sheet.matches ? null : sections[step]);
  };

  /** Where an invalid submit goes: the section, marked, first control focused. */
  const focusFirstError = (errors: QuoteError[]) => {
    const first = errors[0];
    if (!first) return;
    const index = ORDER.indexOf(first.section);
    if (index >= 0 && (sheet.matches ? index !== step : true)) goTo(index);

    const control =
      form.querySelector<HTMLElement>(
        `[data-chip-group="${first.field}"] input`,
      ) ??
      form.querySelector<HTMLElement>(`[data-field="${first.field}"]`) ??
      form.querySelector<HTMLElement>(
        `[data-rating-panel]:not([hidden]) input[name="${first.field}"]`,
      ) ??
      form.querySelector<HTMLElement>(`input[name="${first.field}"]`);
    control?.focus({ preventScroll: true });
  };

  /* ── Submitting ───────────────────────────────────────────────── */

  const setBusy = (on: boolean) => {
    busy = on;
    for (const button of submitButtons) {
      button.disabled = on;
      button.setAttribute("aria-busy", String(on));
    }
    for (const label of submitLabels) {
      label.textContent = on ? SUMMARY.submitting : SUMMARY.submit;
    }
  };

  const showSuccess = (state: QuoteState, ref?: string) => {
    if (!successPanel) return;
    const recap = successPanel.querySelector<HTMLElement>(
      "[data-success-recap]",
    );
    if (recap) {
      recap.replaceChildren(
        ...toSummary(state, buildContext(state))
          .filter((slot) => slot.value !== null)
          .map((slot) => {
            const row = document.createElement("div");
            const term = document.createElement("dt");
            const detail = document.createElement("dd");
            term.textContent = slot.label;
            detail.textContent = slot.value ?? "";
            row.append(term, detail);
            return row;
          }),
      );
    }

    const refRow =
      successPanel.querySelector<HTMLElement>("[data-success-ref]");
    const refValue = successPanel.querySelector<HTMLElement>(
      "[data-success-ref-value]",
    );
    if (refRow) refRow.hidden = !ref;
    if (refValue && ref) refValue.textContent = ref;

    form.hidden = true;
    successPanel.hidden = false;
    clearDraft(instance);
    scrollTo(null, false);
    successPanel.querySelector<HTMLElement>("[data-success-title]")?.focus();
  };

  const send = (state: QuoteState) => {
    const context = buildContext(state);
    const message = toMessage(state, context);

    /* The handoff opens **synchronously, inside the click**. Awaiting a fetch
       first and opening afterwards is blocked by Safari and by Chrome's popup
       heuristics — this order is not a style choice (docs 14 §12). */
    if (state.channel === "whatsapp") {
      const base = form.dataset.whatsapp ?? "";
      if (base) {
        window.open(
          `${base}?text=${encodeURIComponent(message)}`,
          "_blank",
          "noopener",
        );
      }
    } else if (state.channel === "email") {
      /* With the composed body, not a bare `mailto:`. After fifteen fields, a
         desktop visitor without WhatsApp Web would otherwise lose all of them
         — /contact already gets this right and must not regress (§12). */
      const address = form.dataset.email ?? "";
      if (address) {
        window.location.href =
          `mailto:${address}` +
          `?subject=${encodeURIComponent(EMAIL_SUBJECT)}` +
          `&body=${encodeURIComponent(message)}`;
      }
    }

    setBusy(true);
    show(errorPanel, false);

    const posted = submitQuote(toPayload(state, context), { message });

    if (state.channel === "whatsapp") {
      // The enquiry has already left by another route, so the POST is
      // bookkeeping. A failure is logged, never shown (docs 14 §12).
      showSuccess(state);
      setBusy(false);
      posted.then((result) => {
        if (!result.ok)
          console.warn("[quote] POST failed behind WhatsApp", result);
      });
      return;
    }

    // Nothing else carried it, so the result is the answer.
    posted.then((result) => {
      setBusy(false);
      if (result.ok) showSuccess(state, result.ref);
      else show(errorPanel, true);
    });
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
    schedule();
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
    },
    true,
  );

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
      successPanel.hidden = true;
      form.hidden = false;
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

  sheet.addEventListener("change", applyStepVisibility, { signal });

  /* ── Start ────────────────────────────────────────────────────── */

  const apply = (state: QuoteState) => {
    for (const [field, value] of Object.entries(state)) {
      const group = form.elements.namedItem(field);
      if (!group) continue;
      if (group instanceof RadioNodeList) {
        for (const input of group) {
          if (input instanceof HTMLInputElement) {
            input.checked = value !== null && input.value === String(value);
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
    // "deliver", channel "whatsapp" — which is the right blank form, and a
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
   * §9 shows `rating=250%20kVA` — a label — and the radios are keyed on
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

  return {
    isDirty: () => isDirty(readState()),
    reset,
    prefill,
  };
}
