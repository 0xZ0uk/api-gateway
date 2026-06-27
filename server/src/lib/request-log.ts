import { getDb } from '../db/index.js';
import { pruneRequestAnalytics } from '../services/request-retention.js';

// Append a row to the request analytics table. Shared by the chat proxy, the
// responses path, and the fusion panel so every served (or failed) sub-request
// is attributable in analytics. The `tag` parameter marks fusion traffic
// specifically (as opposed to pinned-model traffic) so the dashboard can split
// normal vs fusion request counts meaningfully.

export function logRequest(
  platform: string,
  modelId: string,
  keyId: number,
  status: string,
  inputTokens: number,
  outputTokens: number,
  latencyMs: number,
  error: string | null,
  ttfbMs: number | null = null,
  tag: string | null = null,
) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO requests (platform, model_id, key_id, status, input_tokens, output_tokens, latency_ms, error, ttfb_ms, requested_model)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(platform, modelId, keyId, status, inputTokens, outputTokens, latencyMs, error, ttfbMs, tag);
    pruneRequestAnalytics();
  } catch (e) {
    console.error('Failed to log request:', e);
  }
}
