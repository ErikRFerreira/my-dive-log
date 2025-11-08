import type { Dive } from '@/features/dives';
import { TrendingDown, MapPin, Waves } from 'lucide-react';
import StatCard from './StatCard';

type StatsListProps = {
  dives: Dive[];
};

function StatsList({ dives }: StatsListProps) {
  const totalDives = dives.length;

  const totalThisMonth = dives.filter((dive) => {
    const diveDate = new Date(dive.date);
    const now = new Date();
    return diveDate.getMonth() === now.getMonth() && diveDate.getFullYear() === now.getFullYear();
  }).length;

  const deepestDive = dives.reduce((max, dive) => (dive.depth > max ? dive.depth : max), 0);

  const deepestDiveLocation = dives.reduce(
    (maxDive, dive) => (dive.depth > maxDive.depth ? dive : maxDive),
    { depth: 0, location: '' }
  ).location;

  const averageDuration = dives.reduce((sum, dive) => sum + dive.duration, 0) / (dives.length || 1);

  const favoriteLocation =
    dives
      .map((dive) => dive.location)
      .sort(
        (a, b) =>
          dives.filter((dive) => dive.location === b).length -
          dives.filter((dive) => dive.location === a).length
      )[0] || 'N/A';

  const favorteLocationCountry =
    dives.filter((dive) => dive.location === favoriteLocation).map((dive) => dive.country)[0] ||
    'N/A';

  const favoriteLocationCount = dives.filter((dive) => dive.location === favoriteLocation).length;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Dives"
        value={totalDives}
        description={`+ ${totalThisMonth} this month`}
        icon={<Waves className="w-6 h-6" />}
        color="from-teal-400 to-cyan-600"
      />
      <StatCard
        title="Deepest Dive (m)"
        value={deepestDive}
        description={`at ${deepestDiveLocation}`}
        icon={<TrendingDown className="w-6 h-6" />}
        color="from-teal-400 to-cyan-600"
      />
      <StatCard
        title="Average Duration (min)"
        value={averageDuration.toFixed(1)}
        description="Across all dives"
        icon={<MapPin className="w-6 h-6" />}
        color="from-teal-400 to-cyan-600"
      />
      <StatCard
        title="Favorite Location"
        value={`${favoriteLocation}, ${favorteLocationCountry}`}
        description={`${favoriteLocationCount} dives`}
        icon={<Waves className="w-6 h-6" />}
        color="from-teal-400 to-cyan-600"
      />
    </section>
  );
}

export default StatsList;
