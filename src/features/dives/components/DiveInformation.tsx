import { Card, CardContent } from '@/components/ui/card';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import type { Dive } from '../types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit, getUnitLabel } from '@/shared/utils/units';

interface DiveInformationProps {
  dive: Dive;
  isEditing: boolean;
}

function EditableDiveInformation() {
  const {
    control,
    formState: { errors = {}, isSubmitting = false },
  } = useFormContext();

  return (
    <div className="grid md:grid-cols-5 gap-6 divide-x divide-border">
      <div className="md:pr-6">
        <p className="text-sm font-semibold text-muted-foreground mb-2">Visibility</p>
        <Controller
          name="visibility"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={isSubmitting}>
                <SelectTrigger aria-invalid={!!errors.visibility}>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                </SelectContent>
              </Select>
              {errors.visibility && (
                <span className="text-xs text-destructive" role="alert">
                  {errors.visibility?.message as string}
                </span>
              )}
            </div>
          )}
        />
      </div>

      <div className="md:px-6">
        <p className="text-sm font-semibold text-muted-foreground mb-2">Water Type</p>
        <Controller
          name="water_type"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={isSubmitting}>
                <SelectTrigger aria-invalid={!!errors.water_type}>
                  <SelectValue placeholder="Select water type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salt">Salt Water</SelectItem>
                  <SelectItem value="fresh">Fresh Water</SelectItem>
                </SelectContent>
              </Select>
              {errors.water_type && (
                <span className="text-xs text-destructive" role="alert">
                  {errors.water_type?.message as string}
                </span>
              )}
            </div>
          )}
        />
      </div>

      <div className="md:px-6">
        <p className="text-sm font-semibold text-muted-foreground mb-2">Exposure Protection</p>
        <Controller
          name="exposure"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={isSubmitting}>
                <SelectTrigger aria-invalid={!!errors.exposure}>
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
              {errors.exposure && (
                <span className="text-xs text-destructive" role="alert">
                  {errors.exposure?.message as string}
                </span>
              )}
            </div>
          )}
        />
      </div>

      <div className="md:px-6">
        <p className="text-sm font-semibold text-muted-foreground mb-2">Currents</p>
        <Controller
          name="currents"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={isSubmitting}>
                <SelectTrigger aria-invalid={!!errors.currents}>
                  <SelectValue placeholder="Select currents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                </SelectContent>
              </Select>
              {errors.currents && (
                <span className="text-xs text-destructive" role="alert">
                  {errors.currents?.message as string}
                </span>
              )}
            </div>
          )}
        />
      </div>

      <div className="md:pl-6">
        <p className="text-sm font-semibold text-muted-foreground mb-2">Weight (kg)</p>
        <Controller
          name="weight"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <NumberInput
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  field.onChange(val);
                }}
                onBlur={field.onBlur}
                placeholder="0"
                disabled={isSubmitting}
                aria-invalid={!!errors.weight}
                aria-describedby={errors.weight ? 'weight-error' : undefined}
              />
              {errors.weight && (
                <span id="weight-error" className="text-xs text-destructive" role="alert">
                  {errors.weight?.message as string}
                </span>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}

function DiveInformation({ dive, isEditing }: DiveInformationProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  return (
    <>
      <div className="flex items-center gap-2 mb-3 px-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-foreground text-lg font-semibold">Dive Information</h3>
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl">
        <CardContent className="p-6">
          {isEditing ? (
            <EditableDiveInformation />
          ) : (
            <div className="grid md:grid-cols-5 gap-6 divide-x divide-border">
              <div className="md:pr-6">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Visibility</p>
                <p className="text-foreground capitalize">{dive.visibility ?? 'N/A'}</p>
              </div>

              <div className="md:px-6">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Water Type</p>
                <p className="text-foreground capitalize">
                  {dive.water_type === 'salt'
                    ? 'Salt Water'
                    : dive.water_type === 'fresh'
                      ? 'Fresh Water'
                      : 'N/A'}
                </p>
              </div>

              <div className="md:px-6">
                <p className="text-sm font-semibold text-muted-foreground mb-2">
                  Exposure Protection
                </p>
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
              </div>

              <div className="md:px-6">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Currents</p>
                <p className="text-foreground capitalize">{dive.currents ?? 'N/A'}</p>
              </div>

              <div className="md:pl-6">
                <p className="text-sm font-semibold text-muted-foreground mb-2">
                  Weight ({getUnitLabel('weight', unitSystem)})
                </p>
                <p className="text-foreground">
                  {dive.weight !== null && dive.weight !== undefined
                    ? formatValueWithUnit(dive.weight, 'weight', unitSystem)
                    : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default DiveInformation;
