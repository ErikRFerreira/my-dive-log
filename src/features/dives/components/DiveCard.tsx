import { Card } from '@/components/ui/card';
import type { Dive } from '../types';
import { useNavigate } from 'react-router';
import { Calendar } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit } from '@/shared/utils/units';
import { useCoverPhotoUrl } from '../hooks/useCoverPhotoUrl';

type DiveCardProps = {
  dive: Dive;
};

import caveIcon from '../../../assets/icons/cave.svg?raw';
import driftIcon from '../../../assets/icons/drift.svg?raw';
import lakeRiverIcon from '../../../assets/icons/lake-river.svg?raw';
import nightIcon from '../../../assets/icons/night.svg?raw';
import reefIcon from '../../../assets/icons/reef.svg?raw';
import trainingIcon from '../../../assets/icons/training.svg?raw';
import wallIcon from '../../../assets/icons/wall.svg?raw';
import wreckIcon from '../../../assets/icons/wreck.svg?raw';
import diverIcon from '../../../assets/icons/diver.svg?raw';

const diveTypeIcons: Partial<Record<NonNullable<Dive['dive_type']>, string>> = {
  cave: caveIcon,
  drift: driftIcon,
  'lake-river': lakeRiverIcon,
  night: nightIcon,
  reef: reefIcon,
  training: trainingIcon,
  wall: wallIcon,
  wreck: wreckIcon,
};

function DiveCard({ dive }: DiveCardProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const diveLocation = dive.locations?.name || '';
  const diveCountry = dive.locations?.country || '';
  const fullLocation = diveCountry ? `${diveLocation}, ${diveCountry}` : diveLocation;
  const diveLocationDisplay = fullLocation || 'Unknown Location';
  const diveIcon = dive.dive_type ? diveTypeIcons[dive.dive_type] : diverIcon;
  const { coverPhotoUrl } = useCoverPhotoUrl(dive.cover_photo_path, {
    transform: { width: 200, height: 200, resize: 'cover' },
  });

  const formattedDate = new Date(dive.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const navigate = useNavigate();

  return (
    <Card
      role="listitem"
      aria-label={`Dive at ${diveLocationDisplay} on ${formattedDate}`}
      className="bg-card-dark border-border-dark p-4 rounded-2xl cursor-pointer hover:border-cyan-400/50 transition-all"
      onClick={() => navigate(`/dives/${dive.id}`)}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-24 h-24 rounded-xl bg-[#0f1419] relative overflow-hidden flex items-center justify-center text-primary flex-shrink-0 bg-cover bg-center"
          style={coverPhotoUrl ? { backgroundImage: `url('${coverPhotoUrl}')` } : undefined}
        >
          {coverPhotoUrl && (
            <>
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent" />
            </>
          )}
          {diveIcon && (
            <span
              aria-hidden="true"
              className="relative z-10 flex h-6 w-6 items-center justify-center [&>svg]:h-10 [&>svg]:w-10"
              dangerouslySetInnerHTML={{ __html: diveIcon }}
            />
          )}
        </div>

        <div className="flex-1">
          <p className="text-white font-bold text-lg mb-1">{diveLocationDisplay}</p>
          <p className="text-gray-400 text-sm flex items-center gap-1 mb-2">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </p>
        </div>

        <div className="flex flex-col gap-1 items-end">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xl">
              {formatValueWithUnit(dive.depth, 'depth', unitSystem)}
            </span>
            <span className="text-white font-bold text-xl">{dive.duration}m</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
            <span>DEPTH</span>
            <span>TIME</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default DiveCard;
