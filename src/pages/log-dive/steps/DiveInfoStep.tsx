import { Droplet, MapPin, Plus, Thermometer, Wind, X } from 'lucide-react';
import { useState } from 'react';
import { useController } from 'react-hook-form';

import type { Control } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { CURRENT_OPTIONS, DIVE_TYPES, VISIBILITY_OPTIONS } from '../utils/options';

import type { LogDiveFormData, LogDiveFormInput } from '../schema/schema';

type Props = {
  control: Control<LogDiveFormInput, unknown, LogDiveFormData>;
};

export default function DiveInfoStep({ control }: Props) {
  const { field: diveTypeField } = useController({ name: 'diveType', control });
  const { field: waterTypeField } = useController({ name: 'waterType', control });
  const { field: currentsField } = useController({ name: 'currents', control });
  const { field: waterTempField, fieldState: waterTempState } = useController({
    name: 'waterTemp',
    control,
  });
  const { field: temperatureUnitField } = useController({ name: 'temperatureUnit', control });
  const { field: visibilityField } = useController({ name: 'visibility', control });
  const { field: notesField, fieldState: notesState } = useController({ name: 'notes', control });
  const temperatureLimits =
    temperatureUnitField.value === 'metric' ? { min: -2, max: 40 } : { min: 28, max: 104 };

  const { field: wildlifeField } = useController({ name: 'wildlife', control });
  const wildlife: NonNullable<LogDiveFormInput['wildlife']> = Array.isArray(
    wildlifeField.value
  )
    ? wildlifeField.value
    : [];
  const [wildlifeInput, setWildlifeInput] = useState('');

  const addWildlife = () => {
    const value = wildlifeInput.trim();
    if (!value) return;
    wildlifeField.onChange([...wildlife, value]);
    setWildlifeInput('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Dive Information</h2>

      <div>
        <label id="dive-type-label" className="text-sm font-medium text-foreground mb-3 block">
          <MapPin className="w-4 h-4 inline mr-2 text-teal-500" aria-hidden="true" />
          Dive Type
        </label>
        <div className="grid grid-cols-4 gap-3" role="radiogroup" aria-labelledby="dive-type-label">
          {DIVE_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => diveTypeField.onChange(type.value)}
              role="radio"
              aria-checked={diveTypeField.value === type.value}
              className={`p-4 rounded-lg border-2 transition-all text-center hover:border-teal-400 ${
                diveTypeField.value === type.value
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label id="water-type-label" className="text-sm font-medium text-foreground mb-3 block">
          <Droplet className="w-4 h-4 inline mr-2 text-blue-500" aria-hidden="true" />
          Water Type
        </label>
        <div
          className="grid grid-cols-2 gap-3"
          role="radiogroup"
          aria-labelledby="water-type-label"
        >
          {(['salt', 'fresh'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => waterTypeField.onChange(type)}
              role="radio"
              aria-checked={waterTypeField.value === type}
              className={`p-4 rounded-lg border-2 transition-all hover:border-blue-400 ${
                waterTypeField.value === type
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
        <label
          id="currents-label"
          className="text-sm font-medium text-foreground flex items-center gap-2 mb-3"
        >
          <Wind className="w-4 h-4 text-slate-500" aria-hidden="true" />
          Currents
        </label>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="currents-label">
          {CURRENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => currentsField.onChange(option.value)}
              role="radio"
              aria-checked={currentsField.value === option.value}
              className={`p-4 rounded-lg border-2 transition-all hover:border-blue-400 ${
                currentsField.value === option.value
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
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="water-temperature"
            className="text-sm font-medium text-foreground flex items-center gap-2"
          >
            <Thermometer className="w-4 h-4 text-teal-500" aria-hidden="true" />
            Water Temperature ({temperatureUnitField.value === 'metric' ? 'C' : 'F'})
          </label>
          <div
            className="flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden"
            role="radiogroup"
            aria-label="Temperature unit"
          >
            <button
              type="button"
              onClick={() => temperatureUnitField.onChange('metric')}
              role="radio"
              aria-checked={temperatureUnitField.value === 'metric'}
              className={`px-2 py-1 text-xs ${
                temperatureUnitField.value === 'metric'
                  ? 'bg-teal-500 text-white'
                  : 'bg-transparent text-muted-foreground'
              }`}
            >
              C
            </button>
            <button
              type="button"
              onClick={() => temperatureUnitField.onChange('imperial')}
              role="radio"
              aria-checked={temperatureUnitField.value === 'imperial'}
              className={`px-2 py-1 text-xs ${
                temperatureUnitField.value === 'imperial'
                  ? 'bg-teal-500 text-white'
                  : 'bg-transparent text-muted-foreground'
              }`}
            >
              F
            </button>
          </div>
        </div>
        <Input
          id="water-temperature"
          type="number"
          value={waterTempField.value}
          onChange={(e) => waterTempField.onChange(e.target.value)}
          onBlur={waterTempField.onBlur}
          placeholder={temperatureUnitField.value === 'metric' ? 'e.g., 24' : 'e.g., 75'}
          min={temperatureLimits.min}
          max={temperatureLimits.max}
          aria-invalid={Boolean(waterTempState.error?.message)}
          aria-describedby={waterTempState.error?.message ? 'water-temperature-error' : undefined}
          className="text-base"
        />
        {waterTempState.error?.message && (
          <p id="water-temperature-error" className="mt-1 text-sm text-destructive">
            {waterTempState.error.message}
          </p>
        )}
      </div>

      <div>
        <label id="visibility-label" className="text-sm font-medium text-foreground mb-3 block">
          Visibility
        </label>
        <div
          className="grid grid-cols-2 gap-3"
          role="radiogroup"
          aria-labelledby="visibility-label"
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
        <label htmlFor="wildlife-input" className="text-sm font-medium text-foreground mb-2 block">
          Wildlife Observed
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {wildlife.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
            >
              {item}
              <button
                type="button"
                onClick={() =>
                  wildlifeField.onChange(wildlife.filter((_, itemIndex) => itemIndex !== index))
                }
                className="hover:text-blue-900"
                aria-label={`Remove ${item || 'wildlife'}`}
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            id="wildlife-input"
            type="text"
            placeholder="Add wildlife (e.g., Sea Turtle, Reef Shark)"
            value={wildlifeInput}
            onChange={(e) => setWildlifeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addWildlife();
              }
            }}
            className="text-base"
          />
          <button
            type="button"
            onClick={addWildlife}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 rounded-md"
            aria-label="Add wildlife"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="dive-notes" className="text-sm font-medium text-foreground mb-2 block">
          Dive Notes
        </label>
        <Textarea
          id="dive-notes"
          placeholder="Add any notes about your dive experience..."
          value={notesField.value}
          onChange={(e) => notesField.onChange(e.target.value)}
          onBlur={notesField.onBlur}
          rows={6}
          aria-invalid={Boolean(notesState.error?.message)}
          aria-describedby={notesState.error?.message ? 'dive-notes-error' : undefined}
          className="text-base"
        />
        {notesState.error?.message && (
          <p id="dive-notes-error" className="mt-1 text-sm text-destructive">
            {notesState.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
