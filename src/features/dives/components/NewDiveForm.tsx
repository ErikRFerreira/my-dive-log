import { Controller, useForm } from 'react-hook-form';

import { useAddDive } from '../hooks/useAddDive';

import type { NewDiveInput } from '../types';
import { COUNTRIES } from '../../../shared/data/countries';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDiveSchema, type CreateDiveInput } from '../schemas/createDiveSchema';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';

type SubmittedDive = Pick<NewDiveInput, 'date' | 'location' | 'country' | 'depth' | 'duration'> & {
  notes?: NewDiveInput['notes'];
};

type NewDiveFormProps = {
  onSubmit?: (data: SubmittedDive) => void;
  onCancel?: () => void;
};

function NewDiveForm({ onSubmit, onCancel }: NewDiveFormProps) {
  const { mutateAdd, isPending } = useAddDive();

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
    const countryName =
      COUNTRIES.find((c) => c.code.toUpperCase() === data.country_code.toUpperCase())?.name ?? '';

    const payload: NewDiveInput = {
      date: data.date,
      location: data.location,
      country: countryName,
      depth: data.depth,
      duration: data.duration,
      notes: data.notes || '',
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
          location: created.location,
          country: created.country,
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
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Log a New Dive</h2>

      <Field>
        <FieldLabel htmlFor="date">Date</FieldLabel>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(new Date(field.value), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                  onSelect={(date) => {
                    field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.date && <FieldError>{errors.date.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="location">Location</FieldLabel>
        <Input
          id="location"
          type="text"
          placeholder="Great Barrier Reef"
          aria-invalid={!!errors.location}
          {...register('location')}
        />
        {errors.location && <FieldError>{errors.location.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="countryCode">Country</FieldLabel>
        <Controller
          name="countryCode"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.country_code && <FieldError>{errors.country_code.message}</FieldError>}
      </Field>

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
