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
import { Controller, useFormContext } from 'react-hook-form';
import type { Dive } from '../types';
import { useSettingsStore } from '@/store/settingsStore';
import {
  convertValueBetweenSystems,
  formatValueWithUnit,
  getUnitLabel,
} from '@/shared/utils/units';

interface DiveStatsProps {
  dive: Dive;
  isEditing: boolean;
}

function DiveStats({ dive, isEditing }: DiveStatsProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const temperatureLabel = getUnitLabel('temperature', unitSystem);
  const depthLabel = getUnitLabel('depth', unitSystem);

  // Always call useFormContext - React Hooks must be called unconditionally
  const formContext = useFormContext();
  const { control, formState: { errors = {}, isSubmitting = false } = {} } = formContext || {};

  const toDisplayNumber = (
    rawMetricValue: number | null | undefined,
    kind: 'depth' | 'temperature'
  ): number | '' => {
    if (rawMetricValue === null || rawMetricValue === undefined) return '';
    const converted = convertValueBetweenSystems(rawMetricValue, kind, 'metric', unitSystem);
    if (!Number.isFinite(converted)) return '';
    return Math.round(converted);
  };

  const toMetricNumber = (
    rawDisplayValue: string,
    kind: 'depth' | 'temperature'
  ): number | null => {
    if (rawDisplayValue === '') return null;
    const parsed = Number(rawDisplayValue);
    if (!Number.isFinite(parsed)) return null;
    return convertValueBetweenSystems(parsed, kind, unitSystem, 'metric');
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
                <Controller
                  name={key}
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <NumberInput
                          value={
                            key === 'depth'
                              ? toDisplayNumber(field.value, 'depth')
                              : key === 'water_temp'
                                ? toDisplayNumber(field.value, 'temperature')
                                : (field.value ?? '')
                          }
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (key === 'depth') {
                              field.onChange(toMetricNumber(raw, 'depth'));
                              return;
                            }
                            if (key === 'water_temp') {
                              field.onChange(toMetricNumber(raw, 'temperature'));
                              return;
                            }
                            const val = raw === '' ? null : Number(raw);
                            field.onChange(val);
                          }}
                          onBlur={field.onBlur}
                          disabled={isSubmitting}
                          className="text-base"
                          min={key === 'duration' || key === 'depth' ? 1 : undefined}
                          aria-invalid={!!errors[key]}
                          aria-describedby={errors[key] ? `${key}-error` : undefined}
                        />
                        <span className="text-sm text-muted-foreground">{unit}</span>
                      </div>
                      {errors[key] && (
                        <span id={`${key}-error`} className="text-xs text-destructive" role="alert">
                          {errors[key]?.message as string}
                        </span>
                      )}
                    </div>
                  )}
                />
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
            <Controller
              name="dive_type"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger aria-invalid={!!errors.dive_type}>
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
                      <SelectItem value="lake_river">Lake/River</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.dive_type && (
                    <span className="text-xs text-destructive" role="alert">
                      {errors.dive_type?.message as string}
                    </span>
                  )}
                </div>
              )}
            />
          ) : (
            <p className="text-2xl font-bold text-foreground capitalize">
              {dive.dive_type === 'lake_river' ? 'Lake/River' : (dive.dive_type ?? 'N/A')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DiveStats;
