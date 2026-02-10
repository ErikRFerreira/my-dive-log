/**
 * Pagination and UI constants used throughout the application
 */

// Pagination
export const ITEMS_PER_PAGE = 9;
export const PAGINATION_ELLIPSIS_THRESHOLD = 7; // Show ellipsis if more than this many pages

// Unit systems
export type UnitSystem = 'metric' | 'imperial';

// Shared value limits
export const DURATION_LIMIT = 200;
export const TAG_LIST_LIMIT = 20;
export const TAG_ITEM_LIMIT = 40;
export const WATER_TEMP_LIMITS = {
  metric: { min: -2, max: 40 },
  imperial: { min: 28, max: 104 },
} as const;
export const NITROX_CONFIG = {
  MIN_O2_PERCENT: 21,
  MAX_O2_PERCENT: 100,
  DEFAULT_NITROX: 32,
} as const;

// Filter defaults
export const DEFAULT_MAX_DEPTH = 50;
export const MIN_DEPTH_FILTER = 1;
export const MAX_DEPTH_FILTER = 50;
export const MIN_SEARCH_LENGTH = 4;

// Debounce delays (in milliseconds)
export const DEBOUNCE_DELAY = 500;

// Dive certification levels
export const CERTIFICATION_LEVELS = [
  'Open Water Diver',
  'Advanced Open Water Diver',
  'Master Scuba Diver',
  'Rescue Diver',
  'Divemaster',
  'Instructor',
  'Specialty Diver',
  'Tec 40',
  'Tec 45',
  'Tec 50',
  'Tec Instructor',
  'Trimix Diver',
  'Trimix Instructor',
  'CCR Diver',
  'CCR Instructor',
  'Other',
] as const;

// Certifying agencies
export const CERTIFYING_AGENCIES = [
  'PADI',
  'SSI',
  'NAUI',
  'RAID',
  'SDI',
  'TDI',
  'IANTD',
  'CMAS',
  'BSAC',
  'GUE',
  'Other',
] as const;

// Persistent storage keys
export const STORAGE_KEYS = {
  settings: 'dive-log:settings',
  diveFilter: 'dive-log:dive-filter',
} as const;
