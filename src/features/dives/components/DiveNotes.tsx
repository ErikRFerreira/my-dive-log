import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { useDebouncedCallback } from '@/shared/utils/useDebouncedCallback';
import type { Dive } from '../types';

interface DiveNotesProps {
  dive: Dive;
  isEditing: boolean;
}

function DiveNotes({ dive, isEditing }: DiveNotesProps) {
  const formContext = isEditing ? useFormContext() : null;
  const {
    control,
    formState: { errors = {}, isSubmitting = false } = {},
    trigger,
  } = formContext || {};

  // Debounce validation for better performance
  const debouncedTrigger = useDebouncedCallback(() => {
    if (trigger) trigger('notes');
  }, 500);

  return (
    <section className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 px-2">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="text-foreground text-lg font-semibold">Notes</h3>
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl h-full flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col">
          {isEditing ? (
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <div className="flex-1 flex flex-col">
                  <Textarea
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      debouncedTrigger();
                    }}
                    onBlur={field.onBlur}
                    className="flex-1"
                    placeholder="Add notes..."
                    disabled={isSubmitting}
                    aria-invalid={!!errors.notes}
                    aria-describedby={errors.notes ? 'notes-error' : undefined}
                  />
                  {errors.notes && (
                    <span id="notes-error" className="text-xs text-destructive mt-2" role="alert">
                      {errors.notes?.message as string}
                    </span>
                  )}
                </div>
              )}
            />
          ) : (
            <p className="text-foreground leading-relaxed flex-1">{dive.notes ?? 'N/A'}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default DiveNotes;
