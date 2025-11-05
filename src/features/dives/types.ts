interface Dive {
  id: string;
  userId: string;
  location: string;
  date: string;
  depth: number; // in meters
  duration: number; // in minutes
  notes?: string;
  summary?: string;
  createdAt?: string;
}

export type { Dive };
