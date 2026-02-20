import {
  CURRENT_LABELS,
  DIVE_TYPE_LABELS,
  EXPOSURE_LABELS,
  GAS_LABELS,
  VISIBILITY_LABELS,
  WATER_TYPE_LABELS,
} from './constants.js';
import type {
  DiveContext,
  DiverProfile,
  DiverProfilePayload,
  DivePayload,
} from './types.js';

function toNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toNullableStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const cleaned = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  return cleaned.length > 0 ? cleaned : null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const normalized = toNullableString(value);
    if (normalized) return normalized;
  }
  return null;
}

function labelEnum(value: string | null, labels: Record<string, string>): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return labels[normalized] ?? normalized;
}

export function normalizeDiveContext(dive: DivePayload): DiveContext {
  const location =
    firstString(dive.location, dive.locationName, dive.locations?.name) ?? 'an unknown site';
  const country = firstString(dive.country, dive.locationCountry, dive.locations?.country);
  const gas = toNullableString(dive.gas);
  const nitroxPercent = toNullableNumber(dive.nitrox_percent);
  const maxDepth = toNullableNumber(dive.depth);
  const providedAverageDepth = toNullableNumber(dive.average_depth);
  // If average depth is not provided, use a conservative recreational estimate of 70% of max depth.
  const estimatedAverageDepth = maxDepth !== null ? Number((maxDepth * 0.7).toFixed(1)) : null;
  const averageDepthSource: DiveContext['averageDepthSource'] =
    providedAverageDepth !== null
      ? 'logged'
      : estimatedAverageDepth !== null
      ? 'estimated'
      : 'unknown';
  const gasLabel =
    gas === 'nitrox' && nitroxPercent !== null
      ? `${GAS_LABELS.nitrox} ${nitroxPercent}%`
      : labelEnum(gas, GAS_LABELS);

  return {
    id: firstString(dive.id) ?? undefined,
    date: firstString(dive.date) ?? 'an unknown date',
    location,
    country,
    maxDepthMeters: maxDepth,
    averageDepthMeters: providedAverageDepth ?? estimatedAverageDepth,
    averageDepthSource,
    durationMinutes: toNullableNumber(dive.duration),
    waterTempCelsius: toNullableNumber(dive.water_temp),
    visibility: labelEnum(toNullableString(dive.visibility), VISIBILITY_LABELS),
    diveType: labelEnum(toNullableString(dive.dive_type), DIVE_TYPE_LABELS),
    waterType: labelEnum(toNullableString(dive.water_type), WATER_TYPE_LABELS),
    exposure: labelEnum(toNullableString(dive.exposure), EXPOSURE_LABELS),
    currents: labelEnum(toNullableString(dive.currents), CURRENT_LABELS),
    gas: gasLabel,
    startPressureBar: toNullableNumber(dive.start_pressure),
    endPressureBar: toNullableNumber(dive.end_pressure),
    gasUsedBar: toNullableNumber(dive.air_usage),
    cylinderType: toNullableString(dive.cylinder_type),
    cylinderSizeLiters: toNullableNumber(dive.cylinder_size),
    notes: firstString(dive.notes),
    equipment: toNullableStringArray(dive.equipment),
    wildlife: toNullableStringArray(dive.wildlife),
  };
}

export function normalizeDiverProfile(profile: DiverProfilePayload | null | undefined): DiverProfile {
  return {
    certificationLevel: firstString(profile?.cert_level),
    totalLoggedDives: Math.max(0, toNullableNumber(profile?.total_dives) ?? 0),
    avgDepth: toNullableNumber(profile?.average_depth),
    avgDuration: toNullableNumber(profile?.average_duration),
    recentDives30d: Math.max(0, toNullableNumber(profile?.recent_dives_30d) ?? 0),
    avgEstimatedRMV: toNullableNumber(profile?.average_rmv),
  };
}
