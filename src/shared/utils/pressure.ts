/**
 * Utilities for handling scuba diving cylinder pressure values.
 * 
 * This module provides functions for:
 * - Parsing and validating pressure inputs
 * - Clamping pressure values to valid ranges
 * - Generating color-coded visual feedback for pressure levels
 * - Creating CSS gradients for pressure sliders
 */

/**
 * Pressure measurement unit system.
 * - metric: bar (standard in most of the world)
 * - imperial: psi (pounds per square inch, used primarily in North America)
 */
type PressureUnit = 'metric' | 'imperial';

/**
 * Coerces an unknown value to a valid pressure number within constraints.
 * 
 * Attempts to parse the input and clamp it to the specified range.
 * Returns 0 if the value cannot be parsed.
 * 
 * @param value - The value to coerce (string, number, or other)
 * @param maxValue - Maximum allowed pressure value
 * @param step - Step size for rounding (e.g., 10 for bar, 100 for psi)
 * @returns A valid pressure value between 0 and maxValue, rounded to step, or 0 if invalid
 * 
 * @example
 * coercePressureValue("150", 200, 10) // 150
 * coercePressureValue("abc", 200, 10) // 0
 * coercePressureValue(250, 200, 10) // 200 (clamped to max)
 */
export function coercePressureValue(value: unknown, maxValue: number, step: number) {
  const parsed = parsePressureInput(value);
  if (parsed !== null) return clampPressure(parsed, maxValue, step);
  return 0;
}

/**
 * Clamps a pressure value to a valid range and rounds to the nearest step.
 * 
 * Ensures the value is:
 * - At least 0 (no negative pressure)
 * - At most maxValue
 * - Rounded to the nearest step increment
 * 
 * @param value - The pressure value to clamp
 * @param maxValue - Maximum allowed pressure
 * @param step - Step size for rounding
 * @returns Clamped and rounded pressure value
 * 
 * @example
 * clampPressure(155, 200, 10) // 160 (rounded up to nearest 10)
 * clampPressure(-5, 200, 10) // 0 (clamped to minimum)
 * clampPressure(250, 200, 10) // 200 (clamped to maximum)
 */
export function clampPressure(value: number, maxValue: number, step: number) {
  return Math.max(0, Math.min(maxValue, Math.round(value / step) * step));
}

/**
 * Parses pressure input from various types to a number.
 * 
 * Accepts:
 * - Numbers: Returns if finite
 * - Strings: Attempts to parse, returns if valid
 * - Other: Returns null
 * 
 * @param value - The value to parse (can be number, string, or any type)
 * @returns The parsed pressure as a number, or null if invalid/unparseable
 * 
 * @example
 * parsePressureInput(150) // 150
 * parsePressureInput("150") // 150
 * parsePressureInput("150.5") // 150.5
 * parsePressureInput("") // null
 * parsePressureInput("abc") // null
 * parsePressureInput(Infinity) // null
 */
export function parsePressureInput(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

/**
 * Determines the color for a pressure value based on safety thresholds.
 * 
 * Color coding:
 * - Red (#ef4444): <= 50 bar / 725 psi (low - surface immediately)
 * - Orange (#f97316): <= 70 bar / 1015 psi (reserve - begin ascent)
 * - Teal (#0ea5a4): > 70 bar / 1015 psi (safe)
 * 
 * These thresholds align with recreational diving safety practices.
 * 
 * @param value - The pressure value to color-code
 * @param unit - The unit system (metric=bar, imperial=psi)
 * @returns Hex color code for the pressure level
 * 
 * @example
 * pressureColor(40, 'metric') // '#ef4444' (red - low)
 * pressureColor(60, 'metric') // '#f97316' (orange - reserve)
 * pressureColor(150, 'metric') // '#0ea5a4' (teal - safe)
 */
export function pressureColor(value: number, unit: PressureUnit) {
  // Conversion factor: 1 bar = 14.5038 psi
  const barToPsi = 14.5038;
  const low = unit === 'metric' ? 50 : 50 * barToPsi;
  const warn = unit === 'metric' ? 70 : 70 * barToPsi;
  if (value <= low) return '#ef4444';
  if (value <= warn) return '#f97316';
  return '#0ea5a4';
}

/**
 * Generates a CSS linear gradient for a pressure slider track.
 * 
 * Creates a filled gradient from left to right, where:
 * - Left portion: Filled with pressure-level color (red/orange/teal)
 * - Right portion: Dark gray background
 * 
 * The gradient provides visual feedback on current pressure level.
 * 
 * @param value - Current pressure value
 * @param maxValue - Maximum pressure value (for percentage calculation)
 * @param unit - Unit system (affects color thresholds)
 * @returns CSS gradient string for use in style attribute
 * 
 * @example
 * sliderTrack(100, 200, 'metric')
 * // Returns: 'linear-gradient(to right, #0ea5a4 0%, #0ea5a4 50%, #1f2937 50%, #1f2937 100%)'
 */
export function sliderTrack(value: number, maxValue: number, unit: PressureUnit) {
  const percent = (value / maxValue) * 100;
  const color = pressureColor(value, unit);
  const base = '#1f2937';
  return `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, ${base} ${percent}%, ${base} 100%)`;
}

/**
 * Generates a CSS linear gradient for a nitrox oxygen percentage slider.
 * 
 * Creates a gradient showing oxygen enrichment above air (21%):
 * - 21% O2 = 0% fill (normal air)
 * - 100% O2 = 100% fill (pure oxygen)
 * 
 * The scale is normalized to show enrichment above air level.
 * 
 * @param value - Oxygen percentage (21-100)
 * @returns CSS gradient string for use in style attribute
 * 
 * @example
 * nitroxTrack(32) // ~14% fill (EAN32 - common nitrox mix)
 * nitroxTrack(21) // 0% fill (air)
 * nitroxTrack(100) // 100% fill (pure O2)
 */
export function nitroxTrack(value: number) {
  // Normalize O2% from air (21%) to pure O2 (100%) for slider fill percentage
  const percent = ((value - 21) / (100 - 21)) * 100;
  const color = '#0ea5a4';
  const base = '#1f2937';
  return `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, ${base} ${percent}%, ${base} 100%)`;
}

/**
 * Generates a CSS linear gradient for a depth filter slider.
 * 
 * Creates a gradient showing the selected depth range:
 * - Left portion: Filled with primary/cyan color
 * - Right portion: Muted gray background
 * 
 * @param value - Current depth filter value
 * @param minValue - Minimum depth value
 * @param maxValue - Maximum depth value
 * @returns CSS gradient string for use in style attribute
 * 
 * @example
 * depthFilterTrack(25, 1, 50) // 50% fill
 * depthFilterTrack(1, 1, 50) // 0% fill
 * depthFilterTrack(50, 1, 50) // 100% fill
 */
export function depthFilterTrack(value: number, minValue: number, maxValue: number) {
  const range = maxValue - minValue;
  const percent = range > 0 ? ((value - minValue) / range) * 100 : 0;
  const color = '#00d9ff'; // Primary blue color
  const base = '#e5e7eb'; // Light gray
  return `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, ${base} ${percent}%, ${base} 100%)`;
}