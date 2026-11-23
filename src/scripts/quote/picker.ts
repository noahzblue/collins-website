/**
 * "Which machine?" — the one-line field and the photo viewer it opens.
 *
 * Takes the picker's `<fieldset>` as its root and queries nothing outside it.
 * The radios are the state: this script never keeps a copy of the answer, it
 * reads the checked radio and paints the field from it. `paint()` is exported
 * so `form.ts` can call it from `sync()` — a draft, a prefill or a reset ticks
 * radios without firing `change`, and the field has to follow anyway.
 *
 * Every visible change eases through `motion.ts`: the field's photo
 * dissolves, its words ease in, and the viewer's big photo dissolves as the
 * eye moves down the list.
 *
 * Copy comes from the markup's `data-*` attributes (lib/quote/options.ts
 * renders them), never from here.
 *
 * Picking fires a bubbling `change`, so the form's own listener (which
 * clears the old rating and re-checks errors) runs as if the radio had been
 * clicked.
 */

import { setShown, setText } from "./motion";

export interface CategoryPickerApi {
  /** Repaint the field from whichever radio is checked. */
  paint: () => void;
}

export function initCategoryPicker(
  root: HTMLElement,
  { signal }: { signal: AbortSignal },
): CategoryPickerApi | null {
  const viewer = root.querySelector<HTMLDialogElement>("[data-picker-viewer]");
  const field = root.querySelector<HTMLElement>("[data-picker-open]");
  if (!viewer || !field) return null;

  const radios = [
    ...viewer.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
  ];
  const rows = radios.map((radio) =>
    radio.closest<HTMLElement>("[data-picker-row]"),
  );
  const figures = [
    ...viewer.querySelectorAll<HTMLElement>("[data-picker-figure]"),
  ];
  const thumbs = [...root.querySelectorAll<HTMLElement>("[data-picker-thumb]")];
  const thumbEmpty = root.querySelector<HTMLElement>(
    "[data-picker-thumb-empty]",
  );
  const name = root.querySelector<HTMLElement>("[data-picker-name]");
  const meta = root.querySelector<HTMLElement>("[data-picker-meta]");
  const cta = root.querySelector<HTMLElement>("[data-picker-cta]");
  const picked = viewer.querySelector<HTMLElement>("[data-picker-picked]");
  const quick = [...root.querySelectorAll<HTMLElement>("[data-picker-quick]")];

  const on = { signal };
  let current = 0;

  const checkedIndex = () => radios.findIndex((radio) => radio.checked);

  /** The stage follows the eye; it never picks anything. */
  const stage = (index: number) => {
    current = (index + radios.length) % radios.length;
    const id = radios[current].value;
    for (const figure of figures)
      setShown(figure, figure.dataset.pickerFigure === id, {
        kind: "dissolve",
      });
    rows.forEach((row, i) =>
      row?.toggleAttribute("data-current", i === current),
    );
  };

  const paint = () => {
    const index = checkedIndex();
    const row = index >= 0 ? rows[index] : null;
    const id = index >= 0 ? radios[index].value : null;

    field.toggleAttribute("data-picked", !!row);
    let shown = false;
    for (const thumb of thumbs) {
      const match = thumb.dataset.pickerThumb === id;
      setShown(thumb, match, { kind: "dissolve" });
      shown ||= match;
    }
    setShown(thumbEmpty, !shown, { kind: "dissolve" });

    if (name) setText(name, row?.dataset.name ?? name.dataset.empty ?? "");
    if (meta) setText(meta, row?.dataset.meta ?? meta.dataset.empty ?? "");
    if (cta)
      setText(cta, (row ? cta.dataset.change : cta.dataset.browse) ?? "");
    if (picked)
      setText(picked, row?.dataset.name ?? picked.dataset.empty ?? "");
    for (const button of quick)
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.pickerQuick === id),
      );
  };

  /** Tick one radio and tell the form, the way a click would. */
  const pick = (index: number) => {
    const radio = radios[(index + radios.length) % radios.length];
    if (radio.checked) return;
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const open = () => {
    const index = Math.max(checkedIndex(), 0);
    stage(index);
    viewer.showModal();
    // The checked machine, not the dialog's title: arrow keys then move
    // through the list straight away.
    radios[index].focus({ preventScroll: true });
    rows[index]?.scrollIntoView({ block: "center" });
  };

  const close = () => {
    viewer.close();
    field.focus({ preventScroll: true });
  };

  field.addEventListener("click", open, on);
  viewer
    .querySelector("[data-dialog-close]")
    ?.addEventListener("click", close, on);
  viewer
    .querySelector("[data-picker-done]")
    ?.addEventListener("click", close, on);

  // A click on the dialog element itself is the backdrop.
  viewer.addEventListener(
    "click",
    (event) => {
      if (event.target === viewer) close();
    },
    on,
  );

  viewer.addEventListener(
    "keydown",
    (event) => {
      /* Escape is handled here rather than left to the platform. Chrome
         groups two modals opened without a user gesture between them, and
         one native Escape then cancels both — closing the whole quote form
         (or raising its discard prompt) when the customer only meant to
         close this list. Cancelling the key stops the platform's close. */
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }
      // Enter on a radio means "this one". Without this it does nothing.
      if (event.key !== "Enter") return;
      if (!(event.target instanceof HTMLInputElement)) return;
      event.preventDefault();
      if (!event.target.checked) pick(radios.indexOf(event.target));
      close();
    },
    on,
  );

  rows.forEach((row, index) => {
    row?.addEventListener("pointerenter", () => stage(index), on);
    // Double-click picks and closes in one gesture.
    row?.addEventListener("dblclick", close, on);
  });
  viewer.querySelector('[role="radiogroup"]')?.addEventListener(
    "pointerleave",
    () => {
      const index = checkedIndex();
      if (index >= 0) stage(index);
    },
    on,
  );

  for (const radio of radios)
    radio.addEventListener("focus", () => stage(radios.indexOf(radio)), on);

  for (const button of viewer.querySelectorAll<HTMLElement>(
    "[data-picker-step]",
  ))
    button.addEventListener(
      "click",
      () => {
        const next = current + Number(button.dataset.pickerStep);
        pick(next);
        stage(next);
        rows[current]?.scrollIntoView({ block: "nearest" });
      },
      on,
    );

  for (const button of quick)
    button.addEventListener(
      "click",
      () => {
        const index = radios.findIndex(
          (radio) => radio.value === button.dataset.pickerQuick,
        );
        if (index >= 0) pick(index);
      },
      on,
    );

  root.addEventListener("change", paint, on);
  paint();

  return { paint };
}
