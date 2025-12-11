import { Card } from '@/components/ui/card';
import type { Dive } from '../types';
import DepthBadge from './DepthBadge';
import Button from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';

type DiveCardProps = {
  dive: Dive;
};

function DiveCard({ dive }: DiveCardProps) {
  const formatedDate = new Date(dive.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const navigate = useNavigate();

  return (
    <Card
      role="listitem"
      aria-label={`Dive at ${dive.location} on ${dive.date}`}
      className="transition-shadow hover:shadow-md bg-card border-slate-200 dark:border-slate-700"
    >
      <div className="px-6 py-5 space-y-2">
        <header className="flex justify-between">
          <h3 className="text-base font-semibold leading-none tracking-tight">{dive.location}</h3>
          <div>
            <DepthBadge depth={dive.depth} />
            <p className="text-sm mt-2 text-muted-foreground">
              <strong>{dive.duration}</strong> min
            </p>
          </div>
        </header>
        <p className="text-xs text-muted-foreground">{formatedDate}</p>
        {dive.notes && (
          <p className="text-sm italic text-slate-700 dark:text-slate-300">{dive.notes}</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent mt-2"
          onClick={() => navigate(`/dives/${dive.id}`)}
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

export default DiveCard;
