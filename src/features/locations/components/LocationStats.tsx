import type { Dive } from '@/features/dives';
import { useMemo } from 'react';
import { MapPin, Waves, Zap } from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit } from '@/shared/utils/units';

type LocationStatsProps = {
  dives: Dive[];
};

function LocationStats({ dives }: LocationStatsProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  const totalLocations = useMemo(() => {
    const ids = dives.map((dive) => dive.locations?.id).filter((id): id is string => !!id);
    return new Set(ids).size;
  }, [dives]);

  const totalDives = dives.length;

  const averageDepth = useMemo(() => {
    if (dives.length === 0) return 0;
    const totalDepth = dives.reduce((sum, dive) => sum + dive.depth, 0);
    return Math.round(totalDepth / dives.length);
  }, [dives]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Total Locations"
        value={totalLocations}
        icon={<MapPin className="w-24 h-24" />}
      />
      <StatCard title="Total Dives" value={totalDives} icon={<Waves className="w-24 h-24" />} />
      <StatCard
        title="Average Depth"
        value={formatValueWithUnit(averageDepth, 'depth', unitSystem)}
        icon={<Zap className="w-24 h-24" />}
      />
    </section>
  );
}

export default LocationStats;
