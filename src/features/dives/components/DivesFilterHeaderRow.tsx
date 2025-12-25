import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, X } from 'lucide-react';
import type { ChangeEvent } from 'react';

import { DEFAULT_MAX_DEPTH, MIN_SEARCH_LENGTH } from '@/shared/constants';

type DivesFilterHeaderRowProps = {
  showFilters: boolean;
  onToggleFilters: () => void;
  localMaxDepth: number;
  selectedLocationLabel: string | null;
  localSearchQuery: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
};

export default function DivesFilterHeaderRow({
  showFilters,
  onToggleFilters,
  localMaxDepth,
  selectedLocationLabel,
  localSearchQuery,
  onSearchChange,
  onClearSearch,
}: DivesFilterHeaderRowProps) {
  return (
    <div className="flex flex-wrap gap-6 items-center">
      <Button
        variant={showFilters ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleFilters}
        className="gap-2"
      >
        Filters & Sort
        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
      </Button>

      {localMaxDepth < DEFAULT_MAX_DEPTH && (
        <span className="text-sm bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 px-2 py-1 rounded">
          Max Depth: {localMaxDepth} m
        </span>
      )}

      {selectedLocationLabel && (
        <span className="text-sm bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 px-2 py-1 rounded">
          Location: {selectedLocationLabel}
        </span>
      )}

      <div className="inline-flex items-center gap-3">
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <Input
          type="text"
          placeholder={`Search dives (min ${MIN_SEARCH_LENGTH} characters)...`}
          value={localSearchQuery}
          onChange={onSearchChange}
          className="w-full md:w-96"
        />
        {localSearchQuery && (
          <button type="button" aria-label="Clear search" onClick={onClearSearch}>
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
