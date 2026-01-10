import { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { UnitSystem } from '@/shared/constants';
import { useSettingsStore } from '@/store/settingsStore';
import { useAddDive } from '@/features/dives/hooks/useAddDive';
import { useGetLocations } from '@/features/dives/hooks/useGetLocations';

import type { LogDiveFormData } from './types';
import { buildNewDivePayload } from './mappers';
import EssentialsStep from './steps/EssentialsStep';
import DiveInfoStep from './steps/DiveInfoStep';
import EquipmentStep from './steps/EquipmentStep';
import ConditionsStep from './steps/ConditionsStep';
import GasUsageStep from './steps/GasUsageStep';

function LogDivePage() {
  const navigate = useNavigate();
  const defaultUnitSystem = useSettingsStore((s) => s.unitSystem);
  const { mutateAdd, isPending } = useAddDive();
  const { locations, isLoading: isLoadingLocations } = useGetLocations();

  const [step, setStep] = useState(1);
  const [localUnitSystem, setLocalUnitSystem] = useState<UnitSystem>(defaultUnitSystem);

  const [formData, setFormData] = useState<LogDiveFormData>({
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
    visibility: '',
    equipment: [],
    wildlife: [],
    notes: '',
    cylinderType: '',
    cylinderSize: '',
    gasMix: '',
    startingPressure: '',
    endingPressure: '',
  });

  const onChange = <K extends keyof LogDiveFormData>(field: K, value: LogDiveFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceedStep1 =
    formData.date &&
    formData.countryCode &&
    formData.location &&
    formData.maxDepth &&
    formData.duration;

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const onCancel = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  };

  const addEquipment = () => {
    const newEquipment = formData.equipment.filter((item) => item.trim()).concat('');
    setFormData((prev) => ({ ...prev, equipment: newEquipment }));
  };

  const removeEquipment = (index: number) => {
    const newEquipment = formData.equipment.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, equipment: newEquipment }));
  };

  const addWildlife = () => {
    const newWildlife = formData.wildlife.filter((item) => item.trim()).concat('');
    setFormData((prev) => ({ ...prev, wildlife: newWildlife }));
  };

  const removeWildlife = (index: number) => {
    const newWildlife = formData.wildlife.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, wildlife: newWildlife }));
  };

  const setEquipmentLastValue = (value: string) => {
    setFormData((prev) => {
      if (prev.equipment.length === 0) return { ...prev, equipment: [value] };
      const next = [...prev.equipment];
      next[next.length - 1] = value;
      return { ...prev, equipment: next };
    });
  };

  const setWildlifeLastValue = (value: string) => {
    setFormData((prev) => {
      if (prev.wildlife.length === 0) return { ...prev, wildlife: [value] };
      const next = [...prev.wildlife];
      next[next.length - 1] = value;
      return { ...prev, wildlife: next };
    });
  };

  const handleSubmit = () => {
    if (!canProceedStep1) {
      toast.error('Please complete the required fields first.');
      setStep(1);
      return;
    }

    const { payload, blockingError } = buildNewDivePayload({ formData, unitSystem: localUnitSystem });
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
  };

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
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <Button
                type="button"
                variant={localUnitSystem === 'metric' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLocalUnitSystem('metric')}
                className={localUnitSystem === 'metric' ? 'bg-teal-500 hover:bg-teal-600' : ''}
              >
                Metric
              </Button>
              <Button
                type="button"
                variant={localUnitSystem === 'imperial' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLocalUnitSystem('imperial')}
                className={localUnitSystem === 'imperial' ? 'bg-teal-500 hover:bg-teal-600' : ''}
              >
                Imperial
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((s) => (
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
                {s < 5 && (
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
            <span className={`${step === 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Essentials
            </span>
            <span className={`${step === 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Dive Info
            </span>
            <span className={`${step === 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Equipment
            </span>
            <span className={`${step === 4 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Conditions
            </span>
            <span className={`${step === 5 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Gas Usage
            </span>
          </div>
        </div>

        <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">
          {step === 1 && (
            <EssentialsStep
              formData={formData}
              localUnitSystem={localUnitSystem}
              onChange={onChange}
              locations={locations}
              isLoadingLocations={isLoadingLocations}
            />
          )}
          {step === 2 && (
            <DiveInfoStep formData={formData} localUnitSystem={localUnitSystem} onChange={onChange} />
          )}
          {step === 3 && (
            <EquipmentStep
              formData={formData}
              onChange={onChange}
              addEquipment={addEquipment}
              removeEquipment={removeEquipment}
              addWildlife={addWildlife}
              removeWildlife={removeWildlife}
              setEquipmentLastValue={setEquipmentLastValue}
              setWildlifeLastValue={setWildlifeLastValue}
            />
          )}
          {step === 4 && (
            <ConditionsStep formData={formData} localUnitSystem={localUnitSystem} onChange={onChange} />
          )}
          {step === 5 && (
            <GasUsageStep formData={formData} localUnitSystem={localUnitSystem} onChange={onChange} />
          )}

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

            {step < 5 ? (
              <Button
                onClick={handleNext}
                disabled={(step === 1 && !canProceedStep1) || isPending}
                className="px-6 bg-teal-500 hover:bg-teal-600"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
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
