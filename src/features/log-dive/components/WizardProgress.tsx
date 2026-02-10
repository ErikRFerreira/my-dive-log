import { Fragment } from 'react';
import { Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

/**
 * Wizard progress indicator with step dots and labels.
 * Shows completed, current, and upcoming steps with visual feedback.
 */
export function WizardProgress({ currentStep, totalSteps, stepLabels }: WizardProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, idx) => idx + 1).map((s, idx) => (
          <Fragment key={s}>
            {idx > 0 && (
              <div
                className={`flex-1 h-1 transition-all mx-1 ${
                  s <= currentStep ? 'bg-primary' : 'bg-slate-700'
                }`}
              />
            )}
            <div
              className={`relative w-10 h-10 mx-3 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0 ${
                s < currentStep
                  ? 'bg-primary text-black'
                  : s === currentStep
                    ? 'bg-primary text-black ring-4 ring-primary/80 ring-primary/80'
                    : 'bg-slate-700 text-slate-500'
              }`}
            >
              {s === currentStep && (
                <span
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-full border-[3px] border-primary/80 animate-[pulse-ring_1.6s_ease-out_infinite]"
                />
              )}
              {s < currentStep ? <Check className="w-5 h-5" /> : s}
            </div>
          </Fragment>
        ))}
      </div>
      <div className="flex mt-3 text-xs sm:text-sm justify-between">
        {stepLabels.map((label, idx) => (
          <span
            key={label}
            className={`text-center ${idx + 1 === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

