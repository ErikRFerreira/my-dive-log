import InlineError from '@/components/common/InlineError';
import SkeletonCard from '@/components/common/SkeletonCard';
import StatCard from '@/components/common/StatCard';
import { useGetDives } from '@/features/dives/hooks/useGetDives';
import {
  getAverageDepth,
  getDaysSinceMostRecentDive,
  getDeepestDiveInfo,
  getLongestDiveDuration,
  getTotalDiveDurationMinutes,
  getUniqueLocationCount,
} from '@/shared/utils/diveStats';
import { getErrorMessage } from '@/shared/utils/errorMessage';
import { convertValue, formatValueWithUnit, getUnitLabel } from '@/shared/utils/units';
import { useSettingsStore } from '@/store/settingsStore';
import { Award, Clock, Target, TrendingUp, Trophy, Waves } from 'lucide-react';

function CarrerStatistics() {
  const { dives, isLoading: divesLoading, error: divesError } = useGetDives();
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  // Show loading skeletons while fetching data
  if (divesLoading)
    return (
      <>
        <h2 className="text-xl font-semibold text-foreground mb-4">Career Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </>
    );

  if (divesError || !dives) {
    return (
      <>
        <h2 className="text-xl font-semibold text-foreground mb-4">Career Statistics</h2>
        <InlineError
          message={getErrorMessage(
            divesError,
            'Failed to load career statistics. Please refresh the page.'
          )}
        />
      </>
    );
  }

  const totalDives = dives.length;

  const totalDiveTime = getTotalDiveDurationMinutes(dives);
  const { deepestDive } = getDeepestDiveInfo(dives);
  const daysSinceLastDive = getDaysSinceMostRecentDive(dives);
  const averageDepth = getAverageDepth(dives);
  const longestDive = getLongestDiveDuration(dives);
  const uniqueLocations = getUniqueLocationCount(dives);
  const totalDiveTimeHours = totalDiveTime / 60;
  const formattedTotalDiveTime = `${totalDiveTimeHours.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}h`;
  const formattedAverageDepth = `${convertValue(averageDepth, 'depth', unitSystem).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }
  )} ${getUnitLabel('depth', unitSystem)}`;

  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4">Career Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Dives"
          value={totalDives}
          description="Lifetime dives logged"
          icon={<Waves className="w-42 h-42" />}
        />

        <StatCard
          title="Total Dive Time"
          value={formattedTotalDiveTime}
          description="Time underwater"
          icon={<Clock className="w-42 h-42" />}
        />

        <StatCard
          title="Deepest Dive"
          value={formatValueWithUnit(deepestDive, 'depth', unitSystem)}
          description="Personal record"
          icon={<TrendingUp className="w-42 h-42" />}
        />

        <StatCard
          title="Days Since Last Dive"
          value={daysSinceLastDive}
          description="Time to dive again!"
          icon={<Target className="w-42 h-42" />}
        />

        <StatCard
          title="Average Depth"
          value={formattedAverageDepth}
          description="Across all dives"
          icon={<TrendingUp className="w-42 h-42" />}
        />

        <StatCard
          title="Longest Dive"
          value={`${longestDive}min`}
          description="Personal record"
          icon={<Clock className="w-42 h-42" />}
        />

        <StatCard
          title="Locations Visited"
          value={uniqueLocations}
          description="Unique dive sites"
          icon={<Trophy className="w-42 h-42" />}
        />

        <StatCard
          title="Species Documented"
          value={'Comming Soon!'}
          description="Marine life identified"
          icon={<Award className="w-42 h-42" />}
        />
      </div>
    </section>
  );
}

export default CarrerStatistics;
