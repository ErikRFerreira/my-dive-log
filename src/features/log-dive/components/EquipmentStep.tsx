import { ChevronsUpDown, Gauge, Plus, Shield, Weight, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { useController } from 'react-hook-form';

import type { Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { TAG_ITEM_LIMIT, TAG_LIST_LIMIT } from '@/shared/constants';

import { CYLINDER_SIZES, CYLINDER_TYPES, EXPOSURE_OPTIONS } from '../utils/options';
import type { LogDiveFormData, LogDiveFormInput } from '../schema/schema';

type Props = {
  control: Control<LogDiveFormInput, unknown, LogDiveFormData>;
};


/**
 * Step 3 of dive logging wizard: Equipment and exposure protection.
 *
 * Collects gear-related information:
 * - Exposure Protection: Wetsuit, drysuit, shorty, or skin
 * - Cylinder Type: Aluminum or steel
 * - Cylinder Size: Common tank sizes (80, 100, etc. cu ft)
 * - Weight: Amount of lead used with unit conversion (kg/lbs)
 * - Equipment List: Custom tags for additional gear
 *
 * Features:
 * - Dynamic equipment tag management (add/remove)
 * - Weight validation with unit-appropriate maximums
 * - Keyboard support (Enter key) for adding equipment
 */
export default function EquipmentStep({ control }: Props) {
  const { field: exposureField } = useController({ name: 'exposure', control });
  const { field: cylinderTypeField } = useController({ name: 'cylinderType', control });
  const { field: cylinderSizeField } = useController({ name: 'cylinderSize', control });
  const { field: weightField, fieldState: weightState } = useController({
    name: 'weight',
    control,
  });
  const { field: unitSystemField } = useController({
    name: 'unitSystem',
    control,
  });

  // Equipment list management
  const { field: equipmentField } = useController({ name: 'equipment', control });
  // Ensure equipment is always an array (form may initialize as undefined)
  const equipment: NonNullable<LogDiveFormInput['equipment']> = Array.isArray(equipmentField.value)
    ? equipmentField.value
    : [];

  // Temporary input for adding new equipment items
  const [equipmentInput, setEquipmentInput] = useState('');
  const canAddEquipment = equipment.length < TAG_LIST_LIMIT;

  /**
   * Adds an equipment item to the list.
   * Validates input is non-empty and clears input field after adding.
   */
  const addEquipment = () => {
    const value = equipmentInput.trim();
    if (!value || !canAddEquipment) return;
    equipmentField.onChange([...equipment, value]);
    setEquipmentInput('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Exposure & Equipment</h2>

      <div>
        <label
          id="exposure-protection-label"
          className="text-sm font-medium text-foreground mb-3 block"
        >
          <Shield className="w-4 h-4 inline mr-2 text-purple-500" aria-hidden="true" />
          Exposure Protection
        </label>
        <div
          className="grid grid-cols-2 gap-3"
          role="radiogroup"
          aria-labelledby="exposure-protection-label"
        >
          {EXPOSURE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => exposureField.onChange(option.value)}
              role="radio"
              aria-checked={exposureField.value === option.value}
              className={`p-4 rounded-lg border-2 transition-all hover:border-purple-400 ${
                exposureField.value === option.value
                  ? 'border-purple-500 bg-purple-950'
                  : 'border-slate-700'
              }`}
            >
              <div className="text-sm font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label id="cylinder-type-label" className="text-sm font-medium text-foreground mb-3 block">
          <Gauge className="w-4 h-4 inline mr-2 text-orange-500" aria-hidden="true" />
          Cylinder Type
        </label>
        <div
          className="grid grid-cols-2 gap-3"
          role="radiogroup"
          aria-labelledby="cylinder-type-label"
        >
          {CYLINDER_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => cylinderTypeField.onChange(type.value)}
              role="radio"
              aria-checked={cylinderTypeField.value === type.value}
              className={`p-4 rounded-lg border-2 transition-all hover:border-orange-400 ${
                cylinderTypeField.value === type.value
                  ? 'border-orange-500 bg-orange-950'
                  : 'border-slate-700'
              }`}
            >
              <div className="text-base font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label id="cylinder-size-label" className="text-sm font-medium text-foreground mb-3 block">
          <ChevronsUpDown className="w-4 h-4 inline mr-2 text-teal-500" aria-hidden="true" />
          Cylinder Size
        </label>
        <div
          className="grid grid-cols-4 gap-3"
          role="radiogroup"
          aria-labelledby="cylinder-size-label"
        >
          {CYLINDER_SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => cylinderSizeField.onChange(size.value)}
              role="radio"
              aria-checked={cylinderSizeField.value === size.value}
              className={`p-4 rounded-lg border-2 transition-all hover:border-teal-400 ${
                cylinderSizeField.value === size.value
                  ? 'border-teal-500 bg-teal-950'
                  : 'border-slate-700'
              }`}
            >
              <div className="text-sm font-medium">{size.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="dive-weight"
            className="text-sm font-medium text-foreground flex items-center gap-2"
          >
            <Weight className="w-4 h-4 text-slate-500" aria-hidden="true" />
            Weight ({unitSystemField.value === 'metric' ? 'kg' : 'lbs'})
          </label>
        </div>
        <NumberInput
          id="dive-weight"
          value={weightField.value}
          onChange={(e) => weightField.onChange(e.target.value)}
          onBlur={weightField.onBlur}
          placeholder={unitSystemField.value === 'metric' ? 'e.g., 6' : 'e.g., 13'}
          min={1}
          max={unitSystemField.value === 'metric' ? 20 : 44}
          step="1"
          aria-invalid={Boolean(weightState.error?.message)}
          aria-describedby={weightState.error?.message ? 'dive-weight-error' : undefined}
          className="text-base"
        />
        {!weightState.error?.message && (
          <p className="mt-1 text-xs text-muted-foreground">
            Max {unitSystemField.value === 'metric' ? '20 kg' : '44.1 lbs'}.
          </p>
        )}
        {weightState.error?.message && (
          <p id="dive-weight-error" className="mt-1 text-sm text-destructive">
            {weightState.error.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="equipment-input" className="text-sm font-medium text-foreground">
            <Wrench className="w-4 h-4 inline mr-2 text-slate-500" aria-hidden="true" />
            Equipment Used
          </label>
          <span className="text-xs text-muted-foreground">
            {equipment.length}/{TAG_LIST_LIMIT}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {equipment.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-teal-900 text-teal-200"
            >
              {item}
              <button
                type="button"
                onClick={() =>
                  equipmentField.onChange(equipment.filter((_, itemIndex) => itemIndex !== index))
                }
                className="hover:text-teal-900"
                aria-label={`Remove ${item || 'equipment'}`}
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            id="equipment-input"
            type="text"
            placeholder="Add equipment (e.g., BCD, Regulator)"
            maxLength={TAG_ITEM_LIMIT}
            value={equipmentInput}
            onChange={(e) => setEquipmentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addEquipment();
              }
            }}
            className="text-base"
            disabled={!canAddEquipment}
          />
          <Button
            type="button"
            onClick={addEquipment}
            className="bg-teal-500 hover:bg-teal-600"
            disabled={!canAddEquipment}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add
          </Button>
        </div>
        {!canAddEquipment && (
          <p className="mt-2 text-xs text-muted-foreground">
            Limit {TAG_LIST_LIMIT} items. Remove one to add more.
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Max {TAG_ITEM_LIMIT} characters per item.
        </p>
      </div>
    </div>
  );
}

