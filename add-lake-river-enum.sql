-- Add lake_river value to dive_type_enum
ALTER TYPE public.dive_type_enum ADD VALUE IF NOT EXISTS 'lake_river';
