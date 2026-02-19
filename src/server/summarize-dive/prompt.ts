import {
  NO_BASELINE_COMPARISON,
  NO_MEANINGFUL_INSIGHT_TEXT,
  NO_SPECIFIC_RECOMMENDATIONS,
  PROMPT_VERSION,
} from './constants.js';
import { hasHistoricalBaseline } from './metrics.js';
import type { BuildDiveInsightPromptInput } from './types.js';

function inferToneInstruction(certificationLevel: string | null): string {
  if (!certificationLevel) return 'Use a neutral professional tone.';

  const normalized = certificationLevel.toLowerCase();

  if (normalized.includes('open water') || normalized.includes('beginner')) {
    return 'Basic safety framing is allowed when directly justified by provided data.';
  }

  if (
    normalized.includes('advanced') ||
    normalized.includes('rescue') ||
    normalized.includes('tec') ||
    normalized.includes('instructor')
  ) {
    return 'Avoid obvious beginner advice. Keep feedback technical and specific.';
  }

  return 'Use a neutral professional tone.';
}

export function buildDiveInsightPrompt(input: BuildDiveInsightPromptInput): string {
  const { dive, profile, signals, metrics } = input;
  const hasBaseline = hasHistoricalBaseline(profile);
  const toneInstruction = inferToneInstruction(profile.certificationLevel);

  return `
You generate structured Dive Insight output for a scuba log product.

Prompt version: ${PROMPT_VERSION}

Hard output rules:
1) Return strict JSON only.
2) Output must follow this exact schema:
{
  "recap": "<max 2 factual sentences>",
  "dive_insight": {
    "text": "<meaningful insight text OR exact anti-filler text>",
    "baseline_comparison": "<historical comparison sentence OR exact no-baseline text>",
    "evidence": ["<short references to metrics/signals used>"]
  },
  "recommendations": [
    { "action": "<concrete action>", "rationale": "<why this is justified by provided data>" }
  ]
}
or set "recommendations" to exactly "${NO_SPECIFIC_RECOMMENDATIONS}" when no justified recommendation exists.

3) Never fabricate facts, values, events, risks, wildlife, or history.
4) Use only provided data blocks below.
5) Keep total output under ~300 tokens.
6) If no meaningful value-add insight beyond recap is possible, set:
"dive_insight.text": "${NO_MEANINGFUL_INSIGHT_TEXT}"
7) Generic advice is prohibited unless explicitly justified by provided signals or metrics.
8) If recommendations are generic or unsupported, output "${NO_SPECIFIC_RECOMMENDATIONS}".
9) ${toneInstruction}

Historical comparison rule (mandatory):
- hasBaseline: ${hasBaseline ? 'true' : 'false'}
- If hasBaseline=true, baseline_comparison MUST include at least one comparison about depth, duration, or gas efficiency.
- If hasBaseline=false, baseline_comparison MUST be exactly "${NO_BASELINE_COMPARISON}".

Data blocks (authoritative):
dive = ${JSON.stringify(dive, null, 2)}

profile = ${JSON.stringify(profile, null, 2)}

signals = ${JSON.stringify(signals, null, 2)}

metrics = ${JSON.stringify(metrics, null, 2)}
  `.trim();
}
