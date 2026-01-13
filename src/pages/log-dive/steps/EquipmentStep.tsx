import { Gauge, Plus, Shield, Weight, X } from 'lucide-react';
import { useState } from 'react';
import { useController, useFieldArray, useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { CYLINDER_SIZES, CYLINDER_TYPES, EXPOSURE_OPTIONS } from '../utils/options';
import type { LogDiveFormData } from '../schema/schema';

type Props = {
  control: Control<LogDiveFormData, unknown, LogDiveFormData>;
};

export default function EquipmentStep({ control }: Props) {
  const { field: exposureField } = useController({ name: 'exposure', control });
  const { field: cylinderTypeField } = useController({ name: 'cylinderType', control });
  const { field: cylinderSizeField } = useController({ name: 'cylinderSize', control });
  const { field: weightField, fieldState: weightState } = useController({
    name: 'weight',
    control,
  });
  const { field: weightUnitField } = useController({
    name: 'weightUnit',
    control,
  });

  const { fields: equipmentFields, append: appendEquipment, remove: removeEquipment } = useFieldArray({
    control,
    name: 'equipment',
  });
  const equipment = useWatch({ control, name: 'equipment' }) ?? [];

  const [equipmentInput, setEquipmentInput] = useState('');

  const addEquipment = () => {
    const value = equipmentInput.trim();
    if (!value) return;
    appendEquipment(value);
    setEquipmentInput('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Exposure & Equipment</h2>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          <Shield className="w-4 h-4 inline mr-2 text-purple-500" />
          Exposure Protection
        </label>
        <div className="grid grid-cols-2 gap-3">
          {EXPOSURE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => exposureField.onChange(option.value)}
              className={`p-4 rounded-lg border-2 transition-all hover:border-purple-400 ${
                exposureField.value === option.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-sm font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          <Gauge className="w-4 h-4 inline mr-2 text-orange-500" />
          Cylinder Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CYLINDER_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => cylinderTypeField.onChange(type.value)}
              className={`p-4 rounded-lg border-2 transition-all hover:border-orange-400 ${
                cylinderTypeField.value === type.value
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-base font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Cylinder Size</label>
        <div className="grid grid-cols-4 gap-3">
          {CYLINDER_SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => cylinderSizeField.onChange(size.value)}
              className={`p-4 rounded-lg border-2 transition-all hover:border-teal-400 ${
                cylinderSizeField.value === size.value
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-sm font-medium">{size.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Weight className="w-4 h-4 text-slate-500" />
            Weight ({weightUnitField.value === 'metric' ? 'kg' : 'lbs'})
          </label>
          <div className="flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => weightUnitField.onChange('metric')}
              className={`px-2 py-1 text-xs ${
                weightUnitField.value === 'metric'
                  ? 'bg-teal-500 text-white'
                  : 'bg-transparent text-muted-foreground'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => weightUnitField.onChange('imperial')}
              className={`px-2 py-1 text-xs ${
                weightUnitField.value === 'imperial'
                  ? 'bg-teal-500 text-white'
                  : 'bg-transparent text-muted-foreground'
              }`}
            >
              lbs
            </button>
          </div>
        </div>
        <Input
          type="number"
          value={weightField.value}
          onChange={(e) => weightField.onChange(e.target.value)}
          onBlur={weightField.onBlur}
          placeholder={weightUnitField.value === 'metric' ? 'e.g., 6' : 'e.g., 13'}
          className="text-base"
        />
        {weightState.error?.message && (
          <p className="mt-1 text-sm text-destructive">{weightState.error.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Equipment Used</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {equipmentFields.map((field, index) => (
            <span
              key={field.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-200"
            >
              {equipment[index] ?? ''}
              <button
                type="button"
                onClick={() => removeEquipment(index)}
                className="hover:text-teal-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add equipment (e.g., BCD, Regulator)"
            value={equipmentInput}
            onChange={(e) => setEquipmentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addEquipment();
              }
            }}
            className="text-base"
          />
          <Button type="button" onClick={addEquipment} className="bg-teal-500 hover:bg-teal-600">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

    </div>
  );
}
