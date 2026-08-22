/**
 * State in, errors out. No DOM, no copy from the page, no side effects — which
 * is what makes the submit path testable without a browser (docs 14 §15.4).
 *
 * The rules follow the field inventory (docs 14 §7) and the two escapes
 * (§10a "something else", §10b "size it for me"), both of which move what is
 * required rather than adding to it.
 *
 * The messages live here rather than in `options.ts` because each one is the
 * other half of the rule beside it — they are not labels, legends or
 * placeholders, and splitting them out would mean opening two files to change
 * one behaviour.
 */

import {
  OTHER_CATEGORY,
  UNSURE_RATING,
  type FieldName,
  type QuoteState,
  type SectionId,
} from "./schema";

export interface QuoteError {
  field: FieldName;
  /** Which of the four sections to scroll to and mark. */
  section: SectionId;
  message: string;
}

/** Deliberately permissive — it catches a typo, not a disposable address. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const blank = (value: string | null | undefined) =>
  value === null || value === undefined || value.trim() === "";

/**
 * @param state  the form as filled in so far
 * @param today  ISO date (`YYYY-MM-DD`). Pass it to reject a hire start date
 *               in the past — the prototype accepted one. Omit and the date is
 *               only checked for presence.
 */
export const validate = (state: QuoteState, today?: string): QuoteError[] => {
  const errors: QuoteError[] = [];
  const fail = (field: FieldName, section: SectionId, message: string) =>
    errors.push({ field, section, message });

  /* 01 — what you need */
  if (!state.mode) fail("mode", "need", "Pick buy, hire, or not sure yet.");
  if (!state.category) fail("category", "need", "Pick a machine.");

  /* 02 — what size. "Something else" replaces this section rather than
     adding to it, so the rating is not required when it is chosen. */
  if (state.category === OTHER_CATEGORY) {
    if (blank(state.otherItem)) {
      fail("otherItem", "size", "Tell us what you need and we'll source it.");
    }
  } else if (state.category) {
    if (!state.rating)
      fail("rating", "size", "Pick a size, or ask us to size it.");
    if (state.rating === UNSURE_RATING && blank(state.duty)) {
      fail("duty", "size", "Describe the duty so we can size it.");
    }
  }
  if (!Number.isFinite(state.quantity) || state.quantity < 1) {
    fail("quantity", "size", "At least one.");
  }

  /* 03 — the terms. Mode decides which panel exists, so nobody is ever asked
     for a field that does not apply to them. */
  if (state.mode === "hire") {
    if (!state.duration) fail("duration", "terms", "How long do you need it?");
    if (!state.emirate) fail("emirate", "terms", "Where is it going?");
    if (today && !blank(state.startDate) && state.startDate < today) {
      fail("startDate", "terms", "Pick today or a date after it.");
    }
  }
  if (state.mode === "buy") {
    if (!state.condition) fail("condition", "terms", "New, used, or both?");
    if (!state.timeframe) fail("timeframe", "terms", "When do you need it?");
  }
  if (state.mode === "unsure") {
    if (!state.timeframe) fail("timeframe", "terms", "When do you need it?");
    if (!state.emirate) fail("emirate", "terms", "Where would it go?");
  }

  /* 04 — where to send it. Phone is required and email is not, because this
     trade runs on phone and WhatsApp — unless email is the chosen reply
     channel, in which case it is the only way we can answer. */
  if (blank(state.name)) fail("name", "contact", "We need a name.");
  if (blank(state.phone))
    fail("phone", "contact", "We need a number to reach you on.");
  if (state.channel === "email" && blank(state.email)) {
    fail("email", "contact", "Add an email, or pick another way to reply.");
  }
  if (!blank(state.email) && !EMAIL.test(state.email.trim())) {
    fail("email", "contact", "Check the email address.");
  }

  return errors;
};

/** Errors for one section — what mobile "Continue" checks (docs 14 §11). */
export const validateSection = (
  state: QuoteState,
  section: SectionId,
  today?: string,
) => validate(state, today).filter((error) => error.section === section);

/** The first section with something missing — where an invalid submit goes. */
export const firstInvalidSection = (errors: QuoteError[]): SectionId | null =>
  errors[0]?.section ?? null;
