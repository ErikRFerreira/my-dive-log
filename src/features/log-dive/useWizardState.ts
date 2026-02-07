import { useState } from 'react';
import toast from 'react-hot-toast';

interface UseWizardStateOptions {
  totalSteps: number;
  onValidateStep?: (step: number) => Promise<boolean>;
}

/**
 * Custom hook for managing multi-step wizard navigation.
 * 
 * Handles step transitions with optional validation before advancing.
 * Provides next, back, and direct step navigation controls.
 */
export function useWizardState({ totalSteps, onValidateStep }: UseWizardStateOptions) {
  const [step, setStep] = useState(1);

  /**
   * Advances to the next step.
   * Runs validation if provided before allowing navigation.
   */
  const handleNext = async () => {
    if (onValidateStep) {
      const isValid = await onValidateStep(step);
      if (!isValid) {
        toast.error('Please complete the required fields first.');
        return;
      }
    }
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  /**
   * Goes back to the previous step.
   * No validation required when moving backward.
   */
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  /**
   * Resets wizard to the first step.
   */
  const resetToStart = () => {
    setStep(1);
  };

  return {
    step,
    setStep,
    handleNext,
    handleBack,
    resetToStart,
    isFirstStep: step === 1,
    isLastStep: step === totalSteps,
  };
}
