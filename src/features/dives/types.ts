export type Visibility = 'poor' | 'fair' | 'good' | 'excellent';
export type DiveType = 'reef' | 'wreck' | 'wall' | 'cave' | 'drift' | 'night' | 'training';
export type WaterType = 'salt' | 'fresh';
export type Exposure = 'wet-2mm' | 'wet-3mm' | 'wet-5mm' | 'wet-7mm' | 'semi-dry' | 'dry';
export type Gas = 'air' | 'nitrox' | 'trimix';
export type Currents = 'calm' | 'mild' | 'moderate' | 'strong';

export interface Dive {
  id: string;
  user_id: string;
  date: string;
  location: string;
  country: string | null;
  country_code: string | null;
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
}

type NewDiveInput = {
  date: string;
  location: string;
  country: string | null;
  depth: number;
  duration: number;
  notes?: string | null;
};

export type { NewDiveInput };
