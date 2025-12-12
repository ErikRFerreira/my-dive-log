import { useMemo, useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Dive } from '../types';

type SortBy = 'date' | 'depth' | 'duration';
type DivesFilterValue = {
  sortBy: SortBy;
  maxDepth: number;
  selectedLocation: string;
};

type DivesFilterProps = {
  onChange?: (value: DivesFilterValue) => void;
  defaultSort: SortBy;
  defaultMaxDepth: number;
  dives: Dive[];
  showFilters: boolean;
  onToggleFilters: () => void;
  filteredCount: number;
};

function DivesFilter({
  onChange,
  defaultSort,
  defaultMaxDepth,
  dives,
  showFilters,
  onToggleFilters,
  filteredCount,
}: DivesFilterProps) {
  const [sortBy, setSortBy] = useState<SortBy>(defaultSort);
  const [maxDepth, setMaxDepth] = useState<number>(defaultMaxDepth);
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compute unique locations from dives
  const locations = useMemo(() => {
    const uniqueLocations = new Set(dives.map((dive) => dive.location));
    return ['all', ...Array.from(uniqueLocations).sort()];
  }, [dives]);

  const notifyChange = (updates: Partial<DivesFilterValue>) => {
    const newState = {
      sortBy,
      maxDepth,
      selectedLocation,
      ...updates,
    };
    onChange?.(newState);
  };

  const notifyChangeDebounced = (updates: Partial<DivesFilterValue>, delay = 500) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      notifyChange(updates);
    }, delay);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleFilters}
          className="gap-2"
        >
          Filters & Sort
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </Button>

        {selectedLocation !== 'all' && (
          <span className="text-sm bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 px-2 py-1 rounded">
            Location: {selectedLocation}
          </span>
        )}
        {maxDepth < 50 && (
          <span className="text-sm bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 px-2 py-1 rounded">
            Max Depth: {maxDepth} m
          </span>
        )}
      </div>

      {showFilters && (
        <Card className="bg-card border-slate-200 dark:border-slate-700 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sort By */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  const newSort = e.target.value as SortBy;
                  setSortBy(newSort);
                  notifyChange({ sortBy: newSort });
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-background text-foreground dark:bg-slate-800"
              >
                <option value="date">Date (Newest)</option>
                <option value="depth">Depth (Deepest)</option>
                <option value="duration">Duration (Longest)</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  const newLocation = e.target.value;
                  setSelectedLocation(newLocation);
                  notifyChange({ selectedLocation: newLocation });
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-background text-foreground dark:bg-slate-800"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Depth Filter */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">
                Max Depth: {maxDepth} m
              </label>
              <input
                type="range"
                min="15"
                max="50"
                value={maxDepth}
                onChange={(e) => {
                  const newDepth = Number(e.target.value);
                  setMaxDepth(newDepth);
                  notifyChangeDebounced({ maxDepth: newDepth });
                }}
                className="w-full"
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setSortBy('date');
              setSelectedLocation('all');
              setMaxDepth(50);
              onChange?.({ sortBy: 'date', selectedLocation: 'all', maxDepth: 50 });
            }}
          >
            Reset Filters
          </Button>
        </Card>
      )}
      <p className="text-sm text-muted-foreground">
        Showing {filteredCount} of {dives.length} dives
      </p>
    </div>
  );
}

export default DivesFilter;
