import Loading from '@/components/common/Loading';
import StatCard from '@/components/common/StatCard';
import { useGetDives } from '@/features/dives';
import { Award, Clock, Target, TrendingUp, Trophy, Waves } from 'lucide-react';

function CarrerStatistics() {
  const { dives, isLoading: divesLoading, isError: divesError } = useGetDives();

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
    return (totalDepth / dives.length).toFixed(1);
  })();

  const longestDive = dives.length > 0 ? Math.max(...dives.map((dive) => dive.duration)) : 0;

  const uniqueLocations = new Set(dives.map((dive) => dive.location)).size;

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
          icon={<Waves className="w-6 h-6" />}
          color="from-teal-400 to-teal-600"
          bg="bg-gradient-to-br from-teal-500/10 to-teal-600/10 border-teal-500/20"
        />

        <StatCard
          title="Total Dive Time"
          value={`${(totalDiveTime / 60).toFixed(1)}h`}
          description="Time underwater"
          icon={<Clock className="w-6 h-6" />}
          color="from-blue-400 to-blue-600"
          bg="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20"
        />

        <StatCard
          title="Deepest Dive"
          value={`${deepestDive}m`}
          description="Personal record"
          icon={<TrendingUp className="w-6 h-6" />}
          color="from-cyan-400 to-cyan-600"
          bg="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20"
        />

        <StatCard
          title="Days Since Last Dive"
          value={daysSinceLastDive}
          description="Time to dive again!"
          icon={<Target className="w-6 h-6" />}
          color="from-purple-400 to-purple-600"
          bg="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20"
        />

        <StatCard
          title="Average Depth"
          value={`${averageDepth}m`}
          description="Across all dives"
          icon={<TrendingUp className="w-6 h-6" />}
          color="from-emerald-400 to-emerald-600"
          bg="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20"
        />

        <StatCard
          title="Longest Dive"
          value={`${longestDive}min`}
          description="Personal record"
          icon={<Clock className="w-6 h-6" />}
          color="from-amber-400 to-amber-600"
          bg="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20"
        />

        <StatCard
          title="Locations Visited"
          value={uniqueLocations}
          description="Unique dive sites"
          icon={<Trophy className="w-6 h-6" />}
          color="from-rose-400 to-rose-600"
          bg="bg-gradient-to-br from-rose-500/10 to-rose-600/10 border-rose-500/20"
        />

        <StatCard
          title="Species Documented"
          value={87}
          description="Marine life identified"
          icon={<Award className="w-6 h-6" />}
          color="from-indigo-400 to-indigo-600"
          bg="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-indigo-500/20"
        />
      </div>
    </section>
  );
}

export default CarrerStatistics;
