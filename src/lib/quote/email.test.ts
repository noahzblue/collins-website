/**
 * The notification email — escaping, the rows a mode shows, the actions and
 * the one-line subject. Run with `bun test`.
 */

import { describe, expect, test } from "bun:test";
import { intlDigits, refOf, toEmail, toReceipt, toText } from "./email";
import { parseQuote } from "./parse";
import type { QuotePayload } from "./schema";

const NOW = new Date("2026-11-21T10:00:00Z");
const ID = "3f2a9c1b-0000-4000-8000-000000000000";

const base = {
  v: 1,
  source: { page: "/equipment/generators", variant: "dialog" },
  request: {
    mode: "hire",
    category: { id: "generators" },
    rating: { label: "250 KVA", powerType: "Diesel" },
    quantity: 2,
  },
  terms: {
    startDate: "2026-12-01",
    duration: "1-3-months",
    emirate: "dubai",
    transport: "deliver",
    destination: "uae",
  },
  contact: {
    name: "Ahmed Khan",
    phone: "+971 50 123 4567",
    email: "ahmed@example.com",
    channel: "whatsapp",
  },
  notes: null as string | null,
};

const payload = (change: (b: any) => void = () => {}): QuotePayload => {
  const body = structuredClone(base);
  change(body);
  const result = parseQuote(body, NOW);
  if (!result.ok) throw new Error(`${result.field}: ${result.reason}`);
  return result.payload;
};

describe("toEmail", () => {
  test("subject is one capped line with mode, machine, size and name", () => {
    const { subject } = toEmail(payload());
    expect(subject).toBe(
      "Quote request (Hire): Generators · 250 KVA · ×2 from Ahmed Khan",
    );
    const long = toEmail(payload((b) => (b.contact.name = "N".repeat(100))));
    expect(long.subject.length).toBeLessThanOrEqual(150);
    expect(long.subject).not.toMatch(/[\r\n]/);
  });

  test("script tags and quotes in user text are escaped in the HTML", () => {
    const evil = `<script>alert("x")</script>`;
    const mail = toEmail(
      payload((b) => {
        b.contact.name = `Eve ${evil}`;
        b.notes = `${evil}\n<img src=x onerror=alert(1)>`;
        b.request.category = null;
        b.request.rating = null;
        b.request.otherItem = `<b>pump</b>`;
      }),
    );
    expect(mail.html).not.toContain("<script>");
    // The logo is the only real image; the injected one must be text.
    expect(mail.html).not.toContain("<img src=x");
    expect(mail.html).not.toContain("<b>pump");
    expect(mail.html).toContain(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
    // The text part is plain text: raw is correct there.
    expect(mail.text).toContain(evil);
  });

  test("hire shows hire terms only; buy shows buy terms only", () => {
    const hire = toText(payload());
    expect(hire).toContain("Duration: 1–3 months");
    expect(hire).toContain("Location: Dubai");
    expect(hire).not.toContain("Destination");

    const buy = toText(
      payload((b) => {
        b.request.mode = "buy";
        b.terms = {
          condition: "both",
          timeframe: "this-quarter",
          destination: "oman",
          docs: true,
        };
      }),
    );
    expect(buy).toContain("Condition: Price me both");
    expect(buy).toContain("Destination: Oman");
    expect(buy).toContain("Documentation pack: Yes");
    expect(buy).not.toContain("Duration");
    expect(buy).toContain("Stock: Ready stock");
  });

  test("rows without a value are left out", () => {
    const text = toText(payload());
    expect(text).not.toContain("Company:");
    expect(text).not.toContain("Attachments:");
    expect(text).not.toContain("CUSTOMER'S NOTES");
  });

  test("actions: preferred is the button, the others follow as links", () => {
    const html = toEmail(payload()).html;
    const wa = html.indexOf('href="https://wa.me/971501234567?text=');
    const call = html.indexOf('href="tel:+971501234567"');
    expect(wa).toBeGreaterThan(-1);
    expect(call).toBeGreaterThan(wa); // WhatsApp preferred, so it leads
    expect(html).toContain(">Reply on WhatsApp<");
    expect(html).toContain("mailto:ahmed@example.com?subject=");
    expect(html).toContain("Prefers a reply on WhatsApp.");
    expect(html).toContain(
      encodeURIComponent(
        "Hi Ahmed, this is Collins Equipments about your quote request for Generators, 250 KVA × 2.",
      ),
    );

    const byPhone = toEmail(payload((b) => (b.contact.channel = "call"))).html;
    expect(byPhone).toContain(">Call +971 50 123 4567<");
    expect(byPhone.indexOf('href="tel:')).toBeLessThan(
      byPhone.indexOf('href="https://wa.me/'),
    );

    // No email-less case: parse.ts refuses a request without one (2026-11-23).

    const text = toText(payload((b) => (b.contact.channel = "call")));
    expect(text.indexOf("Call (Preferred)")).toBeLessThan(
      text.indexOf("WhatsApp:"),
    );
  });

  test("footer: page, Dubai time and reference", () => {
    const { html, text } = toEmail(payload(), { id: ID });
    expect(text).toContain("collinscouae.com/equipment/generators (dialog)");
    expect(text).toContain("21 Nov 2026, 14:00 Dubai time");
    expect(text).toContain(`Reference 3F2A9C1B · ${ID}`);
    expect(html).toContain("3F2A9C1B");
  });
});

describe("toReceipt", () => {
  test("thanks by first name, promise, and replies go to the office", () => {
    const receipt = toReceipt(payload(), { id: ID });
    expect(receipt.subject).toBe(
      "We have your quote request: Generators · 250 KVA · ×2",
    );
    expect(receipt.html).toContain("Thanks, Ahmed. We have your request.");
    expect(receipt.text).toContain("We'll reply on WhatsApp.");
    expect(receipt.text).toContain("Reference: 3F2A9C1B");
    expect(receipt.replyTo).toBe("info@collinscouae.com");
    expect(receipt.text).toContain(
      encodeURIComponent("Hi Collins, about my quote request 3F2A9C1B: "),
    );
  });

  test("leaves out the yard's working rows and escapes user text", () => {
    const receipt = toReceipt(
      payload((b) => {
        b.contact.name = `<b>Eve</b> Smith`;
        b.request.rating = { label: "250 KVA", powerType: "Diesel" };
      }),
    );
    expect(receipt.text).not.toContain("Stock:");
    expect(receipt.html).not.toContain("<b>Eve");
    expect(receipt.html).toContain("&lt;b&gt;Eve&lt;/b&gt;");
  });

  test("logo is an absolute PNG on the live site", () => {
    const { html } = toReceipt(payload());
    expect(html).toContain(
      'src="https://www.collinscouae.com/email/collins-logo-blue.png"',
    );
  });
});

describe("helpers", () => {
  test("intlDigits reads local UAE forms as +971", () => {
    expect(intlDigits("+971 50 123 4567")).toBe("971501234567");
    expect(intlDigits("00971 50 123 4567")).toBe("971501234567");
    expect(intlDigits("050 123 4567")).toBe("971501234567");
    expect(intlDigits("+44 (20) 7946-0958")).toBe("442079460958");
  });

  test("refOf is the first eight hex digits, upper-case", () => {
    expect(refOf(ID)).toBe("3F2A9C1B");
  });
});
