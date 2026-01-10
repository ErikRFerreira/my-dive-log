import { Droplet, Weight, Wind } from 'lucide-react';

import { Input } from '@/components/ui/input';
import type { UnitSystem } from '@/shared/constants';

import { CURRENT_OPTIONS, DIVE_TYPES } from '../options';
import type { LogDiveFormData } from '../types';

type Props = {
  formData: LogDiveFormData;
  localUnitSystem: UnitSystem;
  onChange: <K extends keyof LogDiveFormData>(field: K, value: LogDiveFormData[K]) => void;
};

export default function DiveInfoStep({ formData, localUnitSystem, onChange }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Dive Information</h2>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Dive Type</label>
        <div className="grid grid-cols-4 gap-3">
          {DIVE_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange('diveType', type.value)}
              className={`p-4 rounded-lg border-2 transition-all text-center hover:border-teal-400 ${
                formData.diveType === type.value
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          <Droplet className="w-4 h-4 inline mr-2 text-blue-500" />
          Water Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['salt', 'fresh'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange('waterType', type)}
              className={`p-4 rounded-lg border-2 transition-all hover:border-blue-400 ${
                formData.waterType === type
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-base font-medium capitalize">{type}water</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
          <Wind className="w-4 h-4 text-slate-500" />
          Currents
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CURRENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange('currents', option.value)}
              className={`p-4 rounded-lg border-2 transition-all hover:border-blue-400 ${
                formData.currents === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-base font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
          <Weight className="w-4 h-4 text-slate-500" />
          Weight ({localUnitSystem === 'metric' ? 'kg' : 'lbs'})
        </label>
        <Input
          type="number"
          value={formData.weight}
          onChange={(e) => onChange('weight', e.target.value)}
          placeholder={localUnitSystem === 'metric' ? 'e.g., 6' : 'e.g., 13'}
          className="text-base"
        />
      </div>
    </div>
  );
}

