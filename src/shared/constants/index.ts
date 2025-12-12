/**
 * Pagination and UI constants used throughout the application
 */

// Pagination
export const ITEMS_PER_PAGE = 5;
export const PAGINATION_ELLIPSIS_THRESHOLD = 7; // Show ellipsis if more than this many pages

// Filter defaults
export const DEFAULT_MAX_DEPTH = 50;
export const MIN_DEPTH_FILTER = 15;
export const MAX_DEPTH_FILTER = 50;

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

