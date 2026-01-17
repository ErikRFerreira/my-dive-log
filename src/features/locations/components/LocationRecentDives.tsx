import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import type { Dive } from '@/features/dives/';
import { useNavigate } from 'react-router';
import { useDiveFilterStore } from '@/store/diveFilterStore';
import DiveCard from '@/features/dives/components/DiveCard';

type LocationRecentDivesProps = {
  dives: Dive[];
};

function LocationRecentDives({ dives }: LocationRecentDivesProps) {
  const { setLocationId, setCurrentPage } = useDiveFilterStore();
  const navigate = useNavigate();

  const setFilterLocationId = (locationId: string | null) => {
    setLocationId(locationId);
    setCurrentPage(1);
    navigate('/dives');
  };

  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Recent Dives at This Location</h3>
        </div>
        {dives.length > 0 && (
          <button
            type="button"
            onClick={() => setFilterLocationId(dives[0].location_id)}
            className="text-primary hover:text-primary/80 font-medium"
          >
            See all dives in {dives[0].locations?.name}
          </button>
        )}
      </div>

      {dives.length > 0 ? (
        <div className="space-y-4">
          {dives.slice(0, 3).map((dive) => (
            <DiveCard key={dive.id} dive={dive} />
          ))}
        </div>
      ) : (
        <Card className="bg-card-dark border-border-dark rounded-2xl">
          <div className="p-6 text-muted-foreground text-center">
            No dives logged at this location yet
          </div>
        </Card>
      )}
    </section>
  );
}

export default LocationRecentDives;
