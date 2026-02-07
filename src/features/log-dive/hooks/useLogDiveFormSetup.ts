import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSettingsStore } from '@/store/settingsStore';
import { getLocalDateInputValue } from '@/shared/utils/date';
import { useDraftPersistence } from '../useDraftPersistence';
import { logDiveSchema } from '../schema/schema';
import type { LogDiveFormData, LogDiveFormInput } from '../schema/schema';

const DRAFT_KEY = 'dive-log:logDiveDraft';

/**
 * Manages form setup, default values, and draft restoration for the dive logging form.
 * 
 * This hook encapsulates:
 * - Form initialization with React Hook Form
 * - Default value generation based on user settings
 * - Draft restoration from localStorage on mount
 * - Draft persistence with debouncing during form editing
 * 
 * @returns Form instance, default values, and draft management functions
 */
export function useLogDiveFormSetup() {
  const defaultUnitSystem = useSettingsStore((s) => s.unitSystem);
  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem);
  const [draftRestored, setDraftRestored] = useState(false);

  /**
   * Default form values memoized to prevent unnecessary re-renders.
   * Date is set to today's date in YYYY-MM-DD format.
   */
  const defaultValues = useMemo<LogDiveFormInput>(() => {
    return {
      date: getLocalDateInputValue(),
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
  const form = useForm<LogDiveFormInput, unknown, LogDiveFormData>({
    defaultValues,
    resolver: zodResolver(logDiveSchema),
    shouldUnregister: false,
  });

  // Watch form data for draft persistence
  const formData = form.watch();

  // Draft persistence management
  const { loadDraft, clearDraft } = useDraftPersistence({
    key: DRAFT_KEY,
    data: formData,
    enabled: draftRestored,
  });

  /**
   * Restore draft from localStorage on mount.
   * If a draft exists, restore form values and unit system preference.
   */
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      if (draft.unitSystem) {
        setUnitSystem(draft.unitSystem);
      }
      form.reset({ ...defaultValues, ...draft });
    }
    setDraftRestored(true);
  }, [loadDraft, defaultValues, form, setUnitSystem]);

  return {
    form,
    defaultValues,
    clearDraft,
  };
}
