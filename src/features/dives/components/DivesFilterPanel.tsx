import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MAX_DEPTH_FILTER, MIN_DEPTH_FILTER } from '@/shared/constants';

import type { DiveLocation } from '../types';
import type { ChangeEvent } from 'react';

type SortBy = 'date' | 'depth' | 'duration';

type DivesFilterPanelProps = {
  show: boolean;
  sortBy: SortBy;
  onSortByChange: (sortBy: SortBy) => void;
  derivedCountry: string;
  countriesInLocations: string[];
  locationId: string | null;
  onCountryChange: (country: string | null) => void;
  onLocationIdChange: (locationId: string | null) => void;
  isLoadingLocations: boolean;
  filteredLocations: DiveLocation[];
  localMaxDepth: number;
  onMaxDepthChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onResetClick: () => void;
};

export default function DivesFilterPanel({
  show,
  sortBy,
  onSortByChange,
  derivedCountry,
  countriesInLocations,
  locationId,
  onCountryChange,
  onLocationIdChange,
  isLoadingLocations,
  filteredLocations,
  localMaxDepth,
  onMaxDepthChange,
  onResetClick,
}: DivesFilterPanelProps) {
  if (!show) return null;

  return (
    <Card className="bg-card border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-background text-foreground dark:bg-slate-800"
          >
            <option value="date">Date (Newest)</option>
            <option value="depth">Depth (Deepest)</option>
            <option value="duration">Duration (Longest)</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Country</label>
          <select
            value={derivedCountry}
            onChange={(e) => {
              onCountryChange(e.target.value || null);
              onLocationIdChange(null);
            }}
            disabled={!!locationId}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-background text-foreground dark:bg-slate-800"
          >
            <option value="">All Countries</option>
            {countriesInLocations.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Location</label>
          <select
            value={locationId ?? 'all'}
            onChange={(e) => {
              const next = e.target.value;
              onLocationIdChange(next === 'all' ? null : next);
            }}
            disabled={isLoadingLocations}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-background text-foreground dark:bg-slate-800"
          >
            <option value="all">All Locations</option>
            {filteredLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">
            Max Depth: {localMaxDepth} m
          </label>
          <input
            type="range"
            min={MIN_DEPTH_FILTER}
            max={MAX_DEPTH_FILTER}
            value={localMaxDepth}
            onChange={onMaxDepthChange}
            className="w-full"
          />
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={onResetClick}>
        Reset Filters
      </Button>
    </Card>
  );
}
