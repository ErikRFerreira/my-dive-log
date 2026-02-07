import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAddDive } from '@/features/dives/hooks/useAddDive';
import { useSettingsStore } from '@/store/settingsStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

import type { LogDiveFormData, LogDiveFormInput } from '@/features/log-dive/schema/schema';
import { logDiveSchema } from '@/features/log-dive/schema/schema';
import { buildNewDivePayload } from '@/features/log-dive/utils/mappers';
import EssentialsStep from '@/features/log-dive/components/EssentialsStep';
import DiveInfoStep from '@/features/log-dive/components/DiveInfoStep';
import EquipmentStep from '@/features/log-dive/components/EquipmentStep';
import GasUsageStep from '@/features/log-dive/components/GasUsageStep';
import { useWizardState } from '@/features/log-dive/useWizardState';
import { useDraftPersistence } from '@/features/log-dive/useDraftPersistence';
import { WizardProgress } from '@/features/log-dive/components/WizardProgress';

/**
 * Multi-step dive logging wizard component.
 *
 * Manages a 4-step form flow using React Hook Form for state management.
 * Persists draft data to localStorage to prevent data loss on page refresh.
 *
 * Flow:
 * 1. Essentials - Date, location, depth, duration (required fields)
 * 2. Dive Details - Water conditions, equipment, wildlife
 * 3. Equipment - Dive gear used
 * 4. Gas Usage - Cylinder and gas mix information
 *
 * Features:
 * - Step validation before advancing
 * - Draft persistence in localStorage
 * - Ability to save and log another dive
 * - Cancel navigation with fallback to dashboard
 */
function LogDivePage() {
  const navigate = useNavigate();
  const defaultUnitSystem = useSettingsStore((s) => s.unitSystem);
  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem);
  const { mutateAdd, isPending } = useAddDive();

  const DRAFT_KEY = 'dive-log:logDiveDraft';
  const submitIntentRef = useRef<'save' | 'saveAnother'>('save');
  const [draftRestored, setDraftRestored] = useState(false);

  /**
   * Default form values memoized to prevent unnecessary re-renders.
   */
  const defaultValues = useMemo<LogDiveFormInput>(() => {
    return {
      date: new Date().toISOString().split('T')[0],
      countryCode: '',
      location: '',
      maxDepth: '',
      duration: '',
      diveType: '',
      waterType: '',
      exposure: '',
      currents: '',
      weight: '',
      waterTemp: '',
      unitSystem: defaultUnitSystem as 'metric' | 'imperial',
      visibility: '',
      equipment: [],
      wildlife: [],
      notes: '',
      cylinderType: '',
      cylinderSize: '',
      gasMix: '',
      nitroxPercent: 32,
      startingPressure: '',
      endingPressure: '',
    };
  }, [defaultUnitSystem]);

  // React Hook Form setup
  const { control, setValue, handleSubmit, trigger, reset, watch } = useForm<
    LogDiveFormInput,
    unknown,
    LogDiveFormData
  >({
    defaultValues,
    resolver: zodResolver(logDiveSchema),
    shouldUnregister: false,
  });

  // Wizard state management
  const { step, handleNext, handleBack, resetToStart, isFirstStep, isLastStep } = useWizardState({
    totalSteps: 4,
    onValidateStep: async (currentStep: number) => {
      if (currentStep === 1) {
        return await trigger(['date', 'countryCode', 'location', 'maxDepth', 'duration']);
      }
      return true;
    },
  });

  // Draft persistence management
  const formData = watch();
  const { loadDraft, clearDraft } = useDraftPersistence({
    key: DRAFT_KEY,
    data: formData,
    enabled: draftRestored,
  });

  /**
   * Restore draft from localStorage on mount.
   */
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      if (draft.unitSystem) {
        setUnitSystem(draft.unitSystem);
      }
      reset({ ...defaultValues, ...draft });
    }
    setDraftRestored(true);
  }, [loadDraft, defaultValues, reset, setUnitSystem]);

  /**
   * Cancels the dive logging process.
   * Uses browser back navigation if available, otherwise redirects to dashboard.
   */
  const onCancel = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  };

  /**
   * Form submission handler.
   * Validates, submits, clears draft, and handles post-save navigation.
   */
  const onSubmit = handleSubmit(
    (values) => {
      const { payload, blockingError } = buildNewDivePayload({
        formData: values,
      });
      if (blockingError) {
        toast.error(blockingError);
        resetToStart();
        return;
      }

      mutateAdd(payload, {
        onSuccess: (created: unknown) => {
          if (!created) {
            toast.error('Failed to log dive. Please try again.');
            return;
          }
          toast.success('Dive logged successfully');
          clearDraft();

          if (submitIntentRef.current === 'saveAnother') {
            reset({
              ...defaultValues,
              date: new Date().toISOString().split('T')[0],
            });
            resetToStart();
            return;
          }
          navigate('/dashboard');
        },
        onError: (err: Error) => {
          console.error('Failed to log dive:', err);
          toast.error('Failed to log dive. Please try again.');
        },
      });
    },
    (errors) => {
      const firstError = Object.values(errors)[0] as unknown;
      const message =
        firstError &&
        typeof firstError === 'object' &&
        firstError !== null &&
        'message' in firstError &&
        typeof firstError.message === 'string'
          ? firstError.message
          : 'Please complete the required fields first.';
      toast.error(message);
      resetToStart();
    }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={onCancel} className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Log a New Dive</h1>
              <p className="text-muted-foreground">Document your underwater adventure</p>
            </div>
          </div>
        </div>

        <WizardProgress
          currentStep={step}
          totalSteps={4}
          stepLabels={['Essentials', 'Dive Details', 'Equipment', 'Gas Usage']}
        />

        <Card className="p-8 max-[991px]:px-6 max-[991px]:-mt-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">
          {step === 1 && <EssentialsStep control={control} setValue={setValue} />}
          {step === 2 && <DiveInfoStep control={control} />}
          {step === 3 && <EquipmentStep control={control} />}
          {step === 4 && <GasUsageStep control={control} />}

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep || isPending}
              className="px-6 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {!isLastStep ? (
              <Button
                onClick={handleNext}
                disabled={isPending}
                className="px-6 bg-primary hover:bg-primary/90"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    submitIntentRef.current = 'saveAnother';
                    onSubmit();
                  }}
                  disabled={isPending}
                  className="px-6"
                >
                  Save & Log Another
                </Button>
                <Button
                  onClick={() => {
                    submitIntentRef.current = 'save';
                    onSubmit();
                  }}
                  disabled={isPending}
                  className="px-8 bg-primary hover:bg-primary/90"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LogDivePage;
