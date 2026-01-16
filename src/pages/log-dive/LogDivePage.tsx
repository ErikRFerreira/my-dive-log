import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAddDive } from '@/features/dives/hooks/useAddDive';
import { useGetLocations } from '@/features/dives/hooks/useGetLocations';
import { useSettingsStore } from '@/store/settingsStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

import type { LogDiveFormData, LogDiveFormInput } from './schema/schema';
import { logDiveSchema } from './schema/schema';
import { buildNewDivePayload } from './utils/mappers';
import EssentialsStep from './steps/EssentialsStep';
import DiveInfoStep from './steps/DiveInfoStep';
import EquipmentStep from './steps/EquipmentStep';
import GasUsageStep from './steps/GasUsageStep';

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
  const { locations, isLoading: isLoadingLocations } = useGetLocations();

  // localStorage key for persisting draft dive data
  const DRAFT_KEY = 'logDiveDraft';
  // Current step in the 4-step wizard (1-4)
  const [step, setStep] = useState(1);
  // Tracks user's submit intent: navigate away or log another dive
  const submitIntentRef = useRef<'save' | 'saveAnother'>('save');
  // Prevents draft persistence during initial restoration
  const hasRestoredDraftRef = useRef(false);

  /**
   * Stable default values for the form.
   * Memoized to prevent unnecessary re-renders and form resets.
   * Uses user's preferred unit system from settings.
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
      unitSystem: defaultUnitSystem,
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

  // React Hook Form setup with Zod validation
  // shouldUnregister: false preserves data when switching steps
  const { control, setValue, handleSubmit, trigger, reset, watch } = useForm<
    LogDiveFormInput,
    unknown,
    LogDiveFormData
  >({
    defaultValues,
    resolver: zodResolver(logDiveSchema),
    shouldUnregister: false,
  });

  /**
   * Restore draft from localStorage on mount.
   * Only runs once after defaultValues are ready.
   * Merges draft data with defaults to handle schema changes.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      hasRestoredDraftRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<LogDiveFormInput>;
      if (parsed.unitSystem) {
        setUnitSystem(parsed.unitSystem);
      }
      reset({ ...defaultValues, ...parsed });
      setStep(1);
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    } finally {
      hasRestoredDraftRef.current = true;
    }
  }, [defaultValues, reset, setUnitSystem]);

  /**
   * Auto-save form data to localStorage as user types.
   * Prevents data loss from page refresh, navigation, or browser close.
   * Only persists after initial draft restoration to avoid race conditions.
   */
  useEffect(() => {
    // Don't start watching until restoration is complete
    if (!hasRestoredDraftRef.current) return;

    const subscription = watch((value) => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, hasRestoredDraftRef]);

  /**
   * Advances to the next step in the wizard.
   * Step 1 requires validation of required fields before advancing.
   * Shows error toast if validation fails.
   */
  const handleNext = async () => {
    if (step === 1) {
      const isValid = await trigger(['date', 'countryCode', 'location', 'maxDepth', 'duration']);
      if (!isValid) {
        toast.error('Please complete the required fields first.');
        return;
      }
    }
    if (step < 4) setStep(step + 1);
  };

  /**
   * Navigates to the previous step in the wizard.
   * Draft data is preserved when moving backward.
   */
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  /**
   * Cancels the dive logging process.
   * Uses browser back navigation if available, otherwise redirects to dashboard.
   * Draft data remains in localStorage for future sessions.
   */
  const onCancel = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  };

  /**
   * Form submission handler.
   *
   * Flow:
   * 1. Validates all form data against schema
   * 2. Maps form data to API payload format
   * 3. Submits to backend via mutation
   * 4. On success: clears draft, optionally resets form or navigates
   * 5. On error: shows toast and returns to step 1
   *
   * Respects submitIntentRef to determine post-save behavior:
   * - 'save': Navigate to dashboard
   * - 'saveAnother': Reset form and stay on page
   */
  const onSubmit = handleSubmit(
    (values) => {
      const { payload, blockingError } = buildNewDivePayload({
        formData: values,
      });
      if (blockingError) {
        toast.error(blockingError);
        setStep(1);
        return;
      }

      mutateAdd(payload, {
        onSuccess: (created) => {
          // Handle successful dive creation
          if (!created) {
            toast.error('Failed to log dive. Please try again.');
            return;
          }
          toast.success('Dive logged successfully');
          // Clear draft from localStorage after successful save
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(DRAFT_KEY);
          }
          // User clicked "Save & Log Another" - reset form with fresh date
          if (submitIntentRef.current === 'saveAnother') {
            reset({
              ...defaultValues,
              date: new Date().toISOString().split('T')[0],
            });
            setStep(1);
            return;
          }
          navigate('/dashboard');
        },
        onError: (err) => {
          console.error('Failed to log dive:', err);
          toast.error('Failed to log dive. Please try again.');
        },
      });
    },
    // Validation error handler - extracts first error message and returns to step 1
    (errors) => {
      const firstError = Object.values(errors)[0];
      const message =
        firstError && 'message' in firstError && typeof firstError.message === 'string'
          ? firstError.message
          : 'Please complete the required fields first.';
      toast.error(message);
      setStep(1);
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

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s, idx) => (
              <Fragment key={s}>
                {idx > 0 && (
                  <div
                    className={`flex-1 h-1 transition-all mx-1 ${
                      s <= step ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
                <div
                  className={`w-10 h-10 mx-3 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0 ${
                    s < step
                      ? 'bg-primary text-black'
                      : s === step
                        ? 'bg-primary text-black ring-4 ring-primary/80 dark:ring-primary/80'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
              </Fragment>
            ))}
          </div>
          <div className="flex mt-3 text-xs sm:text-sm justify-between">
            <span
              className={`text-center ${step === 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
            >
              Essentials
            </span>
            <span
              className={`text-center ${step === 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
            >
              Dive Details
            </span>
            <span
              className={`text-center ${step === 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
            >
              Equipment
            </span>
            <span
              className={`text-center ${step === 4 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
            >
              Gas Usage
            </span>
          </div>
        </div>

        <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">
          {step === 1 && (
            <EssentialsStep
              control={control}
              setValue={setValue}
              locations={locations}
              isLoadingLocations={isLoadingLocations}
            />
          )}
          {step === 2 && <DiveInfoStep control={control} />}
          {step === 3 && <EquipmentStep control={control} />}
          {step === 4 && <GasUsageStep control={control} />}

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isPending}
              className="px-6 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < 4 ? (
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
