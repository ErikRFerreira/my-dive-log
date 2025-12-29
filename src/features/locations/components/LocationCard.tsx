import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router';

type LocationCardProps = {
  id: string;
  name: string;
  country: string | null;
  diveCount: number;
  deepestDive: number;
  lastDiveDate: string;
};

function LocationCard({
  id,
  name,
  country,
  diveCount,
  deepestDive,
  lastDiveDate,
}: LocationCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      key={id}
      className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow overflow-hidden"
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground">{name}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {country}
            </p>
          </div>
          <button
            //onClick={() => toggleFavorite(id)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <Heart className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Dives</span>
          <span className="font-semibold text-foreground">{diveCount}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Deepest Dive</span>
          <span className="font-semibold text-foreground">{deepestDive} meters</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Last Dive</span>
          <span className="text-xs text-muted-foreground">{lastDiveDate}</span>
        </div>

        <div className="pt-2 border-t border-border"></div>

        <Button
          variant="outline"
          className="w-full mt-2 bg-transparent"
          size="sm"
          onClick={() => navigate(`/locations/${id}`)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

export default LocationCard;
