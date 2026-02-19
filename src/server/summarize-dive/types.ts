export type DiveLocationPayload = {
  name?: string | null;
  country?: string | null;
};

export type DivePayload = {
  location?: string | null;
  country?: string | null;
  locationName?: string | null;
  locationCountry?: string | null;
  locations?: DiveLocationPayload | null;
  date?: string | null;
  depth?: number | null;
  duration?: number | null;
  water_temp?: number | null;
  visibility?: string | null;
  dive_type?: string | null;
  water_type?: string | null;
  exposure?: string | null;
  currents?: string | null;
  weight?: number | null;
  gas?: string | null;
  nitrox_percent?: number | null;
  start_pressure?: number | null;
  end_pressure?: number | null;
  air_usage?: number | null;
  cylinder_type?: string | null;
  cylinder_size?: number | null;
  equipment?: string[] | null;
  wildlife?: string[] | null;
  notes?: string | null;
};

export type NormalizedDiveContext = {
  location: string;
  country: string | null;
  date: string;
  depth: number | null;
  duration: number | null;
  waterTemp: number | null;
  visibility: string | null;
  diveType: string | null;
  waterType: string | null;
  exposure: string | null;
  currents: string | null;
  weight: number | null;
  gas: string | null;
  startPressure: number | null;
  endPressure: number | null;
  airUsage: number | null;
  cylinderType: string | null;
  cylinderSize: number | null;
  equipment: string[] | null;
  wildlife: string[] | null;
  notes: string;
};

export type ModelSummaryResponse = {
  summary?: unknown;
  similar_locations?: unknown;
  tips?: unknown;
  future_practice?: unknown;
};
