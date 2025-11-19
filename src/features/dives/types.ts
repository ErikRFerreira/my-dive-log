interface Dive {
  id: string;
  user_id: string; // from Supabase
  location: string;
  country: string | null;
  countryCode?: string; // client-only value (optional)
  date: string; // ISO string from Supabase
  depth: number;
  duration: number;
  notes: string | null;
  summary: string | null;
  created_at: string; // Supabase always returns this
}

export type { Dive };
