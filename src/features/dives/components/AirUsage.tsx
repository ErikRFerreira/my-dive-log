import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wind } from 'lucide-react';
import type { Dive } from '../types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit } from '@/shared/utils/units';

type NumericField = keyof Pick<
  Dive,
  'depth' | 'duration' | 'water_temp' | 'start_pressure' | 'end_pressure' | 'air_usage' | 'weight'
>;

interface AirUsageProps {
  dive: Dive;
  isEditMode: boolean;
  onNumberChange: (field: NumericField) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function AirUsage({ dive, isEditMode, onNumberChange }: AirUsageProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  return (
    <section className="flex-col">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Air Usage</h3>
        </div>
        <button type="button" className="text-primary hover:text-primary/80 font-medium">
          Edit
        </button>
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl">
        <CardContent className="p-6 space-y-4">
          {(
            [
              { label: 'Start Pressure', key: 'start_pressure', unit: 'bar' },
              { label: 'End Pressure', key: 'end_pressure', unit: 'bar' },
              { label: 'Total Used', key: 'air_usage', unit: 'bar' },
            ] as const
          ).map(({ label, key, unit }, idx) => {
            const val = dive[key];
            const display =
              val !== null && val !== undefined
                ? formatValueWithUnit(val, 'pressure', unitSystem)
                : 'N/A';
            return (
              <div
                key={key}
                className={
                  idx === 2
                    ? 'flex justify-between items-center pt-2 border-t border-border'
                    : 'flex justify-between items-center'
                }
              >
                <p className="text-sm text-muted-foreground">{label}</p>
                {isEditMode ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={(val as number | string | null) ?? ''}
                      type="number"
                      min={1}
                      step="any"
                      onChange={onNumberChange(key)}
                      className="w-24"
                      placeholder="N/A"
                    />
                    <span className="text-muted-foreground">{unit}</span>
                  </div>
                ) : (
                  <p className="font-semibold text-foreground">{display}</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}

export default AirUsage;
