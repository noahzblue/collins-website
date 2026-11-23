/**
 * The notification email Collins staff receive for one quote request.
 *
 * Built on the server from the parsed payload (`parse.ts`), never from text
 * the browser composed: the old client sent a ready-made `message`, which
 * meant anyone could put any words in front of the sales team under the
 * site's name. Every label here comes from `options.ts` or the catalogue; the
 * only free text is what the customer typed, and all of it is escaped.
 *
 * Three outputs, one source:
 *   toText()   plain lines. Stored in `quote_requests.message`, and the email's
 *              text part.
 *   toEmail()  subject + HTML + text + reply-to, ready for `sendMail`.
 *
 * The HTML is written for the mail clients staff actually open it in — Gmail,
 * Outlook, Apple Mail, GoDaddy/Titan webmail — so it is tables and inline
 * styles only: no `<style>` block, no flexbox, no web fonts, no images. The
 * colours are the site's `@theme` hex values (`styles/global.css`), restated
 * because an email cannot read a CSS variable.
 *
 * The copy below is the email's own, so it lives in this file. Pure, no I/O.
 */

import { site } from "@/config/site";
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
  notes: "Customer's notes",
  actions: { call: "Call", whatsapp: "WhatsApp", email: "Reply by email" },
  preferred: "Preferred",
  footer: {
    page: "Sent from",
    submitted: "Submitted",
    ref: "Reference",
    zone: "Dubai time",
  },
  replySubject: (machine: string) => `Your quotation request: ${machine}`,
} as const;

/* ── Colour: the site's @theme tokens as hex ────────────────────── */

const C = {
  brand: "#0050f0",
  brandTint: "#eef3ff",
  ink: "#0a0e17",
  body: "#33383f",
  muted: "#5b6472",
  line: "#e7e9ee",
  lineStrong: "#d6dae2",
  surface: "#f7f8fa",
  whatsapp: "#25d366",
  white: "#ffffff",
};

const MONO = "ui-monospace,Menlo,Consolas,'Courier New',monospace";
const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

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
      href: `https://wa.me/${digits}`,
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

const label = (value: string) =>
  `<span style="font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted}">${escapeHtml(value)}</span>`;

const rowHtml = ([name, value, href]: Row) => {
  const shown = href
    ? `<a href="${escapeHtml(href)}" style="color:${C.brand};text-decoration:none">${escapeHtml(value)}</a>`
    : multiline(value);
  return `<tr>
<td valign="top" width="150" style="padding:9px 12px 9px 0;border-top:1px solid ${C.line};width:150px">${label(name)}</td>
<td valign="top" style="padding:8px 0;border-top:1px solid ${C.line};font-family:${SANS};font-size:15px;line-height:22px;color:${C.ink}">${shown}</td>
</tr>`;
};

const sectionHtml = (title: string, list: Row[]) =>
  list.length === 0
    ? ""
    : `<tr><td style="padding:24px 32px 0 32px">
<div style="font-family:${MONO};font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:${C.brand};padding-bottom:8px">${escapeHtml(title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${list.map(rowHtml).join("")}</table>
</td></tr>`;

/** A full-width button that survives Outlook: a coloured table cell. */
const buttonHtml = (action: Action, preferred: boolean) => {
  const fill = preferred
    ? action.channel === "whatsapp"
      ? { bg: C.whatsapp, fg: C.ink, border: C.whatsapp }
      : { bg: C.brand, fg: C.white, border: C.brand }
    : { bg: C.white, fg: C.ink, border: C.lineStrong };
  const tag = preferred
    ? `<span style="font-family:${MONO};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:normal"> &nbsp;·&nbsp; ${escapeHtml(COPY.preferred)}</span>`
    : "";
  return `<tr><td style="padding:0 0 10px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" bgcolor="${fill.bg}" style="background:${fill.bg};border:1px solid ${fill.border}">
<a href="${escapeHtml(action.href)}" style="display:block;padding:14px 18px;font-family:${SANS};font-size:16px;font-weight:bold;line-height:20px;color:${fill.fg};text-decoration:none">${escapeHtml(action.label)}${tag}</a>
</td></tr></table>
</td></tr>`;
};

export function toHtml(p: QuotePayload, meta: EmailMeta = {}): string {
  const mode = labelOf(MODES, p.request.mode);
  const preheader = `${mode} · ${keyLine(p)} from ${p.contact.name}, ${labelOf(CHANNELS, p.contact.channel)}`;
  const badge =
    p.request.mode === "buy"
      ? { bg: C.ink, fg: C.white }
      : { bg: C.brand, fg: C.white };

  const notes = p.notes
    ? `<tr><td style="padding:24px 32px 0 32px">
<div style="font-family:${MONO};font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:${C.brand};padding-bottom:8px">${escapeHtml(COPY.notes)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="border-left:3px solid ${C.brand};background:${C.brandTint};padding:14px 16px;font-family:${SANS};font-size:15px;line-height:23px;color:${C.body}">${multiline(p.notes)}</td>
</tr></table>
</td></tr>`
    : "";

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(COPY.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${C.surface}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.surface}">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.surface}" style="background:${C.surface}">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.white}" style="width:100%;max-width:600px;background:${C.white};border:1px solid ${C.line}">

<tr><td height="4" bgcolor="${C.brand}" style="height:4px;line-height:4px;font-size:0;background:${C.brand}">&nbsp;</td></tr>

<tr><td style="padding:28px 32px 0 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="font-family:${MONO};font-size:12px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:${C.ink}">${escapeHtml(site.name)}</td>
<td valign="middle" align="right">
<span style="display:inline-block;padding:5px 12px;background:${badge.bg};color:${badge.fg};font-family:${MONO};font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase">${escapeHtml(mode)}</span>
</td>
</tr></table>
</td></tr>

<tr><td style="padding:18px 32px 0 32px">
<div style="font-family:${SANS};font-size:14px;line-height:20px;color:${C.muted}">${escapeHtml(COPY.heading)}</div>
<div style="font-family:${SANS};font-size:24px;line-height:31px;font-weight:bold;color:${C.ink};padding-top:4px">${escapeHtml(keyLine(p))}</div>
</td></tr>

${sections(p)
  .map((s) => sectionHtml(s.title, s.rows))
  .join("\n")}

${notes}

<tr><td style="padding:28px 32px 18px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${actions(p)
  .map((a) => buttonHtml(a, a.channel === p.contact.channel))
  .join("\n")}
</table>
</td></tr>

<tr><td style="padding:16px 32px 24px 32px;border-top:1px solid ${C.line};font-family:${MONO};font-size:11px;line-height:18px;color:${C.muted}">
${footerLines(p, meta).map(escapeHtml).join("<br>")}
</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
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
