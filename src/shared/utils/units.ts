/**
 * Utility functions for unit conversion and formatting.
 * 
 * This module handles conversions between metric and imperial unit systems
 * for dive-related measurements. All values are stored in metric units
 * (meters, Celsius, bar, kilograms) and converted for display as needed.
 */

import type { UnitSystem } from '@/shared/constants';

/** Supported measurement types for unit conversion */
export type UnitKind = 'depth' | 'temperature' | 'pressure' | 'weight';

/** Conversion factor: meters to feet */
const METERS_TO_FEET = 3.28084;
/** Conversion factor: bar to PSI */
const BAR_TO_PSI = 14.5037738;
/** Conversion factor: kilograms to pounds */
const KG_TO_LBS = 2.20462262;

/**
 * Returns the appropriate unit label for a measurement type and system.
 * 
 * @param kind - The type of measurement (depth, temperature, pressure, weight)
 * @param unitSystem - The unit system ('metric' or 'imperial')
 * @returns The unit label string (e.g., 'm', 'ft', '°C', '°F')
 * 
 * @example
 * getUnitLabel('depth', 'metric') // 'm'
 * getUnitLabel('depth', 'imperial') // 'ft'
 */
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

/**
 * Converts a metric value to its imperial equivalent.
 * 
 * @param value - The numeric value in metric units
 * @param kind - The type of measurement being converted
 * @returns The converted value in imperial units
 * 
 * @internal
 */
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

/**
 * Converts an imperial value to its metric equivalent.
 * 
 * @param value - The numeric value in imperial units
 * @param kind - The type of measurement being converted
 * @returns The converted value in metric units
 * 
 * @internal
 */
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
 * Converts a numeric value between unit systems for a given measurement kind.
 *
 * Storage convention: Values are stored in metric (m, °C, bar, kg) and converted
 * only for display. When accepting user input in imperial units, convert back to
 * metric before storing in the database.
 * 
 * @param value - The numeric value to convert
 * @param kind - The type of measurement (depth, temperature, pressure, weight)
 * @param from - The source unit system
 * @param to - The target unit system
 * @returns The converted value in the target unit system
 * 
 * @example
 * // Convert 10 meters to feet
 * convertValueBetweenSystems(10, 'depth', 'metric', 'imperial') // 32.8084
 * 
 * // Convert 50°F to Celsius
 * convertValueBetweenSystems(50, 'temperature', 'imperial', 'metric') // 10
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
 * Converts a metric value to the requested unit system for display.
 * 
 * This is a convenience wrapper around convertValueBetweenSystems that assumes
 * the source is always metric. Prefer this function when rendering stored data.
 * 
 * @param value - The numeric value in metric units
 * @param kind - The type of measurement (depth, temperature, pressure, weight)
 * @param unitSystem - The target unit system for display
 * @returns The converted value
 * 
 * @example
 * // Display stored depth (in meters) in user's preferred units
 * convertValue(30, 'depth', userSettings.unitSystem)
 */
export function convertValue(value: number, kind: UnitKind, unitSystem: UnitSystem): number {
  return convertValueBetweenSystems(value, kind, 'metric', unitSystem);
}

/**
 * Returns the default number of decimal places for a measurement type.
 * 
 * Currently all measurements default to 0 decimal places (whole numbers).
 * 
 * @param kind - The type of measurement
 * @param unitSystem - The unit system being used
 * @returns The number of decimal places to display
 * 
 * @internal
 */
function defaultFractionDigits(kind: UnitKind, unitSystem: UnitSystem): number {
  if (kind === 'pressure') return 0;
  if (kind === 'temperature') return 0;
  if (kind === 'depth') return unitSystem === 'imperial' ? 0 : 0;
  if (kind === 'weight') return 0;
  return 0;
}

/**
 * Formats a metric value for display in the specified unit system.
 * 
 * Converts the value to the target unit system and formats it with
 * appropriate decimal places and locale-specific number formatting.
 * 
 * @param value - The numeric value in metric units
 * @param kind - The type of measurement
 * @param unitSystem - The target unit system for display
 * @param options - Optional formatting configuration
 * @param options.fractionDigits - Number of decimal places (overrides default)
 * @returns Formatted number string without units
 * 
 * @example
 * formatValue(30.5, 'depth', 'metric') // "31"
 * formatValue(30.5, 'depth', 'metric', { fractionDigits: 1 }) // "30.5"
 */
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

/**
 * Formats a metric value with its unit label for display.
 * 
 * Combines formatValue() with getUnitLabel() to provide a complete
 * formatted string including the unit.
 * 
 * @param value - The numeric value in metric units
 * @param kind - The type of measurement
 * @param unitSystem - The target unit system for display
 * @param options - Optional formatting configuration
 * @param options.fractionDigits - Number of decimal places (overrides default)
 * @returns Formatted string with value and unit (e.g., "30 m", "98 ft")
 * 
 * @example
 * formatValueWithUnit(30, 'depth', 'metric') // "30 m"
 * formatValueWithUnit(30, 'depth', 'imperial') // "98 ft"
 * formatValueWithUnit(20, 'temperature', 'metric') // "20 °C"
 */
export function formatValueWithUnit(
  value: number,
  kind: UnitKind,
  unitSystem: UnitSystem,
  options?: { fractionDigits?: number }
): string {
  return `${formatValue(value, kind, unitSystem, options)} ${getUnitLabel(kind, unitSystem)}`;
}

