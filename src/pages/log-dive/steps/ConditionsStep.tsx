import { Eye, FileText, Thermometer } from 'lucide-react';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import type { UnitSystem } from '@/shared/constants';

import { VISIBILITY_OPTIONS } from '../utils/options';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import type { LogDiveFormData, LogDiveFormInput } from '../schema/schema';

type Props = {
  control: Control<LogDiveFormInput, unknown, LogDiveFormData>;
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
  const temperatureLimits =
    localUnitSystem === 'metric' ? { min: -2, max: 40 } : { min: 28, max: 104 };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Water Conditions</h2>

      <div>
        <label
          htmlFor="conditions-water-temperature"
          className="text-sm font-medium text-foreground flex items-center gap-2 mb-2"
        >
          <Thermometer className="w-4 h-4 text-teal-500" aria-hidden="true" />
          Water Temperature ({localUnitSystem === 'metric' ? '°C' : '°F'})
        </label>
        <NumberInput
          id="conditions-water-temperature"
          value={waterTempField.value}
          onChange={(e) => waterTempField.onChange(e.target.value)}
          onBlur={waterTempField.onBlur}
          placeholder={localUnitSystem === 'metric' ? 'e.g., 24' : 'e.g., 75'}
          min={temperatureLimits.min}
          max={temperatureLimits.max}
          aria-invalid={Boolean(waterTempState.error?.message)}
          aria-describedby={
            waterTempState.error?.message ? 'conditions-water-temperature-error' : undefined
          }
          className="text-base"
        />
        {waterTempState.error?.message && (
          <p id="conditions-water-temperature-error" className="mt-1 text-sm text-destructive">
            {waterTempState.error.message}
          </p>
        )}
      </div>

      <div>
        <label
          id="conditions-visibility-label"
          className="text-sm font-medium text-foreground mb-3 block"
        >
          <Eye className="w-4 h-4 inline mr-2 text-cyan-500" aria-hidden="true" />
          Visibility
        </label>
        <div
          className="grid grid-cols-2 gap-3"
          role="radiogroup"
          aria-labelledby="conditions-visibility-label"
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => visibilityField.onChange(option.value)}
              role="radio"
              aria-checked={visibilityField.value === option.value}
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
        <label
          htmlFor="conditions-notes"
          className="text-sm font-medium text-foreground mb-2 block"
        >
          <FileText className="w-4 h-4 inline mr-2 text-slate-500" aria-hidden="true" />
          Dive Notes
        </label>
        <Textarea
          id="conditions-notes"
          placeholder="Add any notes about your dive experience..."
          value={notesField.value}
          onChange={(e) => notesField.onChange(e.target.value)}
          onBlur={notesField.onBlur}
          rows={6}
          aria-invalid={Boolean(notesState.error?.message)}
          aria-describedby={notesState.error?.message ? 'conditions-notes-error' : undefined}
          className="text-base"
        />
        {notesState.error?.message && (
          <p id="conditions-notes-error" className="mt-1 text-sm text-destructive">
            {notesState.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
