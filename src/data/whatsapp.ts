/**
 * Every message a WhatsApp button types for the visitor. Each `wa.me` link on
 * the site and in the quote emails takes its text from here, through
 * `whatsappHref()` in `lib/whatsapp.ts`.
 *
 * Keep them short, first person, and about the page the button sits on: the
 * person reading them is at Collins, and they should know at once what the
 * visitor was looking at.
 */

export const WHATSAPP = {
  /** Buttons with no page context: the floating button and the footer. */
  general: "Hello Collins, I need equipment for a job. Can you help?",

  /** The closing band (`PageCTA`), one line per page that shows it. */
  page: {
    about: "Hi Collins, I'd like to know more about your company.",
    yard: "Hi Collins, I'd like to visit your yard.",
    industries: "Hi Collins, I need equipment for a project.",
    equipment:
      "Hi Collins, I'm looking for equipment and would like some help choosing.",
    services: "Hi Collins, I'd like to talk about your services.",
  },

  contact:
    "Hi Collins, I'd like to speak to someone about equipment for sale or hire.",

  service: (title: string) => `Hi Collins, I'd like to talk about ${title}.`,
  industry: (name: string) =>
    `Hi Collins, I'm enquiring about equipment for a ${name} project.`,
  /** `verb` is "buying" or "hiring"; `item` is "a 250 KVA generator". */
  machine: (verb: string, item: string) =>
    `Hi Collins, I'm interested in ${verb} ${item}.`,

  /** The quote form's success screen, once the reference is known. */
  quoteSent: (ref: string) => `Hi Collins, I just sent quote request ${ref}.`,
  /** The customer's confirmation email. Ends open for them to finish. */
  quoteFollowUp: (ref: string) => `Hi Collins, about my quote request ${ref}: `,
  /** The yard's email, replying to the customer. */
  replyToCustomer: (first: string, what: string) =>
    `Hi ${first}, this is Collins Equipments about your quote request for ${what}.`,
};
