import Loading from '@/components/common/Loading';
import StatCard from '@/components/common/StatCard';
import { useGetDives } from '@/features/dives';
import { Award, Clock, Target, TrendingUp, Trophy, Waves } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit } from '@/shared/utils/units';

function CarrerStatistics() {
  const { dives, isLoading: divesLoading, isError: divesError } = useGetDives();
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  if (divesLoading) return <Loading />;
  if (divesError || !dives) return <div>Error loading career statistics.</div>;

  const totalDives = dives.length;

  const totalDiveTime = dives.reduce((acc, dive) => acc + dive.duration, 0);

  const deepestDive = dives.length > 0 ? Math.max(...dives.map((dive) => dive.depth)) : 0;

  const daysSinceLastDive = (() => {
    if (dives.length === 0) return 0;
    const lastDiveDate = new Date(Math.max(...dives.map((dive) => new Date(dive.date).getTime())));
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDiveDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  })();

  const averageDepth = (() => {
    if (dives.length === 0) return 0;
    const totalDepth = dives.reduce((acc, dive) => acc + dive.depth, 0);
    return totalDepth / dives.length;
  })();

  const longestDive = dives.length > 0 ? Math.max(...dives.map((dive) => dive.duration)) : 0;

  const uniqueLocations = new Set(dives.map((dive) => dive.locations?.name ?? 'N/A')).size;

  /*const speciesDocumented = useMemo(() => {
	const species = new Set<string>();
	dives.forEach((dive) => {
	  dive.speciesSeen.forEach((specie) => species.add(specie));
	});
	return species.size;
  }, [dives]);*/

  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4">Career Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Dives"
          value={totalDives}
          description="Lifetime dives logged"
          icon={<Waves className="w-24 h-24" />}
        />

        <StatCard
          title="Total Dive Time"
          value={`${(totalDiveTime / 60).toFixed(1)}h`}
          description="Time underwater"
          icon={<Clock className="w-24 h-24" />}
        />

        <StatCard
          title="Deepest Dive"
          value={formatValueWithUnit(deepestDive, 'depth', unitSystem)}
          description="Personal record"
          icon={<TrendingUp className="w-24 h-24" />}
        />

        <StatCard
          title="Days Since Last Dive"
          value={daysSinceLastDive}
          description="Time to dive again!"
          icon={<Target className="w-24 h-24" />}
        />

        <StatCard
          title="Average Depth"
          value={formatValueWithUnit(averageDepth, 'depth', unitSystem, { fractionDigits: 1 })}
          description="Across all dives"
          icon={<TrendingUp className="w-24 h-24" />}
        />

        <StatCard
          title="Longest Dive"
          value={`${longestDive}min`}
          description="Personal record"
          icon={<Clock className="w-24 h-24" />}
        />

        <StatCard
          title="Locations Visited"
          value={uniqueLocations}
          description="Unique dive sites"
          icon={<Trophy className="w-24 h-24" />}
        />

        <StatCard
          title="Species Documented"
          value={87}
          description="Marine life identified"
          icon={<Award className="w-24 h-24" />}
        />
      </div>
    </section>
  );
}

export default CarrerStatistics;
