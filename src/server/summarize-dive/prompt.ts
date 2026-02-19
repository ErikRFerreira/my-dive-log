import { extractSignals, inferEnvironmentHints } from './signals';
import type { NormalizedDiveContext } from './types';

function displayValue(value: string | number | null | undefined, suffix = ''): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  return `${value}${suffix}`;
}

function formatList(items: string[] | null): string {
  if (!items || items.length === 0) return 'N/A';
  return items.join(', ');
}

export function buildPrompt(context: NormalizedDiveContext): string {
  const signals = extractSignals(context);
  const environmentHints = inferEnvironmentHints(context);
  const locationLine = context.country ? `${context.location}, ${context.country}` : context.location;

  return `
You are generating a concise scuba dive log summary.

Return valid JSON only with this exact shape:
{
  "summary": "<2-3 concise sentences focused on factual dive recap>",
  "similar_locations": "<1 line with 1-2 environment suggestions, or 'Not enough information to suggest similar environments.'>",
  "tips": "<1 line with one safety reminder and one conservation tip when relevant, or 'No specific tips for this dive.'>",
  "future_practice": "<1 line with one actionable training focus, or 'No specific recommendations.'>"
}

Dive details:
- Location: ${locationLine}
- Date: ${context.date}
- Max depth: ${displayValue(context.depth, ' m')}
- Duration: ${displayValue(context.duration, ' min')}
- Water temperature: ${displayValue(context.waterTemp, ' C')}
- Dive type: ${displayValue(context.diveType)}
- Visibility: ${displayValue(context.visibility)}
- Water type: ${displayValue(context.waterType)}
- Exposure: ${displayValue(context.exposure)}
- Currents: ${displayValue(context.currents)}
- Weight: ${displayValue(context.weight, ' kg')}
- Gas: ${displayValue(context.gas)}
- Start pressure: ${displayValue(context.startPressure, ' bar')}
- End pressure: ${displayValue(context.endPressure, ' bar')}
- Gas used: ${displayValue(context.airUsage, ' bar')}
- Cylinder: ${context.cylinderType ?? 'N/A'}${context.cylinderSize !== null ? ` (${context.cylinderSize} L)` : ''}
- Equipment: ${formatList(context.equipment)}
- Wildlife: ${formatList(context.wildlife)}
- Notes: ${context.notes}

Risk and profile signals:
${signals.length > 0 ? signals.map((signal) => `- ${signal}`).join('\n') : '- No notable risk signals provided.'}

Environment and inference hints:
${environmentHints.length > 0 ? environmentHints.map((hint) => `- ${hint}`).join('\n') : '- None'}

Rules:
- Use only the details above.
- Do not fabricate species, events, conditions, or training outcomes.
- High-confidence inference is allowed only when strongly supported by details and signals.
- If confidence is low, keep statements generic.
- Keep total content concise and practical.
  `.trim();
}
