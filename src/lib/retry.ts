/**
 * Run an async call again when it fails, waiting longer each time.
 *
 * Exponential backoff with ±25% jitter: with the defaults a call is tried
 * three times, about 1s and 2s apart. `retryIf` decides which errors are worth
 * another attempt; one that will fail the same way every time (a wrong
 * password, a rejected address) should be thrown at once rather than waited
 * on. Ported from the minar-cruise mailer (`lib/retry-mechs.ts`).
 */

export interface RetryOptions {
  /** Attempts after the first. */
  retries?: number;
  /** Wait before the first retry; doubles each time. */
  baseDelayMs?: number;
  /** Cap on any single wait. */
  maxDelayMs?: number;
  /** Return false to stop retrying and throw this error now. */
  retryIf?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
  /**
   * Total time allowed, from the first call. A retry that could not finish
   * inside it is not started: on a serverless function the platform kills the
   * request at its time limit, and an answer beats a cut connection.
   * `attemptMs` is how long one attempt can take, used for that estimate.
   */
  budget?: { totalMs: number; attemptMs: number };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const backoff = (
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
) => {
  const exponential = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
  const jitter = exponential * 0.25 * (Math.random() - 0.5);
  return Math.floor(exponential + jitter);
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  {
    retries = 2,
    baseDelayMs = 1000,
    maxDelayMs = 8000,
    retryIf = () => true,
    onRetry,
    budget,
  }: RetryOptions = {},
): Promise<T> {
  const deadline = budget ? Date.now() + budget.totalMs : Infinity;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !retryIf(error)) throw error;
      const delay = backoff(attempt, baseDelayMs, maxDelayMs);
      if (Date.now() + delay + (budget?.attemptMs ?? 0) > deadline) throw error;
      onRetry?.(error, attempt + 1, delay);
      await wait(delay);
    }
  }
}
