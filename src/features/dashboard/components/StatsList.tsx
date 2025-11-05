import StatCard from './StatCard';
import { type Dive } from '@/features/dives';

type StatsListProps = {
  dives: Dive[];
};

function StatsList({ dives }: StatsListProps) {
  const styles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    marginBottom: '20px',
    marginTop: '20px',
  };

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

  const favoriteLocationCount = dives.filter((dive) => dive.location === favoriteLocation).length;

  return (
    <section style={styles}>
      <StatCard
        title="Total Dives"
        value={totalDives}
        subtitle={`+ ${totalThisMonth} this month`}
      />
      <StatCard
        title="Deepest Dive (m)"
        value={deepestDive}
        subtitle={`at ${deepestDiveLocation}`}
      />
      <StatCard
        title="Average Duration (min)"
        value={averageDuration.toFixed(1)}
        subtitle="Across all dives"
      />
      <StatCard
        title="Favorite Location"
        value={favoriteLocation}
        subtitle={`${favoriteLocationCount} dives`}
      />
    </section>
  );
}

export default StatsList;
