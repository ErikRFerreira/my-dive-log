import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';

import { useAddDive } from '../hooks/useAddDive';

import type { NewDiveInput } from '../types';
import { COUNTRIES } from '../../../shared/data/countries';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDiveSchema, type CreateDiveInput } from '../schemas/createDiveSchema';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetLocations } from '../hooks/useGetLocations';

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<CreateDiveInput>({
    resolver: zodResolver(createDiveSchema),
    defaultValues: {
      date: '',
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
          placeholder="ex: Great Barrier Reef"
          aria-invalid={!!errors.location}
          autoComplete='off'
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
          render={({ field }) => <CountryCombobox field={field} error={errors.country_code} />}
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

type CountryComboboxProps = {
  field: {
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
  };
  error?: unknown;
};

function CountryCombobox({ field }: CountryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!field.value) {
      setQuery('');
      return;
    }

    const match = COUNTRIES.find((c) => c.code.toUpperCase() === field.value.toUpperCase());
    setQuery(match?.name ?? field.value);
  }, [field.value]);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return COUNTRIES.slice(0, 40);

    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(trimmed)).slice(0, 40);
  }, [query]);

  return (
    <div className="relative">
      <Input
        id={field.name}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="country-options"
        placeholder="Type to search…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          field.onBlur();
          window.setTimeout(() => setIsOpen(false), 100);
        }}
      />

      {isOpen && (
        <div
          id="country-options"
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                role="option"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  field.onChange(c.code);
                  setQuery(c.name);
                  setIsOpen(false);
                }}
              >
                {c.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NewDiveForm;
