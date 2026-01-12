import { Thermometer } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { UnitSystem } from '@/shared/constants';

import { VISIBILITY_OPTIONS } from '../options';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import type { LogDiveFormData } from '../schema';

type Props = {
  control: Control<LogDiveFormData, unknown, LogDiveFormData>;
  localUnitSystem: UnitSystem;
};

export default function ConditionsStep({ control, localUnitSystem }: Props) {
  const { field: waterTempField, fieldState: waterTempState } = useController({
    name: 'waterTemp',
    control,
  });
  const { field: visibilityField } = useController({ name: 'visibility', control });
  const { field: notesField, fieldState: notesState } = useController({
    name: 'notes',
    control,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Water Conditions</h2>

      <div>
        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
          <Thermometer className="w-4 h-4 text-teal-500" />
          Water Temperature ({localUnitSystem === 'metric' ? '°C' : '°F'})
        </label>
        <Input
          type="number"
          value={waterTempField.value}
          onChange={(e) => waterTempField.onChange(e.target.value)}
          onBlur={waterTempField.onBlur}
          placeholder={localUnitSystem === 'metric' ? 'e.g., 24' : 'e.g., 75'}
          className="text-base"
        />
        {waterTempState.error?.message && (
          <p className="mt-1 text-sm text-destructive">{waterTempState.error.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Visibility</label>
        <div className="grid grid-cols-2 gap-3">
          {VISIBILITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => visibilityField.onChange(option.value)}
              className={`p-4 rounded-lg border-2 transition-all hover:border-teal-400 ${
                visibilityField.value === option.value
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-base font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Dive Notes</label>
        <Textarea
          placeholder="Add any notes about your dive experience..."
          value={notesField.value}
          onChange={(e) => notesField.onChange(e.target.value)}
          onBlur={notesField.onBlur}
          rows={6}
          className="text-base"
        />
        {notesState.error?.message && (
          <p className="mt-1 text-sm text-destructive">{notesState.error.message}</p>
        )}
      </div>
    </div>
  );
}
