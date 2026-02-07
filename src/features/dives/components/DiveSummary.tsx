import InlineSpinner from '@/components/common/InlineSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ScrollText } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { useDebouncedCallback } from '@/shared/utils/useDebouncedCallback';
import type { Dive } from '../types';
import { useMutation } from '@tanstack/react-query';
import { getDiveSummaryFromAPI } from '@/services/apiAI';
import toast from 'react-hot-toast';

interface DiveSummaryProps {
  dive: Dive;
  isEditing: boolean;
}

type EditableDiveSummaryProps = {
  dive: Dive;
};

function EditableDiveSummary({ dive }: EditableDiveSummaryProps) {
  const {
    control,
    formState: { errors = {}, isSubmitting = false },
    trigger,
    setValue,
  } = useFormContext();

  // Debounce validation for better performance
  const debouncedTrigger = useDebouncedCallback(() => {
    void trigger('summary');
  }, 500);

  const { mutateAsync: generateSummary, isPending: isGenerating } = useMutation<string, Error>({
    mutationFn: () => getDiveSummaryFromAPI(dive),
    onSuccess: (generatedSummary) => {
      if (setValue)
        setValue('summary', generatedSummary, { shouldDirty: true, shouldValidate: true });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleGenerate = async () => {
    try {
      await generateSummary();
    } catch {
      toast.error('Failed to generate summary. Please try again.');
    }
  };

  return (
    <>
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || isSubmitting}
        size="sm"
        className="absolute top-2 right-2 z-10 gap-2 bg-purple-600 hover:bg-purple-700 text-white"
      >
        <Sparkles className="w-4 h-4" />
        {isGenerating ? (
          <>
            Generating... <InlineSpinner />
          </>
        ) : (
          'Generate'
        )}
      </Button>
      <Controller
        name="summary"
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
              className="min-h-full h-full resize-none pt-14"
              placeholder="Add summary..."
              disabled={isSubmitting}
              aria-invalid={!!errors.summary}
              aria-describedby={errors.summary ? 'summary-error' : undefined}
            />
            {errors.summary && (
              <span id="summary-error" className="text-xs text-destructive mt-2" role="alert">
                {errors.summary?.message as string}
              </span>
            )}
          </div>
        )}
      />
    </>
  );
}

function DiveSummary({ dive, isEditing }: DiveSummaryProps) {

  return (
    <section className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 px-2">
        <ScrollText className="w-5 h-5 text-primary" />
        <h3 className="text-foreground text-lg font-semibold">Dive Summary</h3>
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl flex-1 flex flex-col">
        <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col relative">
            {isEditing ? (
              <EditableDiveSummary dive={dive} />
            ) : (
              <p className="text-foreground whitespace-pre-line">{dive.summary ?? 'N/A'}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default DiveSummary;
