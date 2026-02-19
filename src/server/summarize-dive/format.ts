import {
  DEFAULT_FUTURE_PRACTICE,
  DEFAULT_SIMILAR_LOCATIONS,
  DEFAULT_SUMMARY,
  DEFAULT_TIPS,
} from './constants.js';
import type { ModelSummaryResponse } from './types.js';

export function parseModelJson(content: string): ModelSummaryResponse | null {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? content.trim();

  try {
    const parsed = JSON.parse(candidate) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed as ModelSummaryResponse;
  } catch {
    return null;
  }
}

function toSectionText(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
    return items.length > 0 ? items.join(' ') : null;
  }

  return null;
}

export function formatSummaryResponse(
  response: ModelSummaryResponse | null,
  fallbackSummary?: string
): string {
  const summary = toSectionText(response?.summary) ?? (fallbackSummary?.trim() || null) ?? DEFAULT_SUMMARY;
  const similarLocations = toSectionText(response?.similar_locations) ?? DEFAULT_SIMILAR_LOCATIONS;
  const tips = toSectionText(response?.tips) ?? DEFAULT_TIPS;
  const futurePractice = toSectionText(response?.future_practice) ?? DEFAULT_FUTURE_PRACTICE;

  return `Summary:\n${summary}\n\nSimilar locations:\n${similarLocations}\n\nTips:\n${tips}\n\nFuture practice:\n${futurePractice}`;
}
