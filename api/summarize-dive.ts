import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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
      conditions = 'unspecified conditions',
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
- Conditions: ${conditions}
- Notes: ${notes}

Rules:
- Use ONLY the information provided.
- Do NOT invent details.
- Keep the total output under 120 words.
    `.trim();

    const completion = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
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
  } catch (err: any) {
    console.error('Error in summarize-dive:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
