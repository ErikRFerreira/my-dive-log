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

export function convertValue(value: number, kind: UnitKind, unitSystem: UnitSystem): number {
  switch (kind) {
    case 'depth':
      return unitSystem === 'imperial' ? value * METERS_TO_FEET : value;
    case 'temperature':
      return unitSystem === 'imperial' ? value * (9 / 5) + 32 : value;
    case 'pressure':
      return unitSystem === 'imperial' ? value * BAR_TO_PSI : value;
    case 'weight':
      return unitSystem === 'imperial' ? value * KG_TO_LBS : value;
  }
}

function defaultFractionDigits(kind: UnitKind, unitSystem: UnitSystem): number {
  if (kind === 'pressure' && unitSystem === 'imperial') return 0;
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

