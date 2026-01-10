import type { Dive } from '@/features/dives';
import { TrendingDown, MapPin, Waves } from 'lucide-react';
import StatCard from '../../../components/common/StatCard';
import { useMemo } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValue, getUnitLabel } from '@/shared/utils/units';

type StatsListProps = {
  dives: Dive[];
  totalDives: number;
};

function StatsList({ dives, totalDives }: StatsListProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  // Calculate total dives this month
  const totalThisMonth = useMemo(() => {
    return dives.filter((dive) => {
      const diveDate = new Date(dive.date);
      const now = new Date();
      return diveDate.getMonth() === now.getMonth() && diveDate.getFullYear() === now.getFullYear();
    }).length;
  }, [dives]);

  // Calculate deepest dive
  const { deepestDive, deepestDiveLocation } = useMemo(() => {
    if (dives.length === 0) {
      return { deepestDive: 0, deepestDiveLocation: 'N/A' };
    }
    const deepest = dives.reduce((maxDive, dive) => (dive.depth > maxDive.depth ? dive : maxDive));
    return {
      deepestDive: deepest.depth,
      deepestDiveLocation: deepest.locations?.name || 'N/A',
    };
  }, [dives]);

  // Calculate average duration
  const averageDuration = useMemo(() => {
    return dives.reduce((sum, dive) => sum + dive.duration, 0) / (dives.length || 1);
  }, [dives]);

  // Calculate favorite location
  const { favoriteLocation, favorteLocationCountry, favoriteLocationCount } = useMemo(() => {
    const locationCounts = dives.reduce(
      (acc, dive) => {
        const locName = dive.locations?.name || 'N/A';
        acc[locName] = (acc[locName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const favLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const favCountry =
      dives.find((dive) => dive.locations?.name === favLocation)?.locations?.country || 'N/A';
    const favCount = locationCounts[favLocation] || 0;

    return {
      favoriteLocation: favLocation,
      favorteLocationCountry: favCountry,
      favoriteLocationCount: favCount,
    };
  }, [dives]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Dives"
        value={totalDives}
        description={`+ ${totalThisMonth} this month`}
        icon={<Waves className="w-24 h-24" />}
        descriptionColor={totalThisMonth === 0 ? 'red' : 'green'}
      />
      <StatCard
        title={`Deepest Dive (${getUnitLabel('depth', unitSystem)})`}
        value={formatValue(deepestDive, 'depth', unitSystem)}
        description={`at ${deepestDiveLocation}`}
        icon={<TrendingDown className="w-24 h-24" />}
      />
      <StatCard
        title="Average Duration (min)"
        value={averageDuration.toFixed(1)}
        description="Across all dives"
        icon={<MapPin className="w-24 h-24" />}
      />
      <StatCard
        title="Favorite Location"
        value={`${favoriteLocation}, ${favorteLocationCountry}`}
        description={`${favoriteLocationCount} dives`}
        icon={<Waves className="w-24 h-24" />}
      />
    </section>
  );
}

export default StatsList;
