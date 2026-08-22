/**
 * Generic form plumbing — the two things every `ui/` input primitive needs and
 * neither of which is specific to any one feature.
 *
 * The quote form is why this exists (docs/site-expansion/14 §2: the dialog
 * stays mounted in `Base.astro` while `/contact` renders an inline copy of the
 * same form), but nothing here knows about it.
 */

/**
 * One choice in a radio group, a chip group or a select.
 *
 * `value` is a stable key and `label` is what the customer reads — never the
 * same string. `"1-3-months"`, not `"1–3 months"`: a display string in a
 * payload is a display string a backend has to parse (docs 14 §15.3c).
 */
export interface Option {
  value: string;
  label: string;
  /** Optional second line, where the choice needs explaining. */
  hint?: string;
}

/** Lowercase, alphanumerics and single dashes — safe in an id and in a
 *  `querySelector`. Range labels ("250 kVA") and category names
 *  ("Bobcat / skid steer loaders") both pass through here. */
export const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * A scoped element id.
 *
 * Any component that can appear twice in one document has to generate its ids
 * from an instance prefix rather than hardcoding them — otherwise `<label for>`
 * binds to the wrong control, `aria-labelledby` resolves to the wrong element,
 * and `getElementById` silently returns whichever came first in the DOM. Every
 * id the `ui/` primitives emit goes through here, so the format cannot drift.
 *
 *   scopedId("q-dialog", "name")              -> "q-dialog-name"
 *   scopedId("q-dialog", "cat", "Generators") -> "q-dialog-cat-generators"
 */
export const scopedId = (instance: string, name: string, value?: string) =>
  value === undefined
    ? `${instance}-${name}`
    : `${instance}-${name}-${slug(value)}`;
