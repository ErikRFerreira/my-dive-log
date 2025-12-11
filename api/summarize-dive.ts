import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const allowedOrigins = [
  'http://localhost:5173',
  'https://my-dive-log-3n4b.vercel.app',
];

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || '';

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

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
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    return res.status(200).end();
  }
	
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

Return the result in **exactly this structure**:

Summary:
<2–3 concise sentences summarizing this dive for a dive logbook.>

Similar locations:
<- Recommend 1–2 *types* of dive environments the diver might enjoy (e.g., “shallow reefs”, “calm wall dives”). 
Do NOT name specific geographic locations or famous dive sites. 
If unsure, say: "Not enough information to suggest similar environments.">

Tips:
<- Provide 1 brief safety reminder AND 1 environmental conservation tip relevant to the dive conditions, if appropriate. 
Otherwise say: "No specific tips for this dive.">

Future practice:
<- Suggest 1 future dive skill or training activity based on the dive profile, if appropriate.
Otherwise say: "No specific recommendations.">

Details:
- Location: ${location}${country ? `, ${country}` : ''}
- Date: ${date}
- Max depth: ${depth} m
- Duration: ${duration} min
- Conditions: ${conditions}
- Notes: ${notes}

Rules:
- Keep it friendly but factual.
- Use ONLY the information provided.
- Do NOT invent details.
- Keep each section under 2 sentences.
- Keep the total output under 120 words.
`.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You write concise scuba dive log summaries.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 250,
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
