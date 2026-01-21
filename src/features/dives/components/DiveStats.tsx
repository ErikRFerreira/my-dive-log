import { Card, CardContent } from '@/components/ui/card';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookType, Clock, Gauge, Thermometer } from 'lucide-react';
import type { Dive, DiveType } from '../types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit, getUnitLabel } from '@/shared/utils/units';

interface DiveStatsProps {
  dive: Dive;
  isEditing: boolean;
  isSaving: boolean;
  stats: {
    depth: Dive['depth'] | null;
    duration: Dive['duration'] | null;
    water_temp: Dive['water_temp'];
    dive_type: Dive['dive_type'];
  };
  onFieldChange: (
    field: 'depth' | 'duration' | 'water_temp' | 'dive_type',
    value: number | null | DiveType
  ) => void;
}

function DiveStats({ dive, isEditing, isSaving, stats, onFieldChange }: DiveStatsProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const temperatureLabel = getUnitLabel('temperature', unitSystem);
  const depthLabel = getUnitLabel('depth', unitSystem);

  const handleNumberChange = (field: 'depth' | 'duration' | 'water_temp', value: string) => {
    if (value === '') {
      onFieldChange(field, null);
      return;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      onFieldChange(field, null);
      return;
    }
    onFieldChange(field, parsed);
  };

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {(
        [
          { label: 'Max Depth', key: 'depth', unit: depthLabel, icon: Gauge },
          { label: 'Duration', key: 'duration', unit: 'min', icon: Clock },
          { label: 'Water Temp', key: 'water_temp', unit: temperatureLabel, icon: Thermometer },
        ] as const
      ).map(({ label, key, unit, icon: Icon }) => {
        const val = isEditing ? stats[key] : dive[key];
        const display =
          val !== null && val !== undefined
            ? key === 'depth'
              ? formatValueWithUnit(val, 'depth', unitSystem)
              : key === 'water_temp'
                ? formatValueWithUnit(val, 'temperature', unitSystem)
                : `${val} ${unit}`
            : 'N/A';
        return (
          <Card
            key={key}
            className="bg-card-dark/40 backdrop-blur-[5px] border-2 border-[#232a33] rounded-2xl"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <NumberInput
                    value={val ?? ''}
                    onChange={(e) => handleNumberChange(key, e.target.value)}
                    disabled={isSaving}
                    className="text-base"
                  />
                  <span className="text-sm text-muted-foreground">{unit}</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-foreground">{display}</p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Dive Type Card */}
      <Card className="bg-card-dark/40 backdrop-blur-[20px] border border-[#232a33] rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <BookType className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Dive Type</p>
          </div>
          {isEditing ? (
            <Select
              value={stats.dive_type ?? ''}
              onValueChange={(value) => onFieldChange('dive_type', value as DiveType)}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reef">Reef</SelectItem>
                <SelectItem value="wreck">Wreck</SelectItem>
                <SelectItem value="wall">Wall</SelectItem>
                <SelectItem value="cave">Cave</SelectItem>
                <SelectItem value="drift">Drift</SelectItem>
                <SelectItem value="night">Night</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="lake-river">Lake/River</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-2xl font-bold text-foreground capitalize">
              {dive.dive_type ?? 'N/A'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DiveStats;
