/**
 * Utility functions for calculating dive statistics.
 *
 * These helpers aggregate derived values used by dashboards and profile views,
 * such as totals, averages, and recency metrics.
 */

import type { Dive } from '@/features/dives/types';

/**
 * Returns the count of unique location ids across dives.
 *
 * @param dives - List of dives to aggregate
 * @returns Count of unique location ids
 *
 * @example
 * getTotalLocations(dives) // 4
 */
export function getTotalLocations(dives: Dive[]): number {
  const ids = dives.map((dive) => dive.locations?.id).filter((id): id is string => !!id);
  return new Set(ids).size;
}

/**
 * Returns the most frequent location display string, or empty string if none.
 *
 * Uses the location id when present, otherwise falls back to a name/country key.
 *
 * @param dives - List of dives to aggregate
 * @returns Display string for the most frequent location, or empty string
 *
 * @example
 * getFavoriteLocation(dives) // "Blue Hole, Belize"
 */
export function getFavoriteLocation(dives: Dive[]): string {
  const counts = new Map<string, number>();
  const displayByKey = new Map<string, string>();
  let favoriteLocation = '';
  let maxCount = 0;

  dives.forEach((dive) => {
    const id = dive.locations?.id;
    const name = dive.locations?.name;
    const country = dive.locations?.country;

    if (!name) return;

    const key = id ?? `${name}-${country ?? ''}`;
    const nextCount = (counts.get(key) ?? 0) + 1;
    counts.set(key, nextCount);
    displayByKey.set(key, country ? `${name}, ${country}` : name);

    if (nextCount > maxCount) {
      maxCount = nextCount;
      favoriteLocation = displayByKey.get(key) ?? '';
    }
  });

  return favoriteLocation;
}

/**
 * Returns the number of dives whose date falls within the current month/year.
 *
 * @param dives - List of dives to evaluate
 * @returns Count of dives in the current month
 *
 * @example
 * getTotalDivesThisMonth(dives) // 2
 */
export function getTotalDivesThisMonth(dives: Dive[]): number {
  return dives.filter((dive) => {
    const diveDate = new Date(dive.date);
    const now = new Date();
    return diveDate.getMonth() === now.getMonth() && diveDate.getFullYear() === now.getFullYear();
  }).length;
}

/**
 * Returns the deepest dive depth and its display location label.
 *
 * @param dives - List of dives to evaluate
 * @returns Deepest dive depth and location label (or "N/A" if missing)
 *
 * @example
 * getDeepestDiveInfo(dives) // { deepestDive: 30, deepestDiveLocation: "Blue Hole" }
 */
export function getDeepestDiveInfo(dives: Dive[]): {
  deepestDive: number;
  deepestDiveLocation: string;
} {
  if (dives.length === 0) {
    return { deepestDive: 0, deepestDiveLocation: 'N/A' };
  }

  const deepest = dives.reduce((maxDive, dive) => (dive.depth > maxDive.depth ? dive : maxDive));

  return {
    deepestDive: deepest.depth,
    deepestDiveLocation: deepest.locations?.name || 'N/A',
  };
}

/**
 * Returns the average dive duration in minutes (0 if no dives).
 *
 * @param dives - List of dives to aggregate
 * @returns Average duration in minutes
 *
 * @example
 * getAverageDuration(dives) // 42.5
 */
export function getAverageDuration(dives: Dive[]): number {
  return dives.reduce((sum, dive) => sum + dive.duration, 0) / (dives.length || 1);
}

/**
 * Returns the total dive duration in minutes.
 *
 * @param dives - List of dives to aggregate
 * @returns Total duration in minutes
 *
 * @example
 * getTotalDiveDurationMinutes(dives) // 180
 */
export function getTotalDiveDurationMinutes(dives: Dive[]): number {
  return dives.reduce((sum, dive) => sum + dive.duration, 0);
}

/**
 * Returns the average dive depth (0 if no dives).
 *
 * @param dives - List of dives to aggregate
 * @returns Average depth
 *
 * @example
 * getAverageDepth(dives) // 24.2
 */
export function getAverageDepth(dives: Dive[]): number {
  return dives.reduce((sum, dive) => sum + dive.depth, 0) / (dives.length || 1);
}

/**
 * Returns the longest single dive duration in minutes (0 if no dives).
 *
 * @param dives - List of dives to evaluate
 * @returns Longest dive duration in minutes
 *
 * @example
 * getLongestDiveDuration(dives) // 62
 */
export function getLongestDiveDuration(dives: Dive[]): number {
  return dives.length > 0 ? Math.max(...dives.map((dive) => dive.duration)) : 0;
}

/**
 * Returns the count of unique location names (missing names counted as "N/A").
 *
 * @param dives - List of dives to aggregate
 * @returns Count of unique location names
 *
 * @example
 * getUniqueLocationCount(dives) // 7
 */
export function getUniqueLocationCount(dives: Dive[]): number {
  return new Set(dives.map((dive) => dive.locations?.name ?? 'N/A')).size;
}

/**
 * Returns whole days since the first dive in the list, or 0 if empty.
 *
 * Uses the dive at index 0 as the reference date.
 *
 * @param dives - List of dives to evaluate
 * @returns Whole days since the first listed dive
 *
 * @example
 * getDaysSinceLastDive(dives) // 5
 */
export function getDaysSinceLastDive(dives: Dive[]): number {
  if (dives.length === 0) {
    return 0;
  }

  const lastDiveDate = new Date(dives[0].date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDiveDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns whole days since the most recent dive, or 0 if empty.
 *
 * @param dives - List of dives to evaluate
 * @returns Whole days since the most recent dive
 *
 * @example
 * getDaysSinceMostRecentDive(dives) // 1
 */
export function getDaysSinceMostRecentDive(dives: Dive[]): number {
  if (dives.length === 0) {
    return 0;
  }

  const lastDiveDate = new Date(Math.max(...dives.map((dive) => new Date(dive.date).getTime())));
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDiveDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
