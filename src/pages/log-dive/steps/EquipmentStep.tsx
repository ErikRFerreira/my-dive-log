import { Gauge, Plus, Shield, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { CYLINDER_SIZES, CYLINDER_TYPES, EXPOSURE_OPTIONS } from '../options';
import type { LogDiveFormData } from '../types';

type Props = {
  formData: LogDiveFormData;
  onChange: <K extends keyof LogDiveFormData>(field: K, value: LogDiveFormData[K]) => void;
  addEquipment: () => void;
  removeEquipment: (index: number) => void;
  addWildlife: () => void;
  removeWildlife: (index: number) => void;
  setEquipmentLastValue: (value: string) => void;
  setWildlifeLastValue: (value: string) => void;
};

export default function EquipmentStep({
  formData,
  onChange,
  addEquipment,
  removeEquipment,
  addWildlife,
  removeWildlife,
  setEquipmentLastValue,
  setWildlifeLastValue,
}: Props) {
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
              onClick={() => onChange('exposure', option.value)}
              className={`p-4 rounded-lg border-2 transition-all hover:border-purple-400 ${
                formData.exposure === option.value
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
              onClick={() => onChange('cylinderType', type.value)}
              className={`p-4 rounded-lg border-2 transition-all hover:border-orange-400 ${
                formData.cylinderType === type.value
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
              onClick={() => onChange('cylinderSize', size.value)}
              className={`p-4 rounded-lg border-2 transition-all hover:border-teal-400 ${
                formData.cylinderSize === size.value
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
        <label className="text-sm font-medium text-foreground mb-2 block">Equipment Used</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.equipment.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-200"
            >
              {item}
              <button type="button" onClick={() => removeEquipment(index)} className="hover:text-teal-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add equipment (e.g., BCD, Regulator)"
            value={formData.equipment[formData.equipment.length - 1] ?? ''}
            onChange={(e) => setEquipmentLastValue(e.target.value)}
            className="text-base"
          />
          <Button type="button" onClick={addEquipment} className="bg-teal-500 hover:bg-teal-600">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Wildlife Observed</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.wildlife.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
            >
              {item}
              <button type="button" onClick={() => removeWildlife(index)} className="hover:text-blue-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add wildlife (e.g., Sea Turtle, Reef Shark)"
            value={formData.wildlife[formData.wildlife.length - 1] ?? ''}
            onChange={(e) => setWildlifeLastValue(e.target.value)}
            className="text-base"
          />
          <Button type="button" onClick={addWildlife} className="bg-blue-500 hover:bg-blue-600">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

