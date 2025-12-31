import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Eye, Gauge, Thermometer } from 'lucide-react';
import type { Dive } from '../types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit } from '@/shared/utils/units';

type NumericField = keyof Pick<
  Dive,
  'depth' | 'duration' | 'water_temp' | 'start_pressure' | 'end_pressure' | 'air_usage' | 'weight'
>;

type SelectField = keyof Pick<
  Dive,
  'visibility' | 'dive_type' | 'water_type' | 'exposure' | 'gas' | 'currents'
>;

interface DiveStatsProps {
  dive: Dive;
  isEditMode: boolean;
  onNumberChange: (field: NumericField) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: SelectField, value: string) => void;
}

function DiveStats({ dive, isEditMode, onNumberChange, onSelectChange }: DiveStatsProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {(
        [
          { label: 'Max Depth', key: 'depth', unit: 'm', icon: Gauge },
          { label: 'Duration', key: 'duration', unit: 'min', icon: Clock },
          { label: 'Water Temp', key: 'water_temp', unit: '°C', icon: Thermometer },
        ] as const
      ).map(({ label, key, unit, icon: Icon }) => {
        const val = dive[key];
        const display =
          val !== null && val !== undefined
            ? key === 'depth'
              ? formatValueWithUnit(val, 'depth', unitSystem)
              : key === 'water_temp'
                ? formatValueWithUnit(val, 'temperature', unitSystem)
                : `${val} ${unit}`
            : 'N/A';
        return (
          <Card key={key} className="bg-card border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-teal-600" />
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
              {isEditMode ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={val ?? ''}
                    type="number"
                    min={1}
                    step="any"
                    onChange={onNumberChange(key)}
                    className="text-2xl font-bold"
                    placeholder="N/A"
                  />
                  <span className="text-muted-foreground">
                    {key === 'depth' ? 'm' : key === 'water_temp' ? '°C' : unit}
                  </span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-foreground">{display}</p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Visibility Card */}
      <Card className="bg-card border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-teal-600" />
            <p className="text-sm text-muted-foreground">Visibility</p>
          </div>
          {isEditMode ? (
            <Select
              value={dive.visibility ?? ''}
              onValueChange={(value) => onSelectChange('visibility', value)}
            >
              <SelectTrigger className="text-2xl font-bold">
                <SelectValue placeholder="Select" />
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
