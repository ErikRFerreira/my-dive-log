import { Card } from '@/components/ui/card';
import type { Dive } from '../types';
import { useNavigate } from 'react-router';
import { MapPin, Wind } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit } from '@/shared/utils/units';

type DiveCardFullProps = {
  dive: Dive;
};

const diveTypeLabels: Record<NonNullable<Dive['dive_type']>, string> = {
  reef: 'REEF',
  wreck: 'WRECK',
  wall: 'WALL',
  cave: 'CAVE',
  drift: 'DRIFT',
  night: 'NIGHT',
  training: 'TRAINING',
  'lake-river': 'LAKE/RIVER',
};

const waterTypeLabels: Record<NonNullable<Dive['water_type']>, string> = {
  salt: 'SALT',
  fresh: 'FRESH',
};

function DiveCardFull({ dive }: DiveCardFullProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const navigate = useNavigate();

  const diveLocation = dive.locations?.name || 'Unknown Location';
  const diveCountry = dive.locations?.country || '';
  const fullLocation = diveCountry ? `${diveLocation}, ${diveCountry}` : diveLocation;

  const formattedDate = new Date(dive.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const gasLabel =
    dive.gas === 'nitrox' && dive.nitrox_percent
      ? `Nitrox ${dive.nitrox_percent}%`
      : dive.gas === 'nitrox'
        ? 'Nitrox'
        : 'Air';

  return (
    <Card
      role="listitem"
      aria-label={`Dive at ${fullLocation} on ${formattedDate}`}
      className="bg-gradient-to-br from-[#233C48] to-[#1a2d38] border border-[#2a3845] rounded-2xl overflow-hidden cursor-pointer hover:border-cyan-400/50 transition-all p-0"
      onClick={() => navigate(`/dives/${dive.id}`)}
    >
      {/* Image Section with Gradient Fallback */}
      <div className="h-40 w-full relative bg-gradient-to-br from-[#1a3a4a] via-[#0f2838] to-[#0a1f2e]">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent" />

        {/* Gas Type Badge */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1">
          <Wind className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white uppercase tracking-wide">{gasLabel}</span>
        </div>

        {/* Location Info */}
        <div className="absolute bottom-3 left-4">
          <h3 className="text-white text-lg font-bold leading-tight drop-shadow-md">
            {diveLocation}
          </h3>
          <div className="mt-2 flex items-center gap-1 text-gray-400 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>{diveCountry || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 pt-2">
        {/* Date and Tags */}
        <div className="flex justify-between items-end mb-4 border-b border-border pb-3">
          <p className="text-muted-foreground text-sm font-medium">{formattedDate}</p>
          <div className="flex gap-2">
            {dive.dive_type && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/40">
                {diveTypeLabels[dive.dive_type]}
              </span>
            )}
            {dive.water_type && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/40">
                {waterTypeLabels[dive.water_type]}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col items-center gap-1">
            <span className="text-muted-foreground text-xs font-medium uppercase">Depth</span>
            <span className="text-primary text-xl font-bold">
              {formatValueWithUnit(dive.depth, 'depth', unitSystem)}
            </span>
          </div>

          <div className="w-px h-8 bg-border" />

          <div className="flex flex-col items-center gap-1">
            <span className="text-muted-foreground text-xs font-medium uppercase">Time</span>
            <span className="text-white text-xl font-bold">
              {dive.duration}
              <span className="text-xs font-normal text-muted-foreground ml-0.5">min</span>
            </span>
          </div>

          <div className="w-px h-8 bg-border" />

          <div className="flex flex-col items-center gap-1">
            <span className="text-muted-foreground text-xs font-medium uppercase">Temp</span>
            {dive.water_temp !== null ? (
              <span className="text-white text-xl font-bold">
                {formatValueWithUnit(dive.water_temp, 'temperature', unitSystem)}
              </span>
            ) : (
              <span className="text-muted-foreground text-xl font-bold">—</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default DiveCardFull;
