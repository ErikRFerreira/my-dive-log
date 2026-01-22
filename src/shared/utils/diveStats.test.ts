/**
 * Unit tests for dive statistics helpers.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Dive } from '@/features/dives';
import {
  getAverageDepth,
  getAverageDuration,
  getDaysSinceLastDive,
  getDaysSinceMostRecentDive,
  getDeepestDiveInfo,
  getFavoriteLocation,
  getLongestDiveDuration,
  getTotalDiveDurationMinutes,
  getTotalDivesThisMonth,
  getTotalLocations,
  getUniqueLocationCount,
} from './diveStats';

const makeDive = (overrides: Partial<Dive>): Dive =>
  ({
    id: 'dive-1',
    date: '2025-01-10T00:00:00Z',
    depth: 18,
    duration: 45,
    locations: {
      id: 'loc-1',
      name: 'Blue Hole',
      country: 'Belize',
      country_code: 'BZ',
    },
    ...overrides,
  }) as Dive;

describe('diveStats', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns safe defaults for empty arrays', () => {
    const dives: Dive[] = [];

    expect(getTotalLocations(dives)).toBe(0);
    expect(getFavoriteLocation(dives)).toBe('');
    expect(getTotalDivesThisMonth(dives)).toBe(0);
    expect(getDeepestDiveInfo(dives)).toEqual({ deepestDive: 0, deepestDiveLocation: 'N/A' });
    expect(getAverageDuration(dives)).toBe(0);
    expect(getTotalDiveDurationMinutes(dives)).toBe(0);
    expect(getAverageDepth(dives)).toBe(0);
    expect(getLongestDiveDuration(dives)).toBe(0);
    expect(getUniqueLocationCount(dives)).toBe(0);
    expect(getDaysSinceLastDive(dives)).toBe(0);
    expect(getDaysSinceMostRecentDive(dives)).toBe(0);
  });

  it('calculates totals and favorites for a typical set of dives', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T00:00:00Z'));

    const dives = [
      makeDive({ id: 'd1', date: '2025-01-10T00:00:00Z', depth: 20, duration: 40 }),
      makeDive({ id: 'd2', date: '2025-01-14T00:00:00Z', depth: 30, duration: 55 }),
      makeDive({
        id: 'd3',
        date: '2024-12-20T00:00:00Z',
        depth: 25,
        duration: 35,
        locations: { id: 'loc-2', name: 'Kelp Forest', country: 'USA', country_code: 'US' },
      }),
    ];

    expect(getTotalLocations(dives)).toBe(2);
    expect(getFavoriteLocation(dives)).toBe('Blue Hole, Belize');
    expect(getTotalDivesThisMonth(dives)).toBe(2);
    expect(getDeepestDiveInfo(dives)).toEqual({
      deepestDive: 30,
      deepestDiveLocation: 'Blue Hole',
    });
    expect(getAverageDuration(dives)).toBeCloseTo(43.333, 3);
    expect(getTotalDiveDurationMinutes(dives)).toBe(130);
    expect(getAverageDepth(dives)).toBeCloseTo(25, 5);
    expect(getLongestDiveDuration(dives)).toBe(55);
    expect(getUniqueLocationCount(dives)).toBe(2);
  });

  it('distinguishes between first and most recent dive for day calculations', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T00:00:00Z'));

    const dives = [
      makeDive({ date: '2025-01-10T00:00:00Z' }),
      makeDive({ id: 'd2', date: '2025-01-14T00:00:00Z' }),
      makeDive({ id: 'd3', date: '2025-01-01T00:00:00Z' }),
    ];

    expect(getDaysSinceLastDive(dives)).toBe(5);
    expect(getDaysSinceMostRecentDive(dives)).toBe(1);
  });
});
