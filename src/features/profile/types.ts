interface UserProfile {
  id: string;
  agency: string | null;
  avatar_path: string | null;
  bio: string | null;
  cert_level: string | null;
  created_at: string;
}

export type { UserProfile };
