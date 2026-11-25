/**
 * The notification email Collins staff receive for one quote request.
 *
 * Built on the server from the parsed payload (`parse.ts`), never from text
 * the browser composed: the old client sent a ready-made `message`, which
 * meant anyone could put any words in front of the sales team under the
 * site's name. Every label here comes from `options.ts` or the catalogue; the
 * only free text is what the customer typed, and all of it is escaped.
 *
 * Two emails, one source:
 *   toText()     plain lines. Stored in `quote_requests.message`, and the
 *                yard email's text part.
 *   toEmail()    the yard's notification: subject + HTML + text + reply-to.
 *   toReceipt()  the customer's copy: what they asked for, the same-day
 *                promise, and how to reach the yard.
 *
 * Both share one plain design, chosen on review 2026-11-24 over a dozen
 * alternatives (cards, tickets, timelines, chat bubbles): white, the logo,
 * a headline, one button, the details as label and value, a small footer.
 *
 * Written for Gmail, Outlook, Apple Mail and GoDaddy/Titan webmail, so the
 * layout is tables and inline styles. A `<style>` block only refines: it
 * stacks label over value on a phone and recolours for dark mode, and an
 * email without it still reads correctly. Outlook desktop gets a fixed 560px
 * table and Arial, because it ignores `max-width` and falls back to Times for
 * an unknown font. Nothing in a row may refuse to wrap: one unbreakable email
 * address in a fixed column is enough to make a phone scroll sideways.
 *
 * The logo is a PNG on the live site (`public/email/`), because Gmail and
 * Outlook do not show SVG. A blue one for light mode, a white one swapped in
 * for dark mode where the client supports it. The colours are the site's
 * `@theme` hex values (`styles/global.css`), restated because an email cannot
 * read a CSS variable.
 *
 * The copy below is the email's own, so it lives in this file. Pure, no I/O.
 */

import { site } from "@/config/site";
import { WHATSAPP } from "@/data/whatsapp";
import { whatsappHref } from "@/lib/whatsapp";
import { AVAILABILITY_LABEL } from "@/lib/equipment";
import {
  CHANNELS,
  CONDITIONS,
  DESTINATIONS,
  DURATIONS,
  EMIRATES,
  MODES,
  TIMEFRAMES,
  TRANSPORT,
  labelOf,
} from "./options";
import { availabilityMode, type Channel, type QuotePayload } from "./schema";

/** What only the server knows once the request is stored. */
export interface EmailMeta {
  /** `quote_requests.id`, when the row was saved. */
  id?: string | null;
}

/* ── Copy ───────────────────────────────────────────────────────── */

const COPY = {
  heading: "New quote request",
  sections: { request: "Request", terms: "Terms", contact: "Contact" },
  rows: {
    machine: "Machine",
    size: "Size",
    stock: "Stock",
    duty: "Duty",
    quantity: "Quantity",
    attachments: "Attachments",
    start: "Start",
    duration: "Duration",
    location: "Location",
    transport: "Transport",
    condition: "Condition",
    when: "When",
    destination: "Destination",
    docs: "Documentation pack",
    name: "Name",
    company: "Company",
    phone: "Phone",
    email: "Email",
    channel: "Reply by",
  },
  unsized: "To be sized from the duty below",
  other: "Sourced to spec",
  yes: "Yes",
  notes: "Notes",
  actions: { call: "Call", whatsapp: "WhatsApp", email: "Reply by email" },
  preferred: "Preferred",
  footer: {
    page: "Sent from",
    submitted: "Submitted",
    ref: "Reference",
    zone: "Dubai time",
  },
  replySubject: (machine: string) => `Your quotation request: ${machine}`,

  /* The yard's email. */
  wants: {
    whatsapp: "Prefers a reply on WhatsApp.",
    call: "Prefers a phone call.",
    email: "Prefers a reply by email.",
  },
  button: {
    whatsapp: "Reply on WhatsApp",
    call: (phone: string) => `Call ${phone}`,
    email: "Reply by email",
  },
  link: {
    whatsapp: "WhatsApp",
    call: (phone: string) => `call ${phone}`,
    email: "email",
  },
  or: "or",

  /* The customer's receipt. */
  receipt: {
    subject: (what: string) => `We have your quote request: ${what}`,
    thanks: (first: string) => `Thanks, ${first}. We have your request.`,
    pricing: "We're preparing your quotation now.",
    replyBy: {
      whatsapp: "We'll reply on WhatsApp.",
      call: "We'll call you.",
      email: "We'll reply by email.",
    },
    change: "Something to change, or need it sooner?",
    whatsapp: "WhatsApp us",
    call: (phone: string) => `call ${phone}`,
    ref: "Reference",
  },
} as const;

/* ── Colour: the site's @theme tokens as hex ────────────────────── */

const C = {
  brand: "#0050f0",
  ink: "#0a0e17",
  body: "#33383f",
  muted: "#5b6472",
  line: "#e7e9ee",
  white: "#ffffff",
};

/* Geist where the client loads it (Apple Mail, iOS); the platform sans
   everywhere else. Outlook desktop is forced to Arial in the head. */
const SANS =
  "'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const LOGO = {
  light: `${site.url}/email/collins-logo-blue.png`,
  dark: `${site.url}/email/collins-logo-white.png`,
  width: 108,
  height: 36,
};

/* ── Helpers ────────────────────────────────────────────────────── */

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );

/** One line, no control characters — what a mail header may carry. */
const oneLine = (value: string) =>
  value
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Escaped, with line breaks as `<br>` — Outlook ignores `pre-wrap`. */
const multiline = (value: string) => escapeHtml(value).replace(/\n/g, "<br>");

/** Short, human-quotable form of the row id. */
export const refOf = (id: string) =>
  id.replace(/-/g, "").slice(0, 8).toUpperCase();

/**
 * Digits in international form, for `tel:` and `wa.me`. The form asks for a
 * country code; a number typed without one (`050 …`, `00971 …`) is read as a
 * UAE number, which is what a local customer means by it.
 */
export const intlDigits = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `971${digits.slice(1)}`;
  return digits;
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));

const formatSubmitted = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Dubai",
  }).format(new Date(iso));

/* ── The request, as rows ───────────────────────────────────────── */

type Row = [label: string, value: string, href?: string];

/** Only rows with a value — a buyer never sees an empty "Duration". */
const rows = (list: (Row | false | null | undefined)[]): Row[] =>
  list.filter((row): row is Row => !!row && row[1] !== "");

const machineOf = (p: QuotePayload) =>
  p.request.category?.name ?? p.request.otherItem ?? "Equipment";

const sizeOf = (p: QuotePayload) => {
  const r = p.request.rating;
  if (!r) return p.request.category ? COPY.unsized : "";
  return r.powerType ? `${r.label} · ${r.powerType}` : r.label;
};

/** "Generators · 250 KVA · ×2" — the line a person reads first. */
const keyLine = (p: QuotePayload) =>
  [
    machineOf(p),
    p.request.rating?.label,
    p.request.quantity > 1 ? `×${p.request.quantity}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

function sections(p: QuotePayload) {
  const { request, terms, contact } = p;
  const mode = request.mode ?? "hire";
  const stock = request.rating?.availability
    ? AVAILABILITY_LABEL[availabilityMode(request.mode)][
        request.rating.availability
      ]
    : request.category
      ? ""
      : COPY.other;
  const digits = intlDigits(contact.phone);

  return [
    {
      title: COPY.sections.request,
      rows: rows([
        [COPY.rows.machine, machineOf(p)],
        [COPY.rows.size, sizeOf(p)],
        [COPY.rows.stock, stock],
        request.duty !== null && [COPY.rows.duty, request.duty],
        [COPY.rows.quantity, String(request.quantity)],
        request.attachments !== null && [
          COPY.rows.attachments,
          request.attachments,
        ],
      ]),
    },
    {
      title: COPY.sections.terms,
      rows: rows(
        mode === "hire"
          ? [
              terms.startDate
                ? [COPY.rows.start, formatDate(terms.startDate)]
                : null,
              [COPY.rows.duration, labelOf(DURATIONS, terms.duration)],
              [COPY.rows.location, labelOf(EMIRATES, terms.emirate)],
              [COPY.rows.transport, labelOf(TRANSPORT, terms.transport)],
            ]
          : [
              [COPY.rows.condition, labelOf(CONDITIONS, terms.condition)],
              [COPY.rows.when, labelOf(TIMEFRAMES, terms.timeframe)],
              [COPY.rows.destination, labelOf(DESTINATIONS, terms.destination)],
              terms.docs && [COPY.rows.docs, COPY.yes],
            ],
      ),
    },
    {
      title: COPY.sections.contact,
      rows: rows([
        [COPY.rows.name, contact.name],
        contact.company !== null && [COPY.rows.company, contact.company],
        [COPY.rows.phone, contact.phone, `tel:+${digits}`],
        contact.email !== null && [
          COPY.rows.email,
          contact.email,
          `mailto:${contact.email}`,
        ],
        [COPY.rows.channel, labelOf(CHANNELS, contact.channel)],
      ]),
    },
  ];
}

interface Action {
  channel: Channel;
  label: string;
  href: string;
}

/** Call, WhatsApp, and email when there is one — the preferred one first. */
function actions(p: QuotePayload): Action[] {
  const { contact } = p;
  const digits = intlDigits(contact.phone);
  const list: Action[] = [
    { channel: "call", label: COPY.actions.call, href: `tel:+${digits}` },
    {
      channel: "whatsapp",
      label: COPY.actions.whatsapp,
      href: whatsappHref(
        WHATSAPP.replyToCustomer(firstName(contact.name), headline(p)),
        `https://wa.me/${digits}`,
      ),
    },
  ];
  if (contact.email) {
    const subject = encodeURIComponent(COPY.replySubject(machineOf(p)));
    list.push({
      channel: "email",
      label: COPY.actions.email,
      href: `mailto:${contact.email}?subject=${subject}`,
    });
  }
  return list.sort(
    (a, b) =>
      Number(b.channel === contact.channel) -
      Number(a.channel === contact.channel),
  );
}

const footerLines = (p: QuotePayload, meta: EmailMeta) =>
  [
    `${COPY.footer.page} ${site.domain}${p.source.page} (${p.source.variant})`,
    `${COPY.footer.submitted} ${formatSubmitted(p.submittedAt)} ${COPY.footer.zone}`,
    meta.id && `${COPY.footer.ref} ${refOf(meta.id)} · ${meta.id}`,
  ].filter((line): line is string => !!line);

/* ── Plain text ─────────────────────────────────────────────────── */

/** The request as plain lines — the stored message and the text part. */
export function toText(p: QuotePayload, meta: EmailMeta = {}): string {
  const mode = labelOf(MODES, p.request.mode);
  const out = [`${COPY.heading}: ${mode}`, keyLine(p), ""];
  for (const section of sections(p)) {
    if (section.rows.length === 0) continue;
    out.push(section.title.toUpperCase());
    for (const [label, value] of section.rows) {
      out.push(`${label}: ${value.replace(/\n/g, "\n  ")}`);
    }
    out.push("");
  }
  if (p.notes) out.push(COPY.notes.toUpperCase(), p.notes, "");
  for (const action of actions(p)) {
    const star =
      action.channel === p.contact.channel ? ` (${COPY.preferred})` : "";
    out.push(
      `${action.label}${star}: ${action.href.replace(/\?subject=.*$/, "")}`,
    );
  }
  out.push("", "--", ...footerLines(p, meta));
  return out.join("\n");
}

/* ── HTML ───────────────────────────────────────────────────────── */

/** "Generators, 250 KVA × 2" — the headline. */
const headline = (p: QuotePayload) =>
  [machineOf(p), p.request.rating?.label].filter(Boolean).join(", ") +
  (p.request.quantity > 1 ? ` × ${p.request.quantity}` : "");

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** A block of text. Every one carries a class so dark mode can recolour it. */
const text = (
  html: string,
  o: {
    size?: number;
    color?: string;
    cls?: string;
    top?: number;
    weight?: number;
    lh?: number;
  } = {},
) => {
  const size = o.size ?? 16;
  return `<div class="${o.cls ?? "t-body"}" style="padding-top:${o.top ?? 0}px;font-family:${SANS};font-size:${size}px;line-height:${o.lh ?? Math.round(size * 1.6)}px;font-weight:${o.weight ?? 400};color:${o.color ?? C.body}">${html}</div>`;
};

const link = (label: string, href: string, color = C.brand) =>
  `<a href="${escapeHtml(href)}" class="t-link" style="color:${color};text-decoration:none">${escapeHtml(label)}</a>`;

/** A hairline. A div, not an <hr>: Outlook pads an <hr> unpredictably. */
const rule = (top: number) =>
  `<div class="ln" style="margin-top:${top}px;border-top:1px solid ${C.line};font-size:0;line-height:0;height:0">&nbsp;</div>`;

/**
 * The one button. Sized by its padding rather than stretched. Outlook drops
 * padding on a link, so the cell carries it there (`mso-padding-alt`) and
 * the link fills the cell everywhere else.
 */
const button = (label: string, href: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0"><tr>
<td bgcolor="${C.brand}" style="background:${C.brand};border-radius:5px;mso-padding-alt:13px 22px">
<a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 22px;font-family:${SANS};font-size:15px;line-height:20px;font-weight:500;color:${C.white};text-decoration:none;border-radius:5px;mso-padding-alt:0">${escapeHtml(label)}</a>
</td></tr></table>`;

/**
 * Label beside value; on a phone the style block stacks the label above.
 * `table-layout: fixed` and `word-break` keep a long address inside the
 * column instead of widening the table past the screen.
 */
const details = (list: Row[]) =>
  list.length === 0
    ? ""
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed">${list
        .map(
          ([name, value, href]) => `<tr>
<td valign="top" width="128" class="k t-muted" style="width:128px;padding:7px 16px 7px 0;font-family:${SANS};font-size:14px;line-height:22px;color:${C.muted}">${escapeHtml(name)}</td>
<td valign="top" class="v t-ink" style="padding:7px 0;font-family:${SANS};font-size:15px;line-height:22px;color:${C.ink};word-break:break-word">${href ? link(value, href) : multiline(value)}</td>
</tr>`,
        )
        .join("")}</table>`;

/** The page every email sits in: head, logo, the body, nothing else. */
function layout(title: string, preheader: string, body: string): string {
  return `<!doctype html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(title)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>td,div,p,a,span{font-family:Arial,Helvetica,sans-serif !important}</style>
<![endif]-->
<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&display=swap" rel="stylesheet"><!--<![endif]-->
<style>
  body { margin:0 !important; padding:0 !important; width:100% !important; -webkit-text-size-adjust:100%; }
  a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
  .logo-dark { display:none; }
  @media (max-width:600px) {
    .pad { padding:32px 24px 0 24px !important; }
    .title { font-size:23px !important; line-height:30px !important; }
    .k { display:block !important; width:auto !important; padding:12px 0 0 0 !important; }
    .v { display:block !important; padding:2px 0 0 0 !important; }
  }
  @media (prefers-color-scheme: dark) {
    .bg { background:#0b0f17 !important; }
    .t-ink { color:#f2f4f8 !important; }
    .t-body { color:#c9ced8 !important; }
    .t-muted { color:#9aa3b2 !important; }
    .t-link { color:#8fb0ff !important; }
    .ln { border-color:#232c3b !important; }
    .logo-light { display:none !important; }
    .logo-dark { display:block !important; }
  }
</style>
</head>
<body class="bg" style="margin:0;padding:0;background:${C.white}">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.white}">${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.white}" class="bg" style="background:${C.white}">
<tr><td align="center">
<!--[if mso]><table role="presentation" width="560" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<div style="max-width:560px;margin:0 auto">
<div class="pad" style="padding:44px 40px 0 40px;text-align:left">
<img src="${LOGO.light}" width="${LOGO.width}" height="${LOGO.height}" alt="${escapeHtml(site.name)}" class="logo-light" style="display:block;width:${LOGO.width}px;height:auto;border:0">
<!--[if !mso]><!--><img src="${LOGO.dark}" width="${LOGO.width}" height="${LOGO.height}" alt="" class="logo-dark" style="display:none;width:${LOGO.width}px;height:auto;border:0"><!--<![endif]-->
${body}
</div>
</div>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body></html>`;
}

const footerHtml = (lines: string[], top = 36) =>
  rule(top) +
  `<div style="padding:20px 0 40px 0">${text(lines.join("<br>"), { size: 13, color: C.muted, cls: "t-muted", lh: 21 })}</div>`;

/* ── To the yard ────────────────────────────────────────────────── */

/** The yard's button: the customer's preferred way back, the others as links. */
function replyHtml(p: QuotePayload): string {
  const phone = p.contact.phone;
  const [first, ...rest] = actions(p);
  const buttonLabel = (a: Action) =>
    a.channel === "call" ? COPY.button.call(phone) : COPY.button[a.channel];
  const linkLabel = (a: Action) =>
    a.channel === "call" ? COPY.link.call(phone) : COPY.link[a.channel];
  const others = rest
    .map((a) => link(linkLabel(a), a.href))
    .join(" &nbsp;·&nbsp; ");
  return (
    button(buttonLabel(first!), first!.href) +
    (others
      ? text(`${COPY.or} ${others}`, {
          size: 14,
          color: C.muted,
          cls: "t-muted",
          top: 14,
        })
      : "")
  );
}

export function toHtml(p: QuotePayload, meta: EmailMeta = {}): string {
  const mode = labelOf(MODES, p.request.mode);
  const [request, terms, contact] = sections(p);
  const from = [p.contact.name, p.contact.company].filter(Boolean).join(", ");
  const preheader = `${headline(p)} from ${p.contact.name}. ${COPY.wants[p.contact.channel]}`;
  // "Reply by" is already the lede's last sentence.
  const people = contact!.rows.filter(([name]) => name !== COPY.rows.channel);

  const body = [
    text(`${escapeHtml(COPY.heading)} · ${escapeHtml(mode)}`, {
      size: 14,
      color: C.muted,
      cls: "t-muted",
      top: 36,
    }),
    text(escapeHtml(headline(p)), {
      size: 26,
      color: C.ink,
      cls: "t-ink title",
      top: 6,
      weight: 500,
      lh: 33,
    }),
    text(
      `From ${escapeHtml(from)}. ${escapeHtml(COPY.wants[p.contact.channel])}`,
      { top: 10, lh: 26 },
    ),
    `<div style="padding-top:28px">${replyHtml(p)}</div>`,
    rule(32),
    `<div style="padding-top:18px">${details([...request!.rows, ...terms!.rows])}</div>`,
    rule(22),
    `<div style="padding-top:18px">${details(people)}</div>`,
    p.notes
      ? rule(22) +
        text(escapeHtml(COPY.notes), {
          size: 14,
          color: C.muted,
          cls: "t-muted",
          top: 20,
        }) +
        text(multiline(p.notes), {
          size: 15,
          color: C.ink,
          cls: "t-ink",
          top: 4,
          lh: 24,
        })
      : "",
    footerHtml(footerLines(p, meta).map(escapeHtml)),
  ];
  return layout(COPY.heading, preheader, body.join("\n"));
}

/** Subject, bodies and reply-to, ready for `sendMail`. */
export function toEmail(p: QuotePayload, meta: EmailMeta = {}) {
  const mode = labelOf(MODES, p.request.mode);
  const subject = oneLine(
    `Quote request (${mode}): ${keyLine(p)} from ${p.contact.name}`,
  ).slice(0, 150);
  return {
    subject,
    text: toText(p, meta),
    html: toHtml(p, meta),
    replyTo: p.contact.email ? oneLine(p.contact.email) : undefined,
  };
}

/* ── To the customer ────────────────────────────────────────────── */

/**
 * What the customer asked for, in their own terms: the request and the
 * terms, without the yard's working rows (stock is ours to know), and the
 * reference they can quote back.
 */
function receiptRows(p: QuotePayload, meta: EmailMeta): Row[] {
  const [request, terms] = sections(p);
  return [
    ...request!.rows.filter(([name]) => name !== COPY.rows.stock),
    ...terms!.rows,
    ...(meta.id ? [[COPY.receipt.ref, refOf(meta.id)] as Row] : []),
  ];
}

const receiptLede = (p: QuotePayload) =>
  `${COPY.receipt.pricing} ${site.quotePromise} ${COPY.receipt.replyBy[p.contact.channel]}`;

/**
 * The customer's receipt. Sent only when they gave an email, after the
 * yard's copy is out; its replies go to the office, not the sending mailbox.
 */
export function toReceipt(p: QuotePayload, meta: EmailMeta = {}) {
  const followUp = whatsappHref(
    meta.id ? WHATSAPP.quoteFollowUp(refOf(meta.id)) : WHATSAPP.general,
  );
  const list = receiptRows(p, meta);
  const contactLines = [site.name, `${site.address} · ${site.hours}`];

  const body = [
    text(escapeHtml(COPY.receipt.thanks(firstName(p.contact.name))), {
      size: 26,
      color: C.ink,
      cls: "t-ink title",
      top: 36,
      weight: 500,
      lh: 33,
    }),
    text(escapeHtml(receiptLede(p)), { top: 12, lh: 26 }),
    rule(32),
    `<div style="padding-top:18px">${details(list)}</div>`,
    rule(22),
    text(escapeHtml(COPY.receipt.change), {
      color: C.ink,
      cls: "t-ink",
      top: 26,
    }),
    `<div style="padding-top:16px">${button(COPY.receipt.whatsapp, followUp)}</div>`,
    text(
      `${COPY.or} ${link(COPY.receipt.call(site.phone.display), site.phone.href)}`,
      { size: 14, color: C.muted, cls: "t-muted", top: 14 },
    ),
    footerHtml([
      ...contactLines.map(escapeHtml),
      link(site.email, `mailto:${site.email}`, C.muted),
    ]),
  ];

  const plain = [
    COPY.receipt.thanks(firstName(p.contact.name)),
    "",
    receiptLede(p),
    "",
    ...list.map(([name, value]) => `${name}: ${value.replace(/\n/g, "\n  ")}`),
    "",
    COPY.receipt.change,
    `WhatsApp: ${followUp}`,
    `Call: ${site.phone.display}`,
    "",
    "--",
    ...contactLines,
    site.email,
  ].join("\n");

  return {
    subject: oneLine(COPY.receipt.subject(keyLine(p))).slice(0, 150),
    text: plain,
    html: layout(
      COPY.receipt.thanks(firstName(p.contact.name)),
      `${COPY.receipt.pricing} ${site.quotePromise}`,
      body.join("\n"),
    ),
    replyTo: site.email,
  };
}
