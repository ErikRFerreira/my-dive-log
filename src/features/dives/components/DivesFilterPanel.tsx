import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSettingsStore } from '@/store/settingsStore';
import { depthFilterTrack } from '@/shared/utils/pressure';

import type { Location as DiveLocation } from '@/features/locations/';
import type { SortBy } from '@/shared/types/filters';
import type { ChangeEvent } from 'react';
import { Anchor, ArrowDownUp, Globe, MapPin } from 'lucide-react';

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
  minDepthForSlider: number;
  maxDepthForSlider: number;
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
  minDepthForSlider,
  maxDepthForSlider,
}: DivesFilterPanelProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  if (!show) return null;

  return (
    <Card className="bg-card border-border/60 p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <ArrowDownUp className="w-3.5 h-3.5 text-primary" />
            Sort By
          </label>
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
          <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-primary" />
            Country
          </label>
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
          <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            Location
          </label>
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
          <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Anchor className="w-3.5 h-3.5 text-primary inline-block mr-1" />
            Max Depth: {localMaxDepth} {unitSystem === 'imperial' ? 'ft' : 'm'}
          </label>
          <input
            type="range"
            min={minDepthForSlider}
            max={maxDepthForSlider}
            value={localMaxDepth}
            onChange={onMaxDepthChange}
            className="w-full mt-1 rounded-full appearance-none range-blue"
            style={{
              ['--range-track' as string]: depthFilterTrack(
                localMaxDepth,
                minDepthForSlider,
                maxDepthForSlider
              ),
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>
              {minDepthForSlider} {unitSystem === 'imperial' ? 'ft' : 'm'}
            </span>
            <span>
              {maxDepthForSlider} {unitSystem === 'imperial' ? 'ft' : 'm'}
            </span>
          </div>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={onResetClick}>
        Reset Filters
      </Button>
    </Card>
  );
}
