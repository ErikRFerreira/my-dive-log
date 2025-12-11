// api/summarize-dive.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type DivePayload = {
  location?: string | null;
  country?: string | null;
  date?: string | null;
  depth?: number | null;
  duration?: number | null;
  conditions?: string | null;
  notes?: string | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const dive = (req.body?.dive || req.body) as DivePayload | undefined;

    if (!dive) {
      return res.status(400).json({ error: 'Missing dive payload' });
    }

    const {
      location = 'an unknown site',
      country = '',
      date = 'an unknown date',
      depth = 0,
      duration = 0,
      conditions = 'unspecified conditions',
      notes = 'no additional notes',
    } = dive;

    const prompt = `
You are generating a short scuba dive log summary.

Write 2–3 concise sentences summarizing this dive for a dive logbook.

Details:
- Location: ${location}${country ? `, ${country}` : ''}
- Date: ${date}
- Max depth: ${depth} m
- Duration: ${duration} min
- Conditions: ${conditions}
- Notes: ${notes}

Keep it friendly but factual. Do not invent details that are not provided.
Based on the details, suggest similar dive locations the diver might enjoy (just 1-2).
If appropriate, include a brief safety reminder and environmental conservation tip relevant to the dive conditions.
If appropriate, suggest fututre dive activities or skills to practice based on the dive profile.
`.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You write concise scuba dive log summaries.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 160,
    });

    const summary = response.choices[0]?.message?.content?.trim();

    if (!summary) {
      return res.status(500).json({ error: 'No summary returned from OpenAI' });
    }

    return res.status(200).json({ summary });
  } catch (err) {
    console.error('Error in summarize-dive:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
