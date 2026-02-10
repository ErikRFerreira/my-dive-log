import { Card } from '@/components/ui/card';

import type { Dive } from '../types';
import { useNavigate } from 'react-router';
import { Calendar } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit } from '@/shared/utils/units';
import { useCoverPhotoUrl } from '../hooks/useCoverPhotoUrl';
import TypeIcon from '@/components/ui/TypeIcon';

type DiveCardProps = {
  dive: Dive;
};

function DiveCard({ dive }: DiveCardProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const diveLocation = dive.locations?.name || '';
  const diveCountry = dive.locations?.country || '';
  const fullLocation = diveCountry ? `${diveLocation}, ${diveCountry}` : diveLocation;
  const diveLocationDisplay = fullLocation || 'Unknown Location';

  const { coverPhotoUrl } = useCoverPhotoUrl(dive.cover_photo_path, {
    transform: { width: 200, height: 200, resize: 'cover' },
  });

  let cover = coverPhotoUrl;
  if (!coverPhotoUrl && dive.dive_type) {
    cover = `/banners/${dive.dive_type}.png`;
  }

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
      className="bg-card-dark border-border-dark p-4 max-[991px]:p-2 rounded-2xl cursor-pointer hover:border-cyan-400/50 transition-all"
      onClick={() => navigate(`/dives/${dive.id}`)}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-24 h-24 max-[991px]:w-16 max-[991px]:h-16 rounded-xl bg-[#0f1419] relative overflow-hidden flex items-center justify-center text-primary flex-shrink-0 bg-cover bg-center"
          style={cover ? { backgroundImage: `url('${cover}')` } : undefined}
        >
          {cover && (
            <>
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent" />
            </>
          )}
          {dive.dive_type && <TypeIcon icon={dive.dive_type} color="text-primary" />}
        </div>

        <div className="flex-1">
          <h3 className="text-white font-bold text-lg max-[991px]:text-sm mb-1">
            {diveLocationDisplay}
          </h3>
          <p className="text-gray-400 text-sm max-[991px]:text-xs flex items-center gap-1 mb-2">
            <Calendar className="w-4 h-4 max-[991px]:w-3 max-[991px]:h-3" />
            {formattedDate}
          </p>
        </div>

        <div className="flex flex-col gap-1 items-end">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xl max-[991px]:text-sm">
              {formatValueWithUnit(dive.depth, 'depth', unitSystem)}
            </span>
            <span className="text-white font-bold text-xl max-[991px]:text-sm">
              {dive.duration}m
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs max-[991px]:text-[10px] uppercase">
            <span>DEPTH</span>
            <span>TIME</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default DiveCard;
