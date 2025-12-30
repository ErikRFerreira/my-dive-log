import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import type { Dive } from '@/features/dives/';
import { useNavigate } from 'react-router';
import { useDiveFilterStore } from '@/store/diveFilterStore';

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
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-foreground">Recent Dives at This Location</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {dives.length > 0 ? (
          <>
            <div className="space-y-3">
              {dives.slice(0, 3).map((dive) => (
                <div
                  key={dive.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{dive.date}</p>
                    <p className="text-sm text-muted-foreground mt-1">{dive.notes}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{dive.depth}m</span> depth
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{dive.duration}min</span>{' '}
                        duration
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dives/${dive.id}`)}
                    className="gap-2 bg-transparent"
                  >
                    View Details
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="default"
              className="w-full mt-4 gap-2"
              onClick={() => setFilterLocationId(dives[0].location_id)}
            >
              See all dives at this location
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No dives logged at this location yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default LocationRecentDives;
