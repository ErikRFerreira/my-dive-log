import { MapPin, Star, Waves } from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import type { Dive } from '@/features/dives';
import { getFavoriteLocation, getTotalLocations } from '@/shared/utils/diveStats';

type LocationStatsProps = {
  dives: Dive[];
};

function LocationStats({ dives }: LocationStatsProps) {
  const totalDives = dives.length;
  const totalLocations = getTotalLocations(dives);
  const favoriteLocation = getFavoriteLocation(dives);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Locations"
        value={totalLocations}
        icon={<MapPin className="w-42 h-42" />}
      />
      <StatCard title="Total Dives" value={totalDives} icon={<Waves className="w-42 h-42" />} />
      <StatCard
        title="Favorite Location"
        value={favoriteLocation}
        icon={<Star className="w-42 h-42" />}
      />
    </section>
  );
}

export default LocationStats;
