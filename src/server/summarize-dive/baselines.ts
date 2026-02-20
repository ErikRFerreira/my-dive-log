import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  BaselinesBundle,
  DivePayload,
  GlobalBaseline,
  LocationBaseline,
  RecentBaseline,
} from './types.js';

const GLOBAL_BASELINE_MIN = 5;
const LOCATION_BASELINE_MIN = 3;
const RECENT_BASELINE_MIN = 3;

type BaselineRpcRow = {
  sample_size?: number | string | null;
  avg_depth?: number | string | null;
  avg_duration?: number | string | null;
  avg_rmv?: number | string | null;
  max_date?: string | null;
};

type BaselineScope = 'global' | 'location' | 'recent';

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function createEmptyBaselinesBundle(): BaselinesBundle {
  return {
    global: null,
    location: null,
    recent: null,
    availability: {
      hasGlobalBaseline: false,
      hasLocationBaseline: false,
      hasRecentBaseline: false,
    },
  };
}

function normalizeLocationString(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .slice(0, 120);
  return cleaned || null;
}

export function buildLocationKey(dive: DivePayload): string | null {
  const rawLocationId = typeof dive.location_id === 'string' ? dive.location_id.trim() : '';
  if (rawLocationId) return rawLocationId;

  const nameKey =
    dive.location ??
    dive.locationName ??
    (typeof dive.locations === 'object' ? dive.locations?.name : null) ??
    null;
  return normalizeLocationString(nameKey);
}

async function fetchBaselineScope(options: {
  supabase: SupabaseClient;
  userId: string;
  locationKey: string | null;
  scope: BaselineScope;
  windowDays?: 30 | 90;
}): Promise<BaselineRpcRow | null> {
  const { supabase, userId, locationKey, scope, windowDays } = options;

  if (scope === 'location' && !locationKey) {
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('get_dive_baseline', {
      _user: userId,
      _location: scope === 'location' ? locationKey : null,
      _window_days: scope === 'recent' ? windowDays : null,
    });

    if (error) {
      console.warn('Unable to fetch dive baseline via RPC:', error.message);
      return null;
    }

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    return (data[0] ?? null) as BaselineRpcRow | null;
  } catch (error) {
    console.warn('Baseline RPC failed; continuing without baseline for scope:', scope, error);
    return null;
  }
}

function rowToBaseline(options: {
  row: BaselineRpcRow | null;
  scope: BaselineScope;
  locationKey: string | null;
  windowDays?: 30 | 90;
}): GlobalBaseline | LocationBaseline | RecentBaseline | null {
  const { row, scope, locationKey, windowDays } = options;
  if (!row) return null;

  const sampleSize = toNumberOrNull(row.sample_size);
  if (!sampleSize || sampleSize <= 0) return null;

  const avgDepth = toNumberOrNull(row.avg_depth);
  const avgDuration = toNumberOrNull(row.avg_duration);
  const avgRMV = toNumberOrNull(row.avg_rmv);
  const lastDiveDate = typeof row.max_date === 'string' ? row.max_date : null;

  if (scope === 'global') {
    return {
      scope: 'global',
      sampleSize,
      avgDepth,
      avgDuration,
      avgRMV,
      lastDiveDate,
    };
  }

  if (scope === 'location') {
    if (!locationKey) return null;
    return {
      scope: 'location',
      sampleSize,
      avgDepth,
      avgDuration,
      avgRMV,
      lastDiveDate,
      locationKey,
    };
  }

  const normalizedWindow = windowDays === 90 ? 90 : 30;
  return {
    scope: 'recent',
    sampleSize,
    avgDepth,
    avgDuration,
    avgRMV,
    lastDiveDate,
    windowDays: normalizedWindow,
  };
}

export async function fetchBaselines(params: {
  supabase: SupabaseClient;
  userId: string;
  locationKey: string | null;
  nowDate?: Date;
}): Promise<BaselinesBundle> {
  const { supabase, userId, locationKey } = params;

  const [globalRow, locationRow, recent30Row] = await Promise.all([
    fetchBaselineScope({ supabase, userId, locationKey, scope: 'global' }),
    fetchBaselineScope({ supabase, userId, locationKey, scope: 'location' }),
    fetchBaselineScope({ supabase, userId, locationKey, scope: 'recent', windowDays: 30 }),
  ]);

  const global = rowToBaseline({
    row: globalRow,
    scope: 'global',
    locationKey,
  }) as GlobalBaseline | null;
  const location = rowToBaseline({
    row: locationRow,
    scope: 'location',
    locationKey,
  }) as LocationBaseline | null;

  let recent = rowToBaseline({
    row: recent30Row,
    scope: 'recent',
    locationKey,
    windowDays: 30,
  }) as RecentBaseline | null;

  if (!recent) {
    const recent90Row = await fetchBaselineScope({
      supabase,
      userId,
      locationKey,
      scope: 'recent',
      windowDays: 90,
    });
    recent = rowToBaseline({
      row: recent90Row,
      scope: 'recent',
      locationKey,
      windowDays: 90,
    }) as RecentBaseline | null;
  }

  const availability = {
    hasGlobalBaseline: Boolean(global && global.sampleSize >= GLOBAL_BASELINE_MIN),
    hasLocationBaseline: Boolean(location && location.sampleSize >= LOCATION_BASELINE_MIN),
    hasRecentBaseline: Boolean(recent && recent.sampleSize >= RECENT_BASELINE_MIN),
  };

  return {
    global: availability.hasGlobalBaseline ? global : null,
    location: availability.hasLocationBaseline ? location : null,
    recent: availability.hasRecentBaseline ? recent : null,
    availability,
  };
}
