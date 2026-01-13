import type { Gas } from '@/features/dives/types';

export type V0Exposure = '' | '3mm' | '5mm' | '7mm' | 'semi-dry' | 'drysuit' | 'other';
export type V0GasMix = '' | Gas;

// LogDiveFormData now lives in schema.ts (derived from zod).
