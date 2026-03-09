import type { IncomingHttpHeaders } from "http";

export interface RelayResult {
  target: string;
  status: number | null;
  ok: boolean;
  error?: string;
  durationMs: number;
  attempts: number;
}

const HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = [500, 1500]; // delays between attempt 1→2, 2→3

function isRetryable(status: number | null): boolean {
  if (status === null) return true; // network error / timeout
  return status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function forwardHeaders(incoming: IncomingHttpHeaders): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(incoming)) {
    if (HOP_HEADERS.has(key.toLowerCase())) continue;
    if (val === undefined) continue;
    out[key] = Array.isArray(val) ? val.join(", ") : val;
  }
  return out;
}

async function relayToTarget(
  url: string,
  method: string,
  headers: Record<string, string>,
  body: Buffer
): Promise<RelayResult> {
  const start = Date.now();
  let lastResult: RelayResult | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      await sleep(RETRY_DELAY_MS[attempt - 2]);
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: ["GET", "HEAD"].includes(method.toUpperCase()) ? undefined : new Uint8Array(body),
        signal: AbortSignal.timeout(30_000),
      });

      lastResult = {
        target: url,
        status: res.status,
        ok: res.ok,
        durationMs: Date.now() - start,
        attempts: attempt,
      };

      if (!isRetryable(res.status)) {
        return lastResult;
      }
    } catch (err: any) {
      lastResult = {
        target: url,
        status: null,
        ok: false,
        error: err.message || String(err),
        durationMs: Date.now() - start,
        attempts: attempt,
      };
    }
  }

  return lastResult!;
}

export async function relayWebhook(
  targets: string[],
  method: string,
  headers: IncomingHttpHeaders,
  body: Buffer,
  path: string
): Promise<RelayResult[]> {
  const fwdHeaders = forwardHeaders(headers);

  const results = await Promise.allSettled(
    targets.map((target) => {
      const url = target.replace(/\/+$/, "") + path;
      return relayToTarget(url, method, fwdHeaders, body);
    })
  );

  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { target: "unknown", status: null, ok: false, error: String(r.reason), durationMs: 0, attempts: 1 }
  );
}
