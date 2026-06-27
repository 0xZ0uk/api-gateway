// Upstream-error classification shared by the proxy chat path, the responses
// path, and the fusion panel. Pure functions over an error's message/status —
// no I/O — so they live in a neutral lib module that any of those can import
// without forming an import cycle (fusion ↔ proxy in particular).

export function isRetryableError(err: any): boolean {
  const msg = (err.message ?? '').toLowerCase();
  // Trust the upstream HTTP status the provider attached to the error first
  // (providerHttpError in providers/base.ts sets err.status on every adapter).
  // This structured check is the robust primary signal; the message-substring
  // rules below are the fallback for errors that carry a code in their text but
  // no numeric status.
  const status = typeof err?.status === 'number' ? err.status : 0;
  if (status === 408 || status === 409 || status === 410 || status === 429 || status >= 500) return true;
  return msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests')
    || msg.includes('quota') || msg.includes('resource_exhausted')
    || msg.includes('aborted') || msg.includes('timeout') || msg.includes('etimedout')
    || msg.includes('econnrefused') || msg.includes('econnreset')
    || msg.includes('fetch failed')
    || msg.includes('503') || msg.includes('unavailable')
    || msg.includes('500') || msg.includes('internal server error')
    || msg.includes('413') || msg.includes('payload too large') || msg.includes('request body too large')
    || msg.includes('request entity too large') || msg.includes('content too large')
    || msg.includes('404') || msg.includes('not found') || msg.includes('no endpoints found')
    || msg.includes('410') || msg.includes('gone')
    || isModelAccessForbiddenError(err)
    || msg.includes('api error 400')
    || isPaymentRequiredError(err)
    || msg.includes('empty completion')
    || msg.includes('in-band provider error')
    || msg.includes('stream ended unexpectedly')
    || msg.includes('stream stalled')
    || msg.includes('unparseable inline tool-call dialect');
}

export function isPaymentRequiredError(err: any): boolean {
  const msg = (err.message ?? '').toLowerCase();
  return msg.includes('402') || msg.includes('payment required')
    || msg.includes('insufficient_quota') || msg.includes('insufficient credit')
    || msg.includes('insufficient balance');
}

export function isModelNotFoundError(err: any): boolean {
  if (err?.status === 404 || err?.status === 410) return true;
  const msg = (err?.message ?? '').toLowerCase();
  return msg.includes('404') || msg.includes('not found') || msg.includes('no endpoints found')
    || msg.includes('410') || msg.includes('gone');
}

export function isModelAccessForbiddenError(err: any): boolean {
  if (err?.status === 403) return true;
  const msg = (err?.message ?? '').toLowerCase();
  return msg.includes('403') || msg.includes('forbidden');
}
