import type { Currents, DiveType, Gas, Visibility, WaterType } from '@/features/dives/types';

export type V0Exposure = '' | '3mm' | '5mm' | '7mm' | 'semi-dry' | 'drysuit' | 'other';
export type V0GasMix = '' | Gas | 'rebreather';

export type LogDiveFormData = {
  date: string;
  countryCode: string;
  location: string;
  maxDepth: string;
  duration: string;
  diveType: '' | DiveType;
  waterType: '' | WaterType;
  exposure: V0Exposure;
  currents: '' | Currents;
  weight: string;
  waterTemp: string;
  visibility: '' | Visibility;
  equipment: string[];
  wildlife: string[];
  notes: string;
  cylinderType: string;
  cylinderSize: string;
  gasMix: V0GasMix;
  startingPressure: string;
  endingPressure: string;
};

