import type { Dive } from '@/features/dives';
import { TrendingDown, Waves, Clock, Calendar } from 'lucide-react';
import StatCard from '../../../components/common/StatCard';
import { useSettingsStore } from '@/store/settingsStore';
import {
  getAverageDuration,
  getDaysSinceLastDive,
  getDeepestDiveInfo,
  getTotalDivesThisMonth,
} from '@/shared/utils/diveStats';
import { formatValue, getUnitLabel } from '@/shared/utils/units';

type StatsListProps = {
  dives: Dive[];
  totalDives: number;
};

function StatsList({ dives, totalDives }: StatsListProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  // Calculate total dives this month
  const totalThisMonth = getTotalDivesThisMonth(dives);

  // Calculate deepest dive
  const { deepestDive, deepestDiveLocation } = getDeepestDiveInfo(dives);

  // Calculate average duration
  const averageDuration = getAverageDuration(dives);

  // Calculate days since last dive
  const daysSinceLastDive = getDaysSinceLastDive(dives);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Dives"
        value={totalDives}
        description={`+ ${totalThisMonth} this month`}
        icon={<Waves className="w-42 h-42" />}
        descriptionColor={totalThisMonth === 0 ? 'red' : 'green'}
      />
      <StatCard
        title={`Deepest Dive (${getUnitLabel('depth', unitSystem)})`}
        value={formatValue(deepestDive, 'depth', unitSystem)}
        description={`at ${deepestDiveLocation}`}
        icon={<TrendingDown className="w-42 h-42" />}
      />
      <StatCard
        title="Average Duration (min)"
        value={averageDuration.toFixed(1)}
        description="Across all dives"
        icon={<Clock className="w-42 h-42" />}
      />
      <StatCard
        title="Days since last dive"
        value={daysSinceLastDive.toString()}
        description={'Time to dive again!'}
        icon={<Calendar className="w-42 h-42" />}
      />
    </section>
  );
}

export default StatsList;
