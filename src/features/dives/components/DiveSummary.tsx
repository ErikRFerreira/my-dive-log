import InlineSpinner from '@/components/common/InlineSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ScrollText } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useDebouncedCallback } from '@/shared/utils/useDebouncedCallback';
import type { Dive } from '../types';
import { useMutation } from '@tanstack/react-query';
import { getDiveSummaryFromAPI, type DiveSummaryPayload } from '@/services/apiAI';
import toast from 'react-hot-toast';
import type { UpdateDiveInput } from '../schemas/updateDiveSchema';

interface DiveSummaryProps {
  dive: Dive;
  isEditing: boolean;
}

type EditableDiveSummaryProps = {
  dive: Dive;
};

type SummaryDraftValues = Partial<UpdateDiveInput>;

const trimNullableString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const pickNumber = (draftValue: unknown, fallback: number | null): number | null => {
  if (draftValue === undefined) return fallback;
  if (draftValue === null) return null;
  return typeof draftValue === 'number' && Number.isFinite(draftValue) ? draftValue : fallback;
};

const pickEnum = <T extends string>(draftValue: unknown, fallback: T | null): T | null => {
  if (draftValue === undefined) return fallback;
  if (draftValue === null) return null;
  return typeof draftValue === 'string' ? (draftValue as T) : fallback;
};

const pickStringList = (draftValue: unknown, fallback: string[] | null): string[] | null => {
  if (draftValue === undefined) return fallback;
  if (!Array.isArray(draftValue)) return fallback;
  const cleaned = draftValue
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);
  return cleaned.length > 0 ? cleaned : null;
};

export function buildSummaryPayloadFromDraft(
  dive: Dive,
  draftValues: SummaryDraftValues
): DiveSummaryPayload {
  const locationName = trimNullableString(draftValues.location) ?? dive.locations?.name ?? null;
  const locationCountry =
    trimNullableString(draftValues.country) ?? dive.locations?.country ?? null;

  return {
    location: locationName,
    country: locationCountry,
    locations: {
      name: locationName,
      country: locationCountry,
    },
    date: typeof draftValues.date === 'string' ? draftValues.date : dive.date,
    depth: pickNumber(draftValues.depth, dive.depth),
    duration: pickNumber(draftValues.duration, dive.duration),
    water_temp: pickNumber(draftValues.water_temp, dive.water_temp),
    visibility: pickEnum(draftValues.visibility, dive.visibility),
    dive_type: pickEnum(draftValues.dive_type, dive.dive_type),
    water_type: pickEnum(draftValues.water_type, dive.water_type),
    exposure: pickEnum(draftValues.exposure, dive.exposure),
    currents: pickEnum(draftValues.currents, dive.currents),
    weight: pickNumber(draftValues.weight, dive.weight),
    gas: pickEnum(draftValues.gas, dive.gas),
    nitrox_percent: pickNumber(draftValues.nitrox_percent, dive.nitrox_percent),
    start_pressure: pickNumber(draftValues.start_pressure, dive.start_pressure),
    end_pressure: pickNumber(draftValues.end_pressure, dive.end_pressure),
    air_usage: pickNumber(draftValues.air_usage, dive.air_usage),
    equipment: pickStringList(draftValues.equipment, dive.equipment),
    wildlife: pickStringList(draftValues.wildlife, dive.wildlife),
    notes:
      draftValues.notes === undefined ? dive.notes : trimNullableString(draftValues.notes),
    cylinder_type: dive.cylinder_type,
    cylinder_size: dive.cylinder_size,
  };
}

function EditableDiveSummary({ dive }: EditableDiveSummaryProps) {
  const {
    control,
    formState: { errors = {}, isSubmitting = false },
    trigger,
    setValue,
  } = useFormContext();
  const draftValues = useWatch({ control }) as SummaryDraftValues;

  // Debounce validation for better performance
  const debouncedTrigger = useDebouncedCallback(() => {
    void trigger('summary');
  }, 500);

  const { mutateAsync: generateSummary, isPending: isGenerating } = useMutation<string, Error>({
    mutationFn: () => getDiveSummaryFromAPI(buildSummaryPayloadFromDraft(dive, draftValues)),
    onSuccess: (generatedSummary) => {
      if (setValue)
        setValue('summary', generatedSummary, { shouldDirty: true, shouldValidate: true });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleGenerate = () => {
    void generateSummary();
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
          'Generate AI Summary'
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
