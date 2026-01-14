/**
 * Utility functions for transforming and validating dive log form data.
 * 
 * This module handles the conversion of user-entered form data into the payload
 * format expected by the backend API, including unit conversions, data validation,
 * and type mappings.
 */

import type { NewDiveInput } from '@/features/dives';
import type { Exposure, Gas } from '@/features/dives/types';
import { convertValueBetweenSystems } from '@/shared/utils/units';
import { COUNTRIES } from '@/shared/data/countries';
import type { LogDiveFormData } from '../schema/schema';
import type { V0Exposure, V0GasMix } from './types';

/**
 * Parses a string into a finite number or returns null if invalid.
 * 
 * @param raw - The string to parse
 * @returns The parsed number if valid and finite, otherwise null
 * 
 * @example
 * parseFiniteNumber("42.5") // 42.5
 * parseFiniteNumber("  ") // null
 * parseFiniteNumber("abc") // null
 * parseFiniteNumber("Infinity") // null
 */
export function parseFiniteNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/**
 * Maps form exposure values (V0 format) to the database exposure type.
 * 
 * @param exposure - The exposure value from the form
 * @returns The mapped exposure type for the database, or null if not specified
 * 
 * @example
 * mapExposure("3mm") // "wet-3mm"
 * mapExposure("drysuit") // "dry"
 * mapExposure("other") // null
 */
export function mapExposure(exposure: V0Exposure): Exposure | null {
  switch (exposure) {
    case '3mm':
      return 'wet-3mm';
    case '5mm':
      return 'wet-5mm';
    case '7mm':
      return 'wet-7mm';
    case 'semi-dry':
      return 'semi-dry';
    case 'drysuit':
      return 'dry';
    case 'other':
    case '':
      return null;
  }
}

/**
 * Maps form gas mix values (V0 format) to the database gas type.
 * 
 * @param gasMix - The gas mix value from the form
 * @returns The mapped gas type for the database, or null if empty
 */
export function mapGas(gasMix: V0GasMix): Gas | null {
  if (gasMix === '') return null;
  return gasMix;
}

/**
 * Parses a cylinder size string into a numeric size and unit.
 * 
 * Expects format like "12l" or "80cuft". Returns null values if the format
 * is invalid, empty, or "other".
 * 
 * @param value - The cylinder size string to parse (e.g., "12l", "80cuft")
 * @returns An object containing the numeric size and unit, or nulls if invalid
 * 
 * @example
 * parseCylinderSize("12l") // { size: 12, unit: "l" }
 * parseCylinderSize("80cuft") // { size: 80, unit: "cuft" }
 * parseCylinderSize("other") // { size: null, unit: null }
 * parseCylinderSize("invalid") // { size: null, unit: null }
 */
function parseCylinderSize(value: string): { size: number | null; unit: 'l' | 'cuft' | null } {
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'other') return { size: null, unit: null };

  const match = trimmed.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
  if (!match) return { size: null, unit: null };

  const size = Number(match[1]);
  if (!Number.isFinite(size)) return { size: null, unit: null };

  const unitRaw = match[2].toLowerCase();
  const unit = unitRaw === 'l' ? 'l' : unitRaw === 'cuft' ? 'cuft' : null;
  return { size, unit };
}

/**
 * Transforms dive log form data into the payload format expected by the API.
 * 
 * This function performs the following operations:
 * - Validates country selection
 * - Parses and validates required numeric fields (depth, duration)
 * - Converts all measurements to metric units for storage
 * - Parses optional numeric fields (pressure, temperature, weight)
 * - Calculates air usage from start and end pressure
 * - Maps exposure and gas types to database format
 * - Processes equipment and wildlife arrays
 * - Aggregates notes with additional technical details
 * - Parses cylinder size information
 * 
 * @param args - Object containing the form data
 * @param args.formData - The validated form data from the dive log form
 * @returns Object containing the payload for the API and an optional blocking error message
 * 
 * @example
 * const result = buildNewDivePayload({ formData });
 * if (result.blockingError) {
 *   // Handle validation error
 * } else {
 *   // Submit result.payload to API
 * }
 */
export function buildNewDivePayload(args: {
  formData: LogDiveFormData;
}): { payload: NewDiveInput; blockingError?: string } {
  const { formData } = args;

  // Validate country selection
  const country = formData.countryCode
    ? COUNTRIES.find((c) => c.code.toUpperCase() === formData.countryCode.toUpperCase())
    : undefined;
  if (!country) return { payload: {} as NewDiveInput, blockingError: 'Please select a country.' };

  // Parse and validate required depth and duration
  const depthEntered = parseFiniteNumber(formData.maxDepth);
  const durationEntered = parseFiniteNumber(formData.duration);
  if (depthEntered === null || durationEntered === null) {
    return { payload: {} as NewDiveInput, blockingError: 'Depth and duration must be valid numbers.' };
  }

  // Convert depth to metric (meters) and round duration
  const depth = convertValueBetweenSystems(depthEntered, 'depth', formData.depthUnit, 'metric');
  const duration = Math.round(durationEntered);

  // Parse and convert pressure values, calculate air usage
  const startPressureEntered = parseFiniteNumber(formData.startingPressure);
  const endPressureEntered = parseFiniteNumber(formData.endingPressure);
  const start_pressure =
    startPressureEntered === null
      ? null
      : convertValueBetweenSystems(
          startPressureEntered,
          'pressure',
          formData.pressureUnit,
          'metric'
        );
  const end_pressure =
    endPressureEntered === null
      ? null
      : convertValueBetweenSystems(
          endPressureEntered,
          'pressure',
          formData.pressureUnit,
          'metric'
        );
  const air_usage =
    start_pressure !== null && end_pressure !== null ? Math.max(0, start_pressure - end_pressure) : null;

  // Parse and convert water temperature
  const waterTempEntered = parseFiniteNumber(formData.waterTemp);
  const water_temp =
    waterTempEntered === null
      ? null
      : convertValueBetweenSystems(
          waterTempEntered,
          'temperature',
          formData.temperatureUnit,
          'metric'
        );

  // Parse and convert weight
  const weightEntered = parseFiniteNumber(formData.weight);
  const weight =
    weightEntered === null
      ? null
      : convertValueBetweenSystems(weightEntered, 'weight', formData.weightUnit, 'metric');

  // Process equipment and wildlife lists
  const equipment = formData.equipment.map((s) => s.trim()).filter(Boolean);
  const wildlife = formData.wildlife.map((s) => s.trim()).filter(Boolean);

  // Aggregate notes with technical details
  const extraNoteLines: string[] = [];
  if (formData.cylinderType) extraNoteLines.push(`Cylinder type: ${formData.cylinderType}`);
  if (formData.cylinderSize) extraNoteLines.push(`Cylinder size: ${formData.cylinderSize}`);
  if (formData.gasMix === 'nitrox') {
    extraNoteLines.push(`Nitrox O2: ${formData.nitroxPercent}%`);
  }

  const notesParts = [formData.notes.trim(), extraNoteLines.join('\n')].filter(Boolean);
  const notes = notesParts.length ? notesParts.join('\n\n') : null;

  // Map exposure and gas types
  const exposure = mapExposure(formData.exposure);
  const gas = mapGas(formData.gasMix);
  const { size: cylinder_size, unit: cylinder_size_unit } = parseCylinderSize(formData.cylinderSize);
  
  // Determine unit types for storage
  const depth_unit = formData.depthUnit === 'imperial' ? 'ft' : 'm';
  const weight_unit = formData.weightUnit === 'imperial' ? 'lb' : 'kg';
  const temperature_unit = formData.temperatureUnit === 'imperial' ? 'f' : 'c';
  const pressure_unit = formData.pressureUnit === 'imperial' ? 'psi' : 'bar';
  const gas_mix = formData.gasMix || null;
  const nitrox_percent = formData.gasMix === 'nitrox' ? formData.nitroxPercent : null;

  return {
    payload: {
      date: formData.date,
      locationName: formData.location,
      locationCountry: country.name,
      locationCountryCode: country.code.toUpperCase(),
      depth,
      depth_unit,
      duration,
      notes,
      water_temp,
      temperature_unit,
      visibility: formData.visibility || null,
      start_pressure,
      end_pressure,
      air_usage,
      pressure_unit,
      equipment: equipment.length ? equipment : null,
      wildlife: wildlife.length ? wildlife : null,
      dive_type: formData.diveType || null,
      water_type: formData.waterType || null,
      exposure,
      gas,
      gas_mix,
      nitrox_percent,
      currents: formData.currents || null,
      weight,
      weight_unit,
      cylinder_type: formData.cylinderType || null,
      cylinder_size,
      cylinder_size_unit,
    },
  };
}
