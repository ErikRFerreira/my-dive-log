import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';
import { getBearerToken, verifySupabaseToken, getSupabaseEnv } from "../src/server/auth.js";

const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type DivePayload = {
  location?: string | null;
  country?: string | null;
  date?: string | null;
  depth?: number | null;
  duration?: number | null;
  notes?: string | null;
};

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

    const {
      location = 'an unknown site',
      country = '',
      date = 'an unknown date',
      depth = 0,
      duration = 0,
      notes = 'no additional notes',
    } = dive;

    const prompt = `
You are generating a short scuba dive log summary.

Return the result in exactly this structure:

Summary:
<2–3 concise sentences summarizing this dive for a dive logbook.>

Similar locations:
<- Recommend 1–2 types of dive environments the diver might enjoy.
If unsure, say: "Not enough information to suggest similar environments.">

Tips:
<- Provide 1 brief safety reminder AND 1 environmental conservation tip if appropriate.
Otherwise say: "No specific tips for this dive.">

Future practice:
<- Suggest 1 future dive skill or training activity if appropriate.
Otherwise say: "No specific recommendations.">

Details:
- Location: ${location}${country ? `, ${country}` : ''}
- Date: ${date}
- Max depth: ${depth} m
- Duration: ${duration} min
- Notes: ${notes}

Rules:
- Use ONLY the information provided.
- Do NOT invent details.
- Keep the total output under 120 words.
    `.trim();

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You write concise scuba dive log summaries.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 200,
    });

    const summary = completion.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      return res.status(500).json({ error: 'No summary returned from model' });
    }

    return res.status(200).json({ summary });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    console.error('Error in summarize-dive:', errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
}
