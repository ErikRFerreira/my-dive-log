import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
import { getBearerToken, verifySupabaseToken, getSupabaseEnv } from '../src/server/auth';
import {
  MODEL,
  MODEL_MAX_TOKENS,
  MODEL_SEED,
  MODEL_TEMPERATURE,
} from '../src/server/summarize-dive/constants';
import { parseModelJson, formatSummaryResponse } from '../src/server/summarize-dive/format';
import { normalizeDiveContext } from '../src/server/summarize-dive/normalize';
import { buildPrompt } from '../src/server/summarize-dive/prompt';
import type { DivePayload } from '../src/server/summarize-dive/types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate environment variables
  const env = getSupabaseEnv();
  if ('error' in env) {
    return res.status(500).json({ error: env.error });
  }

  // Verify authentication
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization bearer token' });
  }

  const authResult = await verifySupabaseToken(token);
  if ('error' in authResult) {
    return res.status(401).json({ error: authResult.error });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const dive = (body?.dive || body) as DivePayload | undefined;

    if (!dive) {
      return res.status(400).json({ error: 'Missing dive payload' });
    }

    const context = normalizeDiveContext(dive);
    const prompt = buildPrompt(context);

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You write concise scuba dive log summaries and return strict JSON when requested.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: MODEL_TEMPERATURE,
      max_tokens: MODEL_MAX_TOKENS,
      seed: MODEL_SEED,
      response_format: { type: 'json_object' },
    });

    const modelContent = completion.choices?.[0]?.message?.content?.trim();

    if (!modelContent) {
      return res.status(500).json({ error: 'No summary returned from model' });
    }

    const parsed = parseModelJson(modelContent);
    const summary = formatSummaryResponse(parsed, parsed ? undefined : modelContent);

    return res.status(200).json({ summary });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    console.error('Error in summarize-dive:', errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
}
