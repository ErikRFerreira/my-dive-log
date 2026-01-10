import { GAS_OPTIONS } from '../options';
import type { LogDiveFormData } from '../types';
import { Input } from '@/components/ui/input';
import type { UnitSystem } from '@/shared/constants';

type Props = {
  formData: LogDiveFormData;
  localUnitSystem: UnitSystem;
  onChange: <K extends keyof LogDiveFormData>(field: K, value: LogDiveFormData[K]) => void;
};

export default function GasUsageStep({ formData, localUnitSystem, onChange }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Gas Usage</h2>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Gas Mix</label>
        <div className="grid grid-cols-2 gap-3">
          {GAS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange('gasMix', option.value)}
              className={`p-4 rounded-lg border-2 transition-all hover:border-teal-400 ${
                formData.gasMix === option.value
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-base font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Starting Pressure ({localUnitSystem === 'metric' ? 'bar' : 'psi'})
          </label>
          <Input
            type="number"
            value={formData.startingPressure}
            onChange={(e) => onChange('startingPressure', e.target.value)}
            placeholder={localUnitSystem === 'metric' ? 'e.g., 200' : 'e.g., 3000'}
            className="text-base"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Ending Pressure ({localUnitSystem === 'metric' ? 'bar' : 'psi'})
          </label>
          <Input
            type="number"
            value={formData.endingPressure}
            onChange={(e) => onChange('endingPressure', e.target.value)}
            placeholder={localUnitSystem === 'metric' ? 'e.g., 50' : 'e.g., 700'}
            className="text-base"
          />
        </div>
      </div>
    </div>
  );
}

