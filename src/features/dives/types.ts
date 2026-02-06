export type Visibility = 'poor' | 'fair' | 'good' | 'excellent';
export type DiveType =
  | 'reef'
  | 'wreck'
  | 'wall'
  | 'cave'
  | 'drift'
  | 'night'
  | 'training'
  | 'lake_river';
export type WaterType = 'salt' | 'fresh';
export type Exposure = 'wet-2mm' | 'wet-3mm' | 'wet-5mm' | 'wet-7mm' | 'semi-dry' | 'dry';
export type Gas = 'air' | 'nitrox';
export type Currents = 'calm' | 'mild' | 'moderate' | 'strong';
import type { Location as DiveLocation } from '../locations/types';

export interface Dive {
  id: string;
  user_id: string;
  location_id: string | null;
  date: string;
  depth: number;
  duration: number;
  notes: string | null;
  summary: string | null;
  created_at: string;
  water_temp: number | null;
  visibility: Visibility | null;
  start_pressure: number | null;
  end_pressure: number | null;
  air_usage: number | null;
  equipment: string[] | null;
  wildlife: string[] | null;
  dive_type: DiveType | null;
  water_type: WaterType | null;
  exposure: Exposure | null;
  gas: Gas | null;
  currents: Currents | null;
  weight: number | null;
  nitrox_percent: number | null;
  cylinder_type: string | null;
  cylinder_size: number | null;
  locations?: DiveLocation | null;
  cover_photo_path: string | null;
}

export type NewDiveInput = {
  date: string;
  locationName: string;
  locationCountry: string | null;
  locationCountryCode: string;
  depth: number;
  duration: number;
  notes?: string | null;
  water_temp?: number | null;
  visibility?: Visibility | null;
  start_pressure?: number | null;
  end_pressure?: number | null;
  air_usage?: number | null;
  equipment?: string[] | null;
  wildlife?: string[] | null;
  dive_type?: DiveType | null;
  water_type?: WaterType | null;
  exposure?: Exposure | null;
  gas?: Gas | null;
  currents?: Currents | null;
  weight?: number | null;
  nitrox_percent?: number | null;
  cylinder_type?: string | null;
  cylinder_size?: number | null;
};

export type UpdateDivePatch = Partial<Omit<Dive, 'id' | 'user_id' | 'created_at' | 'locations'>> & {
  locationName?: string;
  locationCountry?: string | null;
  locationCountryCode?: string | null;
};
