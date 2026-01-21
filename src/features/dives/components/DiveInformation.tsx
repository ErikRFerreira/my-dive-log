import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Dive, Visibility, WaterType, Exposure, Currents } from '../types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit, getUnitLabel } from '@/shared/utils/units';
import { useUpdateDive } from '../hooks/useUpdateDive';

interface DiveInformationProps {
  dive: Dive;
  isEditing: boolean;
  isSaving: boolean;
  editedFields: EditableFields;
  onFieldChange: (field: keyof EditableFields, value: EditableFields[keyof EditableFields]) => void;
}

type EditableFields = {
  visibility: Visibility | null | undefined;
  water_type: WaterType | null | undefined;
  exposure: Exposure | null | undefined;
  currents: Currents | null | undefined;
  weight: number | null | undefined;
};

function DiveInformation({
  dive,
  isEditing,
  isSaving,
  editedFields,
  onFieldChange,
}: DiveInformationProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [localFields, setLocalFields] = useState<EditableFields>({
    visibility: dive.visibility ?? null,
    water_type: dive.water_type ?? null,
    exposure: dive.exposure ?? null,
    currents: dive.currents ?? null,
    weight: dive.weight ?? null,
  });
  const { mutateAsync: updateDive, isPending: isLocalSaving } = useUpdateDive();
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const isEditingActive = isEditing || localIsEditing;
  const fields = isEditing ? editedFields : localFields;
  const isSavingActive = isEditing ? isSaving : isLocalSaving;

  useEffect(() => {
    if (isEditing) {
      setLocalIsEditing(false);
      setLocalFields({
        visibility: dive.visibility ?? null,
        water_type: dive.water_type ?? null,
        exposure: dive.exposure ?? null,
        currents: dive.currents ?? null,
        weight: dive.weight ?? null,
      });
    } else if (!localIsEditing) {
      setLocalFields({
        visibility: dive.visibility ?? null,
        water_type: dive.water_type ?? null,
        exposure: dive.exposure ?? null,
        currents: dive.currents ?? null,
        weight: dive.weight ?? null,
      });
    }
  }, [dive, isEditing, localIsEditing]);

  const hasChanges = Object.keys(localFields).some(
    (key) => localFields[key as keyof EditableFields] !== (dive[key as keyof Dive] ?? null)
  );

  const handleSelectChange = (field: keyof EditableFields, value: string) => {
    if (isEditing) {
      onFieldChange(field, value as Visibility | WaterType | Exposure | Currents);
      return;
    }
    setLocalFields((prev) => ({
      ...prev,
      [field]: value as Visibility | WaterType | Exposure | Currents,
    }));
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? null : Number(e.target.value);
    if (isEditing) {
      onFieldChange('weight', val);
      return;
    }
    setLocalFields((prev) => ({ ...prev, weight: val }));
  };

  const handleEdit = () => {
    setLocalFields({
      visibility: dive.visibility ?? null,
      water_type: dive.water_type ?? null,
      exposure: dive.exposure ?? null,
      currents: dive.currents ?? null,
      weight: dive.weight ?? null,
    });
    setLocalIsEditing(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }
    setLocalFields({
      visibility: dive.visibility ?? null,
      water_type: dive.water_type ?? null,
      exposure: dive.exposure ?? null,
      currents: dive.currents ?? null,
      weight: dive.weight ?? null,
    });
    setLocalIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateDive({
        id: dive.id,
        diveData: localFields,
      });
      setLocalIsEditing(false);
    } catch (error) {
      console.error('Failed to save dive information:', error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2 ">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Dive Information</h3>
        </div>
        {isEditing ? (
          <button
            type="button"
            className="text-primary/60 cursor-not-allowed font-medium"
            aria-label="Edit dive information"
            disabled
          >
            Edit
          </button>
        ) : !localIsEditing ? (
          <button
            type="button"
            onClick={handleEdit}
            className="text-primary hover:text-primary/80 font-medium"
            aria-label="Edit dive information"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSavingActive || !hasChanges}
              size="sm"
              className="gap-1 h-8 bg-primary hover:bg-primary/90"
            >
              <Check className="w-4 h-4" />
              {isSavingActive ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isSavingActive}
              size="sm"
              variant="outline"
              className="gap-1 h-8"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-5 gap-6 divide-x divide-border">
            <div className="md:pr-6">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Visibility</p>
              {isEditingActive ? (
                <Select
                  value={fields.visibility ?? ''}
                  onValueChange={(value) => handleSelectChange('visibility', value)}
                  disabled={isSavingActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground capitalize">{dive.visibility ?? 'N/A'}</p>
              )}
            </div>

            <div className="md:px-6">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Water Type</p>
              {isEditingActive ? (
                <Select
                  value={fields.water_type ?? ''}
                  onValueChange={(value) => handleSelectChange('water_type', value)}
                  disabled={isSavingActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select water type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salt">Salt Water</SelectItem>
                    <SelectItem value="fresh">Fresh Water</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground capitalize">
                  {dive.water_type === 'salt'
                    ? 'Salt Water'
                    : dive.water_type === 'fresh'
                      ? 'Fresh Water'
                      : 'N/A'}
                </p>
              )}
            </div>

            <div className="md:px-6">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Exposure Protection
              </p>
              {isEditingActive ? (
                <Select
                  value={fields.exposure ?? ''}
                  onValueChange={(value) => handleSelectChange('exposure', value)}
                  disabled={isSavingActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exposure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wet-2mm">Wetsuit (2mm)</SelectItem>
                    <SelectItem value="wet-3mm">Wetsuit (3mm)</SelectItem>
                    <SelectItem value="wet-5mm">Wetsuit (5mm)</SelectItem>
                    <SelectItem value="wet-7mm">Wetsuit (7mm)</SelectItem>
                    <SelectItem value="semi-dry">Semy-dry suit</SelectItem>
                    <SelectItem value="dry">Dry suit</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground capitalize">
                  {dive.exposure === 'wet-2mm'
                    ? 'Wetsuit (2mm)'
                    : dive.exposure === 'wet-3mm'
                      ? 'Wetsuit (3mm)'
                      : dive.exposure === 'wet-5mm'
                        ? 'Wetsuit (5mm)'
                        : dive.exposure === 'wet-7mm'
                          ? 'Wetsuit (7mm)'
                          : dive.exposure === 'semi-dry'
                            ? 'Semi-dry suit'
                            : dive.exposure === 'dry'
                              ? 'Dry suit'
                              : 'N/A'}
                </p>
              )}
            </div>

            <div className="md:px-6">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Currents</p>
              {isEditingActive ? (
                <Select
                  value={fields.currents ?? ''}
                  onValueChange={(value) => handleSelectChange('currents', value)}
                  disabled={isSavingActive}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground capitalize">{dive.currents ?? 'N/A'}</p>
              )}
            </div>

            <div className="md:pl-6">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Weight ({isEditing ? 'kg' : getUnitLabel('weight', unitSystem)})
              </p>
              {isEditingActive ? (
                <NumberInput
                  value={fields.weight ?? ''}
                  onChange={handleWeightChange}
                  placeholder="0"
                  disabled={isSavingActive}
                />
              ) : (
                <p className="text-foreground">
                  {dive.weight !== null && dive.weight !== undefined
                    ? formatValueWithUnit(dive.weight, 'weight', unitSystem)
                    : 'N/A'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default DiveInformation;
