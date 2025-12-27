import Button from '@/components/ui/button';
import { Heart } from 'lucide-react';

type LocationsFiltersProps = {
  sortBy: 'dives' | 'depth' | 'recent';
  onSortByChange: (sort: 'dives' | 'depth' | 'recent') => void;
  showFavoritesOnly: boolean;
  onShowFavoritesOnlyChange: (showFavoritesOnly: boolean) => void;
};

function LocationsFilters({
  sortBy,
  onSortByChange,
  showFavoritesOnly,
  onShowFavoritesOnlyChange,
}: LocationsFiltersProps) {
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <Button
        variant={showFavoritesOnly ? 'default' : 'outline'}
        onClick={() => onShowFavoritesOnlyChange(!showFavoritesOnly)}
        className="gap-2"
        size="sm"
      >
        <Heart className="w-4 h-4" />
        {showFavoritesOnly ? 'Favorites' : 'All Locations'}
      </Button>
      <div className="flex gap-2">
        <Button
          variant={sortBy === 'dives' ? 'default' : 'outline'}
          onClick={() => onSortByChange('dives')}
          size="sm"
        >
          Most Dives
        </Button>
        <Button
          variant={sortBy === 'depth' ? 'default' : 'outline'}
          onClick={() => onSortByChange('depth')}
          size="sm"
        >
          Deepest
        </Button>
        <Button
          variant={sortBy === 'recent' ? 'default' : 'outline'}
          onClick={() => onSortByChange('recent')}
          size="sm"
        >
          Recent
        </Button>
      </div>
    </div>
  );
}

export default LocationsFilters;
