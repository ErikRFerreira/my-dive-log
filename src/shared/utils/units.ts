import type { UnitSystem } from '@/shared/constants';

export type UnitKind = 'depth' | 'temperature' | 'pressure' | 'weight';

const METERS_TO_FEET = 3.28084;
const BAR_TO_PSI = 14.5037738;
const KG_TO_LBS = 2.20462262;

export function getUnitLabel(kind: UnitKind, unitSystem: UnitSystem): string {
  switch (kind) {
    case 'depth':
      return unitSystem === 'imperial' ? 'ft' : 'm';
    case 'temperature':
      return unitSystem === 'imperial' ? '°F' : '°C';
    case 'pressure':
      return unitSystem === 'imperial' ? 'PSI' : 'bar';
    case 'weight':
      return unitSystem === 'imperial' ? 'lbs' : 'kg';
  }
}

function convertMetricToImperial(value: number, kind: UnitKind): number {
  switch (kind) {
    case 'depth':
      return value * METERS_TO_FEET;
    case 'temperature':
      return value * (9 / 5) + 32;
    case 'pressure':
      return value * BAR_TO_PSI;
    case 'weight':
      return value * KG_TO_LBS;
  }
}

function convertImperialToMetric(value: number, kind: UnitKind): number {
  switch (kind) {
    case 'depth':
      return value / METERS_TO_FEET;
    case 'temperature':
      return (value - 32) * (5 / 9);
    case 'pressure':
      return value / BAR_TO_PSI;
    case 'weight':
      return value / KG_TO_LBS;
  }
}

/**
 * Convert a numeric value between unit systems for a given measurement kind.
 *
 * Storage convention in this app: values are stored in metric (m, °C, bar, kg) and converted
 * only for display. When accepting user input in imperial units, convert back to metric before
 * writing to Supabase.
 */
export function convertValueBetweenSystems(
  value: number,
  kind: UnitKind,
  from: UnitSystem,
  to: UnitSystem
): number {
  if (from === to) return value;
  if (from === 'metric' && to === 'imperial') return convertMetricToImperial(value, kind);
  return convertImperialToMetric(value, kind);
}

/**
 * Convert a metric value to the requested unit system for display.
 * Prefer this for rendering stored data.
 */
export function convertValue(value: number, kind: UnitKind, unitSystem: UnitSystem): number {
  return convertValueBetweenSystems(value, kind, 'metric', unitSystem);
}

function defaultFractionDigits(kind: UnitKind, unitSystem: UnitSystem): number {
  if (kind === 'pressure') return 0;
  if (kind === 'temperature') return 0;
  if (kind === 'depth') return unitSystem === 'imperial' ? 0 : 0;
  if (kind === 'weight') return 0;
  return 0;
}

export function formatValue(
  value: number,
  kind: UnitKind,
  unitSystem: UnitSystem,
  options?: { fractionDigits?: number }
): string {
  const converted = convertValue(value, kind, unitSystem);
  const fractionDigits = options?.fractionDigits ?? defaultFractionDigits(kind, unitSystem);

  return converted.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatValueWithUnit(
  value: number,
  kind: UnitKind,
  unitSystem: UnitSystem,
  options?: { fractionDigits?: number }
): string {
  return `${formatValue(value, kind, unitSystem, options)} ${getUnitLabel(kind, unitSystem)}`;
}

