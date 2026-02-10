import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';

import EssentialsStep from '@/features/log-dive/components/EssentialsStep';
import DiveInfoStep from '@/features/log-dive/components/DiveInfoStep';
import EquipmentStep from '@/features/log-dive/components/EquipmentStep';
import GasUsageStep from '@/features/log-dive/components/GasUsageStep';
import { useWizardState } from '@/features/log-dive/useWizardState';
import { WizardProgress } from '@/features/log-dive/components/WizardProgress';
import { useLogDiveFormSetup } from '@/features/log-dive/hooks/useLogDiveFormSetup';
import { useLogDiveSubmission } from '@/features/log-dive/hooks/useLogDiveSubmission';

/**
 * Multi-step dive logging wizard page.
 *
 * Orchestrates a 4-step form flow for logging dive details:
 * 1. Essentials - Date, location, depth, duration (required fields)
 * 2. Dive Details - Water conditions, equipment, wildlife
 * 3. Equipment - Dive gear used
 * 4. Gas Usage - Cylinder and gas mix information
 *
 * Features:
 * - Step-by-step validation
 * - Draft persistence in localStorage (auto-saved, cleared on success)
 * - "Save" or "Save & Log Another" options
 * - Cancel navigation with fallback to dashboard
 */
function LogDivePage() {
  const navigate = useNavigate();

  // Form setup and draft management
  const { form, defaultValues, clearDraft } = useLogDiveFormSetup();

  // Wizard navigation with validation
  const wizard = useWizardState({
    totalSteps: 4,
    onValidateStep: async (currentStep: number) => {
      if (currentStep === 1) {
        return await form.trigger(['date', 'countryCode', 'location', 'maxDepth', 'duration']);
      }
      return true;
    },
  });

  // Submission logic with intent handling
  const { isPending, submitIntentRef, handleSubmit, handleSubmitError } = useLogDiveSubmission({
    onClearDraft: clearDraft,
    onResetForm: form.reset,
    onResetWizard: wizard.resetToStart,
    defaultValues,
  });

  /**
   * Cancels the dive logging process.
   * Uses browser back navigation if available, otherwise redirects to dashboard.
   */
  const onCancel = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard');
  };

  // Bind submission handlers to form
  const onSubmit = form.handleSubmit(handleSubmit, handleSubmitError);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-6">
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
          currentStep={wizard.step}
          totalSteps={4}
          stepLabels={['Essentials', 'Dive Details', 'Equipment', 'Gas Usage']}
        />

        <Card className="p-8 max-[991px]:px-6 max-[991px]:-mt-4 bg-slate-900 border-slate-800 shadow-xl">
          {wizard.step === 1 && <EssentialsStep control={form.control} setValue={form.setValue} />}
          {wizard.step === 2 && <DiveInfoStep control={form.control} />}
          {wizard.step === 3 && <EquipmentStep control={form.control} />}
          {wizard.step === 4 && <GasUsageStep control={form.control} />}

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={wizard.handleBack}
              disabled={wizard.isFirstStep || isPending}
              className="px-6 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {!wizard.isLastStep ? (
              <Button
                onClick={wizard.handleNext}
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

