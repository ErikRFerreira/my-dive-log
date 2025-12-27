import type { Dive } from '@/features/dives';
import { useMemo, useState } from 'react';

import LocationCard from './LocationCard';
import LocationsFilters from './LocationsFilters';

type LocationCardsProps = {
  dives: Dive[];
};

type DiveLocationSummary = {
  id: string;
  name: string;
  country: string | null;
  diveCount: number;
  deepestDive: number;
  lastDiveDate: string;
  lastDiveTimestamp: number;
  lastDiveDateRaw: string;
};

function LocationCardsGrid({ dives }: LocationCardsProps) {
  // UI state: how the user wants the location cards ordered.
  const [sortBy, setSortBy] = useState<'dives' | 'depth' | 'recent'>('dives');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const locationGroups = useMemo(() => {
    // Group all dives by their location id. This lets us compute per-location stats
    // (total dives, deepest dive, most recent dive) efficiently.
    const divesByLocationId = new Map<string, Dive[]>();

    for (const dive of dives) {
      const locationId = dive.locations?.id;
      if (!locationId) continue;

      const existing = divesByLocationId.get(locationId);
      if (existing) existing.push(dive);
      else divesByLocationId.set(locationId, [dive]);
    }

    // Convert each group into a "location summary" object that the UI can render.
    const groups = Array.from(divesByLocationId.values())
      .map((divesAtLocation) => {
        const location = divesAtLocation[0]?.locations;
        if (!location) return null;

        const deepestDive = Math.max(...divesAtLocation.map((d) => d.depth ?? 0));
        const lastDiveTimestamp = Math.max(
          ...divesAtLocation.map((d) => new Date(d.date).getTime())
        );
        const lastDiveDateRaw = Number.isFinite(lastDiveTimestamp)
          ? new Date(lastDiveTimestamp).toISOString()
          : '';
        const lastDiveDate = Number.isFinite(lastDiveTimestamp)
          ? new Date(lastDiveTimestamp).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '';

        return {
          id: location.id,
          name: location.name,
          country: location.country,
          diveCount: divesAtLocation.length,
          deepestDive,
          lastDiveDate,
          lastDiveTimestamp,
          lastDiveDateRaw,
        };
      })
      .filter(Boolean) as Array<DiveLocationSummary>;

    // Sort the summaries based on the selected sort mode.
    // Sort a copy (`sorted`) to avoid mutating `groups`.
    const sorted = [...groups];
    if (sortBy === 'dives') sorted.sort((a, b) => b.diveCount - a.diveCount);
    if (sortBy === 'depth') sorted.sort((a, b) => b.deepestDive - a.deepestDive);
    if (sortBy === 'recent') sorted.sort((a, b) => b.lastDiveTimestamp - a.lastDiveTimestamp);

    // TODO: Favorites support. Once favorites are persisted, filter `sorted` here when
    // `showFavoritesOnly` is true.
    return sorted;
  }, [dives, sortBy]);

  return (
    <>
      {/* Filters and Sort */}
      <LocationsFilters
        sortBy={sortBy}
        onSortByChange={setSortBy}
        showFavoritesOnly={showFavoritesOnly}
        onShowFavoritesOnlyChange={(next) => {
          setShowFavoritesOnly(next);
          console.log('showFavoritesOnly:', next);
        }}
      />

      {/* Location Cards Grid */}
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {locationGroups.map((group) => (
          <LocationCard
            key={group.id}
            id={group.id}
            name={group.name}
            country={group.country}
            diveCount={group.diveCount}
            deepestDive={group.deepestDive}
            lastDiveDate={group.lastDiveDate}
          />
        ))}
      </section>
    </>
  );
}

export default LocationCardsGrid;
