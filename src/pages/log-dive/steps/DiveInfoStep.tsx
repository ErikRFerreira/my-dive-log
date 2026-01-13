import {
  Droplet,
  Plus,
  Thermometer,
  Wind,
  X,
  Anchor,
  Star,
  Map,
  Moon,
  Award,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';
import { useController, useFieldArray, useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { CURRENT_OPTIONS, DIVE_TYPES, VISIBILITY_OPTIONS } from '../utils/options';

import type { LogDiveFormData } from '../schema/schema';

type Props = {
  control: Control<LogDiveFormData, unknown, LogDiveFormData>;
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

  const {
    fields: wildlifeFields,
    append: appendWildlife,
    remove: removeWildlife,
  } = useFieldArray({
    control,
    name: 'wildlife',
  });
  const wildlife = useWatch({ control, name: 'wildlife' }) ?? [];
  const [wildlifeInput, setWildlifeInput] = useState('');

  const addWildlife = () => {
    const value = wildlifeInput.trim();
    if (!value) return;
    appendWildlife(value as any);
    setWildlifeInput('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Dive Information</h2>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          <MapPin className="w-4 h-4 inline mr-2 text-teal-500" />
          Dive Type
        </label>
        <div className="grid grid-cols-4 gap-3">
          {DIVE_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => diveTypeField.onChange(type.value)}
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
        <label className="text-sm font-medium text-foreground mb-3 block">
          <Droplet className="w-4 h-4 inline mr-2 text-blue-500" />
          Water Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['salt', 'fresh'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => waterTypeField.onChange(type)}
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
        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
          <Wind className="w-4 h-4 text-slate-500" />
          Currents
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CURRENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => currentsField.onChange(option.value)}
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
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-teal-500" />
            Water Temperature ({temperatureUnitField.value === 'metric' ? 'C' : 'F'})
          </label>
          <div className="flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => temperatureUnitField.onChange('metric')}
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
          type="number"
          value={waterTempField.value}
          onChange={(e) => waterTempField.onChange(e.target.value)}
          onBlur={waterTempField.onBlur}
          placeholder={temperatureUnitField.value === 'metric' ? 'e.g., 24' : 'e.g., 75'}
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
        <label className="text-sm font-medium text-foreground mb-2 block">Wildlife Observed</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {wildlifeFields.map((field, index) => (
            <span
              key={field.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
            >
              {wildlife[index] ?? ''}
              <button
                type="button"
                onClick={() => removeWildlife(index)}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
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
          >
            <Plus className="w-4 h-4" />
          </button>
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
