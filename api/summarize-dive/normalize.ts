import {
  CURRENT_LABELS,
  DIVE_TYPE_LABELS,
  EXPOSURE_LABELS,
  GAS_LABELS,
  VISIBILITY_LABELS,
  WATER_TYPE_LABELS,
} from './constants';
import type { DivePayload, NormalizedDiveContext } from './types';

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

export function normalizeDiveContext(dive: DivePayload): NormalizedDiveContext {
  const location =
    firstString(dive.location, dive.locationName, dive.locations?.name) ?? 'an unknown site';
  const country = firstString(dive.country, dive.locationCountry, dive.locations?.country);
  const gas = toNullableString(dive.gas);
  const nitroxPercent = toNullableNumber(dive.nitrox_percent);
  const gasLabel =
    gas === 'nitrox' && nitroxPercent !== null
      ? `${GAS_LABELS.nitrox} ${nitroxPercent}%`
      : labelEnum(gas, GAS_LABELS);

  return {
    location,
    country,
    date: firstString(dive.date) ?? 'an unknown date',
    depth: toNullableNumber(dive.depth),
    duration: toNullableNumber(dive.duration),
    waterTemp: toNullableNumber(dive.water_temp),
    visibility: labelEnum(toNullableString(dive.visibility), VISIBILITY_LABELS),
    diveType: labelEnum(toNullableString(dive.dive_type), DIVE_TYPE_LABELS),
    waterType: labelEnum(toNullableString(dive.water_type), WATER_TYPE_LABELS),
    exposure: labelEnum(toNullableString(dive.exposure), EXPOSURE_LABELS),
    currents: labelEnum(toNullableString(dive.currents), CURRENT_LABELS),
    weight: toNullableNumber(dive.weight),
    gas: gasLabel,
    startPressure: toNullableNumber(dive.start_pressure),
    endPressure: toNullableNumber(dive.end_pressure),
    airUsage: toNullableNumber(dive.air_usage),
    cylinderType: toNullableString(dive.cylinder_type),
    cylinderSize: toNullableNumber(dive.cylinder_size),
    equipment: toNullableStringArray(dive.equipment),
    wildlife: toNullableStringArray(dive.wildlife),
    notes: firstString(dive.notes) ?? 'No additional notes.',
  };
}
