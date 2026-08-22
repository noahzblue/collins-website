/**
 * The quote form's draft, in `sessionStorage`.
 *
 * Fifteen fields sitting behind an accidental Escape, a stray backdrop click
 * or a mistaken navigation is a real data-loss risk, and the single most
 * likely way this feature earns a complaint. Persisting on change makes every
 * one of those recoverable, and it covers the one case no amount of dismissal
 * guarding can: the customer leaving the page (docs/site-expansion/14 §4).
 *
 * `sessionStorage`, not `localStorage`: a draft is worth keeping for the
 * length of a visit and no longer. Somebody who comes back next week wants a
 * blank form, not last week's half-answered one.
 *
 * **Keyed per instance.** Two copies of this form can exist in one document —
 * the inline one on /contact plus the dialog still mounted from `Base` — and
 * they are two drafts, not one (§2).
 *
 * Every call is guarded: Safari's private mode throws on write, and a form
 * that will not open because storage is full is a far worse bug than a draft
 * that is not kept.
 */

import { EMPTY_STATE, type QuoteState } from "@/lib/quote/schema";

/** Bumped with the state shape, so an old draft is dropped rather than
 *  restored into fields that have moved. */
const VERSION = 1;

const key = (instance: string) => `collins.quote.${instance}.v${VERSION}`;

export const saveDraft = (instance: string, state: QuoteState) => {
  try {
    sessionStorage.setItem(key(instance), JSON.stringify(state));
  } catch {
    /* Storage disabled or full. The form still works; the draft does not. */
  }
};

/**
 * The stored draft, merged over a blank state.
 *
 * Merged rather than returned raw: a draft written before a field existed is
 * missing that key, and spreading it over `EMPTY_STATE` fills the gap instead
 * of handing back an object with `undefined` in it.
 */
export const loadDraft = (instance: string): QuoteState | null => {
  try {
    const stored = sessionStorage.getItem(key(instance));
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<QuoteState>;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...EMPTY_STATE, ...parsed };
  } catch {
    return null;
  }
};

export const clearDraft = (instance: string) => {
  try {
    sessionStorage.removeItem(key(instance));
  } catch {
    /* See above. */
  }
};

/** True when the draft holds anything a customer actually typed or picked. */
export const isDirty = (state: QuoteState) =>
  Object.entries(state).some(([field, value]) => {
    const blank = EMPTY_STATE[field as keyof QuoteState];
    return JSON.stringify(value) !== JSON.stringify(blank);
  });
