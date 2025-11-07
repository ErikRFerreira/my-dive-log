import { useForm } from 'react-hook-form';

import { useAddDive } from '../hooks/useAddDive';

import type { Dive } from '../types';
import { COUNTRIES } from '../../../shared/data/countries';
import toast from 'react-hot-toast';

type SubmittedDive = Pick<Dive, 'date' | 'location' | 'country' | 'depth' | 'duration'> & {
  notes?: Dive['notes'];
};

type NewDiveFormProps = {
  onSubmit?: (data: SubmittedDive) => void;
  onCancel?: () => void;
};

// Local form input type
interface DiveInput {
  date: string;
  location: string;
  countryCode: string;
  depth: number;
  duration: number;
  notes?: string;
}

function NewDiveForm({ onSubmit, onCancel }: NewDiveFormProps) {
  const { mutateAdd, isPending } = useAddDive();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DiveInput>({
    defaultValues: {
      date: '',
      location: '',
      depth: 1,
      duration: 1,
      notes: '',
      countryCode: '',
    },
    mode: 'onBlur',
  });

  const submit = (raw: DiveInput) => {
    // Normalize / sanitize
    const data: DiveInput = {
      ...raw,
      location: raw.location.trim(),
      notes: raw.notes?.trim() ?? '',
      countryCode: raw.countryCode.toUpperCase(),
    };

    const countryName =
      COUNTRIES.find((c) => c.code.toUpperCase() === data.countryCode)?.name ?? '';

    const payload: Dive = {
      // generate random id for now; real id will be from backend
      id: Math.random().toString(36).substring(2, 9),
      userId: 'user123',
      ...data,
      country: countryName,
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
        onCancel?.(); // parent should close modal
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
    <form noValidate onSubmit={handleSubmit(submit)}>
      <h2>Log a New Dive</h2>

      <div>
        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          aria-invalid={!!errors.date}
          {...register('date', {
            required: 'Date is required',
          })}
        />
        {errors.date && <small style={{ color: 'red' }}>{errors.date.message}</small>}
      </div>

      <div>
        <label htmlFor="location">Location</label>
        <input
          id="location"
          type="text"
          placeholder="Great Barrier Reef"
          aria-invalid={!!errors.location}
          {...register('location', {
            required: 'Location is required',
            validate: (v) => v.trim().length > 0 || 'Location is required',
          })}
        />
        {errors.location && <small style={{ color: 'red' }}>{errors.location.message}</small>}
      </div>

      <div>
        <label htmlFor="countryCode">Country</label>
        <select
          id="countryCode"
          aria-invalid={!!errors.countryCode}
          {...register('countryCode', {
            required: 'Select a country',
            validate: (v) => v.trim().length === 2 || 'Select a country',
          })}
        >
          <option value="">Select country</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.countryCode && <small style={{ color: 'red' }}>{errors.countryCode.message}</small>}
      </div>

      <div>
        <label htmlFor="depth">Depth (meters)</label>
        <input
          id="depth"
          type="number"
          placeholder="18"
          step="0.1"
          min={0}
          aria-invalid={!!errors.depth}
          {...register('depth', {
            valueAsNumber: true,
            required: 'Depth is required',
            min: { value: 0, message: 'Depth must be >= 0' },
          })}
        />
        {errors.depth && <small style={{ color: 'red' }}>{errors.depth.message}</small>}
      </div>

      <div>
        <label htmlFor="duration">Duration (minutes)</label>
        <input
          id="duration"
          type="number"
          placeholder="35"
          step="1"
          min={1}
          aria-invalid={!!errors.duration}
          {...register('duration', {
            valueAsNumber: true,
            required: 'Duration is required',
            min: { value: 1, message: 'Duration must be >= 1' },
          })}
        />
        {errors.duration && <small style={{ color: 'red' }}>{errors.duration.message}</small>}
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          rows={4}
          placeholder="Any observations or conditions..."
          aria-invalid={!!errors.notes}
          {...register('notes', {
            validate: (v) => (v?.trim()?.length ?? 0) <= 500 || 'Notes must be <= 500 characters',
          })}
        />
        {errors.notes && <small style={{ color: 'red' }}>{errors.notes.message}</small>}
      </div>

      <div>
        <button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Dive'}
        </button>
        <button type="button" onClick={cancel} disabled={isPending}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default NewDiveForm;
