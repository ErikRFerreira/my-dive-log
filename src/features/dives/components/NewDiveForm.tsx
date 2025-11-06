import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newDiveSchema, type DiveInput } from '../validation';
import type { Dive } from '../types';

type NewDiveFormProps = {
  onSubmit?: (data: Pick<Dive, 'date' | 'location' | 'depth' | 'duration' | 'notes'>) => void;
  onCancel?: () => void;
};

function NewDiveForm({ onSubmit, onCancel }: NewDiveFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DiveInput>({
    resolver: zodResolver(newDiveSchema),
    defaultValues: {
      date: '',
      location: '',
      depth: 0,
      duration: 0,
      notes: '',
    },
  });

  const submit = (data: DiveInput) => {
    const payload: Pick<Dive, 'date' | 'location' | 'depth' | 'duration' | 'notes'> = {
      date: data.date,
      location: data.location.trim(),
      depth: data.depth,
      duration: data.duration,
      notes: data.notes?.trim() || undefined,
    };
    onSubmit?.(payload);
  };

  const cancel = () => {
    if (onCancel) onCancel();
    else reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <h2>Log a New Dive</h2>

      <div>
        <label htmlFor="date">Date</label>
        <input id="date" type="date" aria-invalid={!!errors.date} {...register('date')} />
        {errors.date && <small style={{ color: 'red' }}>{errors.date.message}</small>}
      </div>

      <div>
        <label htmlFor="location">Location</label>
        <input
          id="location"
          type="text"
          placeholder="Great Barrier Reef"
          aria-invalid={!!errors.location}
          {...register('location')}
        />
        {errors.location && <small style={{ color: 'red' }}>{errors.location.message}</small>}
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
          {...register('depth', { valueAsNumber: true })}
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
          {...register('duration', { valueAsNumber: true })}
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
          {...register('notes')}
        />
        {errors.notes && <small style={{ color: 'red' }}>{errors.notes.message}</small>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button type="button" onClick={cancel}>
          Cancel
        </button>
        <button type="submit">Log Dive</button>
      </div>
    </form>
  );
}

export default NewDiveForm;
