/**
 * `parseQuote` — what the server accepts, and everything it refuses.
 *
 * Run with `bun test`. Each rejection case starts from a valid body and
 * breaks exactly one thing, so a failure names the rule that moved.
 */

import { describe, expect, test } from "bun:test";
import { LIMITS, isSpam, parseQuote } from "./parse";

const NOW = new Date("2026-11-21T10:00:00Z");

/** A valid hire request, as the form's `toPayload` + old `message` send it. */
const hire = () => ({
  v: 1,
  submittedAt: "2020-01-01T00:00:00Z",
  source: { page: "/equipment/generators", variant: "dialog" },
  request: {
    mode: "hire",
    category: { id: "generators", name: "Client says anything" },
    otherItem: null as string | null,
    rating: { label: "400 KVA", powerType: "Petrol", availability: "yard" },
    duty: null,
    quantity: 2,
    attachments: null,
  },
  terms: {
    startDate: "2026-12-01",
    duration: "1-3-months",
    emirate: "dubai",
    transport: "deliver",
    condition: null,
    timeframe: null,
    destination: "uae",
    docs: false,
  },
  contact: {
    name: "Ahmed Khan",
    company: "Khan Contracting",
    phone: "+971 50 123 4567",
    email: "ahmed@example.com",
    channel: "whatsapp",
  },
  notes: "Site access after 7am.\nGate 3.",
  message: "ignored",
  website: "",
});

const buy = () => {
  const b = hire();
  b.request.mode = "buy";
  Object.assign(b.terms, {
    startDate: null,
    duration: null,
    emirate: null,
    condition: "new",
    timeframe: "this-month",
    destination: "oman",
    docs: true,
  });
  return b;
};

const ok = (body: unknown) => {
  const result = parseQuote(body, NOW);
  if (!result.ok) throw new Error(`${result.field}: ${result.reason}`);
  return result.payload;
};

const rejects = (body: unknown, field: string) => {
  const result = parseQuote(body, NOW);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.field).toBe(field);
};

/** A copy of `hire()` with one change. */
const edit = (change: (b: ReturnType<typeof hire>) => void) => {
  const b = hire() as ReturnType<typeof hire>;
  change(b);
  return b;
};

describe("accepts", () => {
  test("a hire request, rebuilt from the catalogue and the server clock", () => {
    const p = ok(hire());
    expect(p.request.category).toEqual({
      id: "generators",
      name: "Generators",
    });
    // Power type and availability are the catalogue's, not the client's.
    expect(p.request.rating).toEqual({
      label: "400 KVA",
      powerType: "Diesel",
      availability: "on_request",
    });
    expect(p.submittedAt).toBe(NOW.toISOString());
    expect(p.terms).toEqual({
      startDate: "2026-12-01",
      duration: "1-3-months",
      emirate: "dubai",
      transport: "deliver",
      condition: null,
      timeframe: null,
      destination: null, // the form's buy default, dropped for a hire
      docs: false,
    });
    expect(p.notes).toBe("Site access after 7am.\nGate 3.");
    expect("message" in p).toBe(false);
    expect("website" in p).toBe(false);
  });

  test("a buy request, with hire terms dropped", () => {
    const b = buy();
    b.terms.transport = "deliver";
    const p = ok(b);
    expect(p.request.mode).toBe("buy");
    expect(p.terms.transport).toBeNull();
    expect(p.terms.condition).toBe("new");
    expect(p.terms.destination).toBe("oman");
    expect(p.terms.docs).toBe(true);
  });

  test("something else: no category, free-text item", () => {
    const p = ok(
      edit((b) => {
        (b.request as Record<string, unknown>).category = null;
        b.request.otherItem = "4-inch diesel water pump";
        (b.request as Record<string, unknown>).rating = null;
      }),
    );
    expect(p.request.category).toBeNull();
    expect(p.request.otherItem).toBe("4-inch diesel water pump");
  });

  test("a duplicate label resolved by power type", () => {
    const p = ok(
      edit((b) => {
        b.request.category.id = "forklifts";
        b.request.rating = {
          label: "3 ton",
          powerType: "Electric",
          availability: "yard",
        };
      }),
    );
    expect(p.request.rating?.label).toBe("3 ton");
    expect(p.request.rating?.powerType).toBe("Electric");
  });

  test("unsure size with a duty description", () => {
    const p = ok(
      edit((b) => {
        (b.request as Record<string, unknown>).rating = null;
        (b.request as Record<string, unknown>).duty = "Four site cabins";
      }),
    );
    expect(p.request.rating).toBeNull();
    expect(p.request.duty).toBe("Four site cabins");
  });

  test("control and bidi characters are stripped", () => {
    const p = ok(
      edit((b) => {
        b.contact.name = "Ah\u0000med\u202E Khan\u0007";
        b.notes = "line one\u0008\r\nline two";
      }),
    );
    expect(p.contact.name).toBe("Ahmed Khan");
    expect(p.notes).toBe("line one\nline two");
  });

  test("unknown top-level keys are ignored", () => {
    const p = ok(edit((b) => Object.assign(b, { extra: { deep: 1 } })));
    expect("extra" in p).toBe(false);
  });
});

describe("rejects", () => {
  test("not an object / wrong version", () => {
    rejects([], "body");
    rejects("x", "body");
    rejects(
      edit((b) => (b.v = 2)),
      "v",
    );
  });

  test("an enum that is not an option", () => {
    rejects(
      edit((b) => (b.request.mode = "lease")),
      "request.mode",
    );
    rejects(
      edit((b) => (b.terms.duration = "1–3 months")),
      "terms.duration",
    );
    rejects(
      edit((b) => (b.terms.emirate = "london")),
      "terms.emirate",
    );
    rejects(
      edit((b) => (b.terms.transport = "teleport")),
      "terms.transport",
    );
    rejects(
      edit((b) => (b.contact.channel = "fax")),
      "contact.channel",
    );
    rejects(
      edit((b) => ((b.source as Record<string, unknown>).variant = "popup")),
      "source.variant",
    );
    // Validated even when the other mode would drop it.
    rejects(
      edit((b) => ((b.terms as Record<string, unknown>).condition = "mint")),
      "terms.condition",
    );
  });

  test("a required term for the mode is missing", () => {
    rejects(
      edit((b) => ((b.terms as Record<string, unknown>).duration = null)),
      "terms.duration",
    );
    const b = buy();
    (b.terms as Record<string, unknown>).timeframe = null;
    rejects(b, "terms.timeframe");
  });

  test("an unknown category", () => {
    rejects(
      edit((b) => (b.request.category.id = "spaceships")),
      "request.category",
    );
  });

  test("a rating the category does not list", () => {
    rejects(
      edit((b) => (b.request.rating.label = "5 ton")),
      "request.rating",
    );
  });

  test("a listed machine with neither size nor duty", () => {
    rejects(
      edit((b) => ((b.request as Record<string, unknown>).rating = null)),
      "request.rating",
    );
  });

  test("other item missing, or a rating without a category", () => {
    rejects(
      edit((b) => ((b.request as Record<string, unknown>).category = null)),
      "request.otherItem",
    );
    rejects(
      edit((b) => {
        (b.request as Record<string, unknown>).category = null;
        b.request.otherItem = "Pump";
      }),
      "request.rating",
    );
  });

  test("quantity out of range or not whole", () => {
    for (const q of [0, -1, 1000, 1.5, "2", Number.NaN]) {
      rejects(
        edit((b) => ((b.request as Record<string, unknown>).quantity = q)),
        "request.quantity",
      );
    }
  });

  test("oversize strings", () => {
    rejects(
      edit((b) => (b.contact.name = "a".repeat(LIMITS.name + 1))),
      "contact.name",
    );
    rejects(
      edit((b) => (b.notes = "a".repeat(LIMITS.notes + 1))),
      "notes",
    );
    rejects(
      edit((b) => (b.contact.company = "a".repeat(LIMITS.company + 1))),
      "contact.company",
    );
  });

  test("header injection in name or email", () => {
    rejects(
      edit((b) => (b.contact.name = "Bob\r\nBcc: victim@example.com")),
      "contact.name",
    );
    rejects(
      edit((b) => (b.contact.email = "a@example.com\r\nBcc: b@example.com")),
      "contact.email",
    );
    rejects(
      edit((b) => (b.contact.email = "Bob <a@example.com>")),
      "contact.email",
    );
    rejects(
      edit((b) => (b.contact.email = "a@example.com,b@example.com")),
      "contact.email",
    );
  });

  test("a bad email, or none at all, whatever the channel", () => {
    rejects(
      edit((b) => (b.contact.email = "not-an-email")),
      "contact.email",
    );
    for (const channel of ["email", "whatsapp", "call"] as const) {
      rejects(
        edit((b) => {
          (b.contact as Record<string, unknown>).email = null;
          b.contact.channel = channel;
        }),
        "contact.email",
      );
    }
  });

  test("a bad phone", () => {
    for (const phone of ["12345", "+971 abc 1234", "1".repeat(21), "+9+71"]) {
      rejects(
        edit((b) => (b.contact.phone = phone)),
        "contact.phone",
      );
    }
  });

  test("a page that is not a same-site path", () => {
    for (const page of [
      "https://evil.example/x",
      "//evil.example/x",
      "/\\evil.example",
      "javascript:alert(1)",
      "/a b",
      "/<script>",
      "",
    ]) {
      rejects(
        edit((b) => (b.source.page = page)),
        "source.page",
      );
    }
  });

  test("a date that is not YYYY-MM-DD or not a real day", () => {
    for (const d of ["01/12/2026", "2026-02-30", "2026-13-01", "1999-01-01"]) {
      rejects(
        edit((b) => (b.terms.startDate = d)),
        "terms.startDate",
      );
    }
  });

  test("a wrong type", () => {
    rejects(
      edit((b) => ((b.contact as Record<string, unknown>).name = 42)),
      "contact.name",
    );
    rejects(
      edit((b) => ((b.terms as Record<string, unknown>).docs = "yes")),
      "terms.docs",
    );
  });
});

describe("honeypot", () => {
  test("empty or absent is a person", () => {
    expect(isSpam(hire())).toBe(false);
    expect(isSpam({})).toBe(false);
  });
  test("filled is a bot", () => {
    expect(isSpam({ ...hire(), website: "http://spam.example" })).toBe(true);
  });
});
