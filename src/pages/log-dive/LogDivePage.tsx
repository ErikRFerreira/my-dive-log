import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

import { useSettingsStore } from '@/store/settingsStore';
import { useAddDive } from '@/features/dives/hooks/useAddDive';
import { useGetLocations } from '@/features/dives/hooks/useGetLocations';

import type { LogDiveFormData } from './schema';
import { logDiveSchema } from './schema';
import { buildNewDivePayload } from './mappers';
import EssentialsStep from './steps/EssentialsStep';
import DiveInfoStep from './steps/DiveInfoStep';
import EquipmentStep from './steps/EquipmentStep';
import GasUsageStep from './steps/GasUsageStep';

// Multi-step log dive flow: RHF stores form state; step UI uses controlled values.
function LogDivePage() {
  const navigate = useNavigate();
  const defaultUnitSystem = useSettingsStore((s) => s.unitSystem);
  const { mutateAdd, isPending } = useAddDive();
  const { locations, isLoading: isLoadingLocations } = useGetLocations();

  const [step, setStep] = useState(1);

  // Stable defaults for form state and field arrays.
  const defaultValues = useMemo<LogDiveFormData>(
    () => ({
      date: new Date().toISOString().split('T')[0],
      countryCode: '',
      location: '',
      maxDepth: '',
      depthUnit: defaultUnitSystem,
      duration: '',
      diveType: '',
      waterType: '',
      exposure: '',
      currents: '',
      weight: '',
      weightUnit: defaultUnitSystem,
      waterTemp: '',
      temperatureUnit: defaultUnitSystem,
      visibility: '',
      equipment: [],
      wildlife: [],
      notes: '',
      cylinderType: '',
      cylinderSize: '',
      gasMix: '',
      nitroxPercent: 32,
      pressureUnit: defaultUnitSystem,
      startingPressure: '',
      endingPressure: '',
    }),
    []
  );

  const { control, setValue, handleSubmit, trigger } = useForm<
    LogDiveFormData,
    unknown,
    LogDiveFormData
  >({
    defaultValues,
    resolver: zodResolver(logDiveSchema),
    shouldUnregister: false,
  });

  // Gate step 1 with schema validation to avoid advancing with invalid inputs.
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

  // Move back one step in the wizard.
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Exit the flow, preferring history back when available.
  const onCancel = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  };

  // Submit handler: validate, map to payload, then persist.
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
          if (!created) {
            toast.error('Failed to log dive. Please try again.');
            return;
          }
          toast.success('Dive logged successfully');
          navigate('/dives');
        },
        onError: (err) => {
          console.error('Failed to log dive:', err);
          toast.error('Failed to log dive. Please try again.');
        },
      });
    },
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
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    s < step
                      ? 'bg-teal-500 text-white'
                      : s === step
                        ? 'bg-teal-500 text-white ring-4 ring-teal-200 dark:ring-teal-900'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      s < step ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs sm:text-sm">
            <span
              className={`${step === 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
            >
              Essentials
            </span>
            <span
              className={`${step === 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
            >
              Dive Details
            </span>
            <span
              className={`${step === 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
            >
              Equipment
            </span>
            <span
              className={`${step === 4 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
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
                className="px-6 bg-teal-500 hover:bg-teal-600"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={onSubmit}
                disabled={isPending}
                className="px-8 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Dive Log
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LogDivePage;
