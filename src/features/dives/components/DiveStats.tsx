import { Card, CardContent } from '@/components/ui/card';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Eye, Gauge, Thermometer } from 'lucide-react';
import type { Dive, Visibility } from '../types';
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
    visibility: Dive['visibility'];
  };
  onFieldChange: (
    field: 'depth' | 'duration' | 'water_temp' | 'visibility',
    value: number | null | Visibility
  ) => void;
}

function DiveStats({ dive, isEditing, isSaving, stats, onFieldChange }: DiveStatsProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const temperatureLabel = getUnitLabel('temperature', unitSystem);
  const depthLabel = getUnitLabel('depth', unitSystem);

  const handleNumberChange = (
    field: 'depth' | 'duration' | 'water_temp',
    value: string
  ) => {
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

      {/* Visibility Card */}
      <Card className="bg-card-dark/40 backdrop-blur-[20px] border border-[#232a33] rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">Visibility</p>
          </div>
          {isEditing ? (
            <Select
              value={stats.visibility ?? ''}
              onValueChange={(value) => onFieldChange('visibility', value as Visibility)}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-2xl font-bold text-foreground capitalize">
              {dive.visibility ?? 'N/A'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DiveStats;
