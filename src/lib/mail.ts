/**
 * Sends mail through the client's own mailbox over SMTP. Server only.
 *
 * The site's mail is GoDaddy Professional Email (MX → secureserver.net), so
 * the defaults in `astro.config.mjs` point at GoDaddy's SMTP host on 465/SSL.
 * GoDaddy rejects a `From` that is not the logged-in mailbox, which is why the
 * sender is always `SMTP_USER` and the customer goes in `Reply-To`.
 *
 * Retries follow the minar-cruise mailer: three tries, ~1s then ~2s apart.
 * Errors that cannot succeed on a second try (bad login, rejected address,
 * a 5xx from the server) are thrown at once instead of retried.
 */

import nodemailer, { type Transporter } from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_USER,
} from "astro:env/server";
import { withRetry } from "@/lib/retry";

export interface Mail {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  /** Display name shown beside the sender address. */
  fromName: string;
}

/** Codes nodemailer uses for failures that will fail the same way again. */
const PERMANENT = new Set(["EAUTH", "EENVELOPE", "EMESSAGE", "ECONFIG"]);

const isTransient = (error: unknown) => {
  const { code, responseCode } = (error ?? {}) as {
    code?: string;
    responseCode?: number;
  };
  if (code && PERMANENT.has(code)) return false;
  // 4xx is "try again later" in SMTP; 5xx is a refusal.
  if (responseCode && responseCode >= 500) return false;
  return true;
};

export const mailConfigured = () => Boolean(SMTP_USER && SMTP_PASSWORD);

// One connection setup per warm function instance, built on first use so a
// missing variable fails the request, not the import.
let transporter: Transporter | undefined;
const transport = () =>
  (transporter ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    // Bounded, so one attempt cannot eat the whole time budget below.
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  }));

/**
 * How long sending may take in all. The function's own limit is 30s
 * (`maxDuration` in `astro.config.mjs`); this leaves room for the database
 * writes either side and for an answer to reach the browser. A retry that
 * would run past it is skipped and the request is reported as failed — it is
 * already stored, so nothing is lost.
 */
const BUDGET = { totalMs: 20_000, attemptMs: 8_000 };

export class SendError extends Error {
  constructor(
    message: string,
    readonly attempts: number,
  ) {
    super(message);
  }
}

/**
 * Resolves with the message id and how many tries it took. Throws a
 * `SendError` carrying the last error's message and the try count.
 */
export async function sendMail(
  mail: Mail,
): Promise<{ messageId: string; attempts: number }> {
  let attempts = 0;
  try {
    const info = await withRetry(
      () => {
        attempts++;
        return transport().sendMail({
          from: { name: mail.fromName, address: SMTP_USER! },
          to: mail.to,
          replyTo: mail.replyTo,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        });
      },
      {
        retryIf: isTransient,
        budget: BUDGET,
        onRetry: (error, attempt, delay) =>
          console.warn(
            `[mail] attempt ${attempt} failed, retrying in ${delay}ms:`,
            (error as Error)?.message,
          ),
      },
    );
    return { messageId: info.messageId, attempts };
  } catch (error) {
    throw new SendError((error as Error)?.message ?? String(error), attempts);
  }
}
