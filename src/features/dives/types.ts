interface Dive {
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
  visibility: number | null;
  ai_summary: string | null;
  conditions: string | null;
  wave_height: string | null;
  start_pressure: number | null;
  end_pressure: number | null;
  air_usage: number | null;
  equipment: string[] | null;
  wildlife: string[] | null;
}

type NewDiveInput = {
  date: string;
  location: string;
  country: string | null;
  depth: number;
  duration: number;
  notes?: string | null;
};

export type { Dive, NewDiveInput };
