import StatCard from '@/components/common/StatCard';
import { Award, Clock, Target, TrendingUp, Trophy, Waves } from 'lucide-react';

function CarrerStatistics() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4">Career Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Dives"
          value={127}
          description="Lifetime dives logged"
          icon={<Waves className="w-6 h-6" />}
          color="from-teal-400 to-teal-600"
          bg="bg-gradient-to-br from-teal-500/10 to-teal-600/10 border-teal-500/20"
        />

        <StatCard
          title="Total Dive Time"
          value="98.5h"
          description="Time underwater"
          icon={<Clock className="w-6 h-6" />}
          color="from-blue-400 to-blue-600"
          bg="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20"
        />

        <StatCard
          title="Deepest Dive"
          value="42m"
          description="Personal record"
          icon={<TrendingUp className="w-6 h-6" />}
          color="from-cyan-400 to-cyan-600"
          bg="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20"
        />

        <StatCard
          title="Days Since Last Dive"
          value={5}
          description="Time to dive again!"
          icon={<Target className="w-6 h-6" />}
          color="from-purple-400 to-purple-600"
          bg="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20"
        />

        <StatCard
          title="Average Depth"
          value="18.3m"
          description="Across all dives"
          icon={<TrendingUp className="w-6 h-6" />}
          color="from-emerald-400 to-emerald-600"
          bg="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20"
        />

        <StatCard
          title="Longest Dive"
          value="62min"
          description="Personal record"
          icon={<Clock className="w-6 h-6" />}
          color="from-amber-400 to-amber-600"
          bg="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20"
        />

        <StatCard
          title="Locations Visited"
          value={23}
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
