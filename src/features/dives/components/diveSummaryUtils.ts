import type { Dive } from '../types';
import type { UpdateDiveInput } from '../schemas/updateDiveSchema';
import type { DiveSummaryPayload } from '@/services/apiAI';

type SummaryDraftValues = Partial<UpdateDiveInput>;

const trimNullableString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const pickNumber = (draftValue: unknown, fallback: number | null): number | null => {
  if (draftValue === undefined) return fallback;
  if (draftValue === null) return null;
  return typeof draftValue === 'number' && Number.isFinite(draftValue) ? draftValue : fallback;
};

const pickEnum = <T extends string>(draftValue: unknown, fallback: T | null): T | null => {
  if (draftValue === undefined) return fallback;
  if (draftValue === null) return null;
  return typeof draftValue === 'string' ? (draftValue as T) : fallback;
};

const pickStringList = (draftValue: unknown, fallback: string[] | null): string[] | null => {
  if (draftValue === undefined) return fallback;
  if (!Array.isArray(draftValue)) return fallback;
  const cleaned = draftValue
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);
  return cleaned.length > 0 ? cleaned : null;
};

export function buildSummaryPayloadFromDraft(
  dive: Dive,
  draftValues: SummaryDraftValues
): DiveSummaryPayload {
  const locationName = trimNullableString(draftValues.location) ?? dive.locations?.name ?? null;
  const locationCountry =
    trimNullableString(draftValues.country) ?? dive.locations?.country ?? null;

  return {
    id: dive.id,
    location: locationName,
    country: locationCountry,
    locations: {
      name: locationName,
      country: locationCountry,
    },
    date: typeof draftValues.date === 'string' ? draftValues.date : dive.date,
    depth: pickNumber(draftValues.depth, dive.depth),
    duration: pickNumber(draftValues.duration, dive.duration),
    water_temp: pickNumber(draftValues.water_temp, dive.water_temp),
    visibility: pickEnum(draftValues.visibility, dive.visibility),
    dive_type: pickEnum(draftValues.dive_type, dive.dive_type),
    water_type: pickEnum(draftValues.water_type, dive.water_type),
    exposure: pickEnum(draftValues.exposure, dive.exposure),
    currents: pickEnum(draftValues.currents, dive.currents),
    weight: pickNumber(draftValues.weight, dive.weight),
    gas: pickEnum(draftValues.gas, dive.gas),
    nitrox_percent: pickNumber(draftValues.nitrox_percent, dive.nitrox_percent),
    start_pressure: pickNumber(draftValues.start_pressure, dive.start_pressure),
    end_pressure: pickNumber(draftValues.end_pressure, dive.end_pressure),
    air_usage: pickNumber(draftValues.air_usage, dive.air_usage),
    equipment: pickStringList(draftValues.equipment, dive.equipment),
    wildlife: pickStringList(draftValues.wildlife, dive.wildlife),
    notes: draftValues.notes === undefined ? dive.notes : trimNullableString(draftValues.notes),
    cylinder_type: dive.cylinder_type,
    cylinder_size: dive.cylinder_size,
  };
}
