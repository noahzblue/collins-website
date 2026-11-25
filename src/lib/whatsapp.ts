/**
 * The one place a WhatsApp link is built. The text comes from
 * `data/whatsapp.ts`; `to` defaults to Collins' own number and takes a
 * customer's `wa.me` link when the yard replies to them.
 */
import { site } from "@/config/site";

export const whatsappHref = (text?: string, to: string = site.whatsapp.href) =>
  text ? `${to}?text=${encodeURIComponent(text)}` : to;

/**
 * Stands in for a value only the browser knows (the quote reference). The
 * script swaps the encoded form for the real value; see `quoteSent` in
 * `scripts/quote/form.ts`.
 */
export const WA_SLOT = "{ref}";
export const WA_SLOT_ENCODED = encodeURIComponent(WA_SLOT);
