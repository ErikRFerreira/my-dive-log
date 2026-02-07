import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import type { FieldErrors } from 'react-hook-form';
import { useAddDive } from '@/features/dives/hooks/useAddDive';
import { buildNewDivePayload } from '../utils/mappers';
import type { LogDiveFormData, LogDiveFormInput } from '../schema/schema';

type SubmitIntent = 'save' | 'saveAnother';

interface UseLogDiveSubmissionOptions {
  /** Function to clear the draft from localStorage */
  onClearDraft: () => void;
  /** Function to reset the form to default or new values */
  onResetForm: (values: LogDiveFormInput) => void;
  /** Function to reset wizard to first step */
  onResetWizard: () => void;
  /** Default values to use when resetting for "save another" flow */
  defaultValues: LogDiveFormInput;
}

/**
 * Manages dive submission with support for "save" and "save & log another" workflows.
 * 
 * This hook encapsulates:
 * - Submit intent tracking (save vs save & log another)
 * - Mutation handling with useAddDive
 * - Success flow: clear draft, navigate or reset form
 * - Error handling with user-friendly toast messages
 * - Form validation error display
 * 
 * @returns Submit handlers, loading state, and intent ref for button handlers
 */
export function useLogDiveSubmission({
  onClearDraft,
  onResetForm,
  onResetWizard,
  defaultValues,
}: UseLogDiveSubmissionOptions) {
  const navigate = useNavigate();
  const { mutateAdd, isPending } = useAddDive();
  
  /**
   * Tracks user's submit intent: 'save' (navigate away) or 'saveAnother' (reset form).
   * Uses a ref to avoid re-renders when intent changes.
   */
  const submitIntentRef = useRef<SubmitIntent>('save');

  /**
   * Main form submission handler.
   * Validates data, submits to API, and handles success/error flows.
   */
  const handleSubmit = useCallback(
    (values: LogDiveFormData) => {
      const { payload, blockingError } = buildNewDivePayload({
        formData: values,
      });

      if (blockingError) {
        toast.error(blockingError);
        onResetWizard();
        return;
      }

      mutateAdd(payload, {
        onSuccess: (created: unknown) => {
          if (!created) {
            toast.error('Failed to log dive. Please try again.');
            return;
          }

          toast.success('Dive logged successfully');
          
          // Clear draft from localStorage on successful save
          onClearDraft();

          // Handle "save & log another" flow
          if (submitIntentRef.current === 'saveAnother') {
            onResetForm({
              ...defaultValues,
              date: new Date().toISOString().split('T')[0],
            });
            onResetWizard();
            submitIntentRef.current = 'save'; // Reset intent for next submission
            return;
          }

          // Handle normal "save" flow - navigate to dashboard
          navigate('/dashboard');
        },
        onError: (err: Error) => {
          console.error('Failed to log dive:', err);
          toast.error('Failed to log dive. Please try again.');
        },
      });
    },
    [mutateAdd, navigate, onClearDraft, onResetForm, onResetWizard, defaultValues]
  );

  /**
   * Handles form validation errors.
   * Extracts the first error message and displays it to the user.
   */
  const handleSubmitError = useCallback(
    (errors: FieldErrors<LogDiveFormInput>) => {
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
      onResetWizard();
    },
    [onResetWizard]
  );

  return {
    isPending,
    submitIntentRef,
    handleSubmit,
    handleSubmitError,
  };
}
