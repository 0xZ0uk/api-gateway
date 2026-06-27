import { Router } from 'express';
import type { Request, Response } from 'express';
import { getUnifiedApiKey, regenerateUnifiedKey } from '../db/index.js';
import {
  getSavedFusionConfig, setSavedFusionConfig, savedFusionConfigSchema,
  getFusionMaxK,
} from '../services/fusion.js';

export const settingsRouter = Router();

// Get the unified API key
settingsRouter.get('/api-key', (_req: Request, res: Response) => {
  res.json({ apiKey: getUnifiedApiKey() });
});

// Regenerate the unified API key
settingsRouter.post('/api-key/regenerate', (_req: Request, res: Response) => {
  const newKey = regenerateUnifiedKey();
  res.json({ apiKey: newKey });
});

// ── Fusion config ─────────────────────────────────────────────────────────

// Get the saved fusion configuration
settingsRouter.get('/fusion', (_req: Request, res: Response) => {
  const config = getSavedFusionConfig();
  res.json({ ...config, maxK: getFusionMaxK() });
});

// Update the saved fusion configuration
settingsRouter.put('/fusion', (req: Request, res: Response) => {
  const parsed = savedFusionConfigSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { message: 'Invalid fusion configuration', details: parsed.error.flatten() } });
    return;
  }
  const updated = setSavedFusionConfig(parsed.data);
  res.json({ ...updated, maxK: getFusionMaxK() });
});
