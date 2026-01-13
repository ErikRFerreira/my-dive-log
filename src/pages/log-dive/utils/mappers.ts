import type { NewDiveInput } from '@/features/dives';
import type { Exposure, Gas } from '@/features/dives/types';
import { convertValueBetweenSystems } from '@/shared/utils/units';
import { COUNTRIES } from '@/shared/data/countries';
import type { LogDiveFormData } from '../schema/schema';
import type { V0Exposure, V0GasMix } from './types';

export function parseFiniteNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

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

export function mapGas(gasMix: V0GasMix): Gas | null {
  if (gasMix === '') return null;
  return gasMix;
}

export function buildNewDivePayload(args: {
  formData: LogDiveFormData;
}): { payload: NewDiveInput; blockingError?: string } {
  const { formData } = args;

  const country = formData.countryCode
    ? COUNTRIES.find((c) => c.code.toUpperCase() === formData.countryCode.toUpperCase())
    : undefined;
  if (!country) return { payload: {} as NewDiveInput, blockingError: 'Please select a country.' };

  const depthEntered = parseFiniteNumber(formData.maxDepth);
  const durationEntered = parseFiniteNumber(formData.duration);
  if (depthEntered === null || durationEntered === null) {
    return { payload: {} as NewDiveInput, blockingError: 'Depth and duration must be valid numbers.' };
  }

  const depth = convertValueBetweenSystems(depthEntered, 'depth', formData.depthUnit, 'metric');
  const duration = Math.round(durationEntered);

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

  const weightEntered = parseFiniteNumber(formData.weight);
  const weight =
    weightEntered === null
      ? null
      : convertValueBetweenSystems(weightEntered, 'weight', formData.weightUnit, 'metric');

  const equipment = formData.equipment.map((s) => s.trim()).filter(Boolean);
  const wildlife = formData.wildlife.map((s) => s.trim()).filter(Boolean);

  const extraNoteLines: string[] = [];
  if (formData.cylinderType) extraNoteLines.push(`Cylinder type: ${formData.cylinderType}`);
  if (formData.cylinderSize) extraNoteLines.push(`Cylinder size: ${formData.cylinderSize}`);
  if (formData.gasMix === 'nitrox') {
    extraNoteLines.push(`Nitrox O2: ${formData.nitroxPercent}%`);
  }

  const notesParts = [formData.notes.trim(), extraNoteLines.join('\n')].filter(Boolean);
  const notes = notesParts.length ? notesParts.join('\n\n') : null;

  const exposure = mapExposure(formData.exposure);
  const gas = mapGas(formData.gasMix);

  return {
    payload: {
      date: formData.date,
      locationName: formData.location,
      locationCountry: country.name,
      locationCountryCode: country.code.toUpperCase(),
      depth,
      duration,
      notes,
      water_temp,
      visibility: formData.visibility || null,
      start_pressure,
      end_pressure,
      air_usage,
      equipment: equipment.length ? equipment : null,
      wildlife: wildlife.length ? wildlife : null,
      dive_type: formData.diveType || null,
      water_type: formData.waterType || null,
      exposure,
      gas,
      currents: formData.currents || null,
      weight,
    },
  };
}
