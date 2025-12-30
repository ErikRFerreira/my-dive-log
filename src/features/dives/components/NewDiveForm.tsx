import { Controller, useForm } from 'react-hook-form';
import { useMemo } from 'react';

import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { COUNTRIES } from '../../../shared/data/countries';
import { useAddDive } from '../hooks/useAddDive';
import { useGetLocations } from '../hooks/useGetLocations';
import { createDiveSchema, type CreateDiveInput } from '../schemas/createDiveSchema';
import type { NewDiveInput } from '../types';
import CountryCombobox from './CountryCombobox';

type SubmittedDive = {
  date: string;
  locationName: string;
  locationCountry: string | null;
  depth: number;
  duration: number;
  notes?: string | null;
};

type NewDiveFormProps = {
  onSubmit?: (data: SubmittedDive) => void;
  onCancel?: () => void;
};

function NewDiveForm({ onSubmit, onCancel }: NewDiveFormProps) {
  const { mutateAdd, isPending } = useAddDive();
  const { locations, isLoading: isLoadingLocations } = useGetLocations();

  const countryNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    COUNTRIES.forEach((c) => map.set(c.code.toUpperCase(), c.name));
    return map;
  }, []);

  // Get today's date in yyyy-mm-dd format
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<CreateDiveInput>({
    resolver: zodResolver(createDiveSchema),
    defaultValues: {
      date: today,
      location: '',
      depth: undefined,
      duration: undefined,
      notes: '',
      country_code: '',
    },
    mode: 'onBlur',
  });

  const submit = (data: CreateDiveInput) => {
    const countryName = countryNameByCode.get(data.country_code.toUpperCase()) ?? '';

    const payload: NewDiveInput = {
      date: data.date,
      locationName: data.location,
      locationCountry: countryName || null,
      locationCountryCode: data.country_code,
      depth: data.depth,
      duration: data.duration,
      notes: data.notes || null,
    };

    mutateAdd(payload, {
      onSuccess: (created) => {
        if (!created) {
          console.error('Add dive mutation returned null');
          toast.error('Failed to log dive. Please try again.');
          return;
        }

        const submitData: SubmittedDive = {
          date: created.date,
          locationName: created.locations?.name ?? '',
          locationCountry: created.locations?.country ?? null,
          depth: created.depth,
          duration: created.duration,
        };
        if (created.notes) submitData.notes = created.notes;

        toast.success('Dive logged successfully');
        onSubmit?.(submitData);
        reset();
        onCancel?.();
      },
      onError: (err) => {
        console.error('Failed to add dive:', err);
        toast.error('Failed to log dive. Please try again.');
      },
    });
  };

  const cancel = () => {
    if (onCancel) onCancel();
    else reset();
  };

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-4" autoComplete="off">
      <Field>
        <FieldLabel htmlFor="date">Date</FieldLabel>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Input
              id="date"
              type="date"
              aria-invalid={!!errors.date}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
            />
          )}
        />
        {errors.date && <FieldError>{errors.date.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="location">Location/Dive Site</FieldLabel>
        <Input
          id="location"
          type="text"
          disabled={isLoadingLocations}
          placeholder="Ex: Manta Point, Nusa Penida"
          aria-invalid={!!errors.location}
          autoComplete="off"
          list="location-suggestions"
          {...register('location')}
        />
        {errors.location && <FieldError>{errors.location.message}</FieldError>}
        <datalist id="location-suggestions">
          {locations.map((l) => (
            <option key={l.id} value={l.name} />
          ))}
        </datalist>
      </Field>

      <Field>
        <FieldLabel htmlFor="country_code">Country</FieldLabel>
        <Controller
          name="country_code"
          control={control}
          render={({ field }) => <CountryCombobox field={field} />}
        />
        {errors.country_code && <FieldError>{errors.country_code.message}</FieldError>}
      </Field>

      <div className="flex gap-4">
        <div className="flex-1">
          <Field>
            <FieldLabel htmlFor="depth">Depth (meters)</FieldLabel>
            <Input
              id="depth"
              type="number"
              placeholder="18"
              step="0.1"
              min={0}
              aria-invalid={!!errors.depth}
              {...register('depth', { valueAsNumber: true })}
            />
            {errors.depth && <FieldError>{errors.depth.message}</FieldError>}
          </Field>
        </div>
        <div className="flex-1">
          <Field>
            <FieldLabel htmlFor="duration">Duration (minutes)</FieldLabel>
            <Input
              id="duration"
              type="number"
              placeholder="35"
              step="1"
              min={1}
              aria-invalid={!!errors.duration}
              {...register('duration', { valueAsNumber: true })}
            />
            {errors.duration && <FieldError>{errors.duration.message}</FieldError>}
          </Field>
        </div>
      </div>

      <Field>
        <FieldLabel htmlFor="notes">Notes</FieldLabel>
        <textarea
          id="notes"
          rows={4}
          placeholder="Any observations or conditions..."
          aria-invalid={!!errors.notes}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register('notes')}
        />
        {errors.notes && <FieldError>{errors.notes.message}</FieldError>}
      </Field>

      <div className="flex gap-2 pt-4 border-t">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Dive'}
        </Button>
        <Button type="button" variant="outline" onClick={cancel} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default NewDiveForm;
