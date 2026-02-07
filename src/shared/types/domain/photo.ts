export type DivePhoto = {
  id: string;
  dive_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
  url: string;
};
