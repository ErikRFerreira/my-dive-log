import type { DiveType } from '@/features/dives/types';
import type { V0Exposure, V0GasMix } from './types';

export const DIVE_TYPES: Array<{ value: DiveType; label: string; icon: string }> = [
  { value: 'cave', label: 'Cave', icon : 'cave' },
  { value: 'drift', label: 'Drift', icon: 'drift' },
  { value: 'lake-river', label: 'Lake/River', icon: 'lake-river'},
  { value: 'night', label: 'Night', icon: 'night'},
  { value: 'reef', label: 'Reef', icon: 'reef'},
  { value: 'training', label: 'Training', icon: 'training'},
  { value: 'wall', label: 'Wall', icon: 'wall' },
  { value: 'wreck', label: 'Wreck', icon: 'wreck' },
];

export const EXPOSURE_OPTIONS: Array<{ value: V0Exposure; label: string }> = [
  { value: '3mm', label: '3mm Wetsuit' },
  { value: '5mm', label: '5mm Wetsuit' },
  { value: '7mm', label: '7mm Wetsuit' },
  { value: 'semi-dry', label: 'Semi-Dry Suit' },
  { value: 'drysuit', label: 'Drysuit' },
  { value: 'other', label: 'Other' },
];

export const CYLINDER_TYPES = [
  { value: 'steel', label: 'Steel' },
  { value: 'aluminum', label: 'Aluminum' },
] as const;

export const CYLINDER_SIZES = [
  { value: '10L', label: '10L' },
  { value: '12L', label: '12L' },
  { value: '15L', label: '15L' },
  { value: 'other', label: 'Other' },
] as const;

export const GAS_OPTIONS: Array<{ value: V0GasMix; label: string }> = [
  { value: 'air', label: 'Air' },
  { value: 'nitrox', label: 'Nitrox' },
];

export const VISIBILITY_OPTIONS = [
  { value: 'poor', label: 'Poor' },
  { value: 'fair', label: 'Fair' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
] as const;

export const CURRENT_OPTIONS = [
  { value: 'calm', label: 'Calm' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'strong', label: 'Strong' },
] as const;
