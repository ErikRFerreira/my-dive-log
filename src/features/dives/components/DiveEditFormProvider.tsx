import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorBoundary } from 'react-error-boundary';
import { useState } from 'react';

import { useSettingsStore } from '@/store/settingsStore';
import { useUpdateDive } from '../hooks/useUpdateDive';
import { createUpdateDiveSchema } from '../schemas/updateDiveSchema';
import type { Dive } from '../types';
import EditErrorFallback from './EditErrorFallback';

type DiveEditFormProviderProps = {
  dive: Dive;
  onCancel: () => void;
  onSaveSuccess: () => void;
  children:
    | React.ReactNode
    | ((handleSave: () => void, handleCancel: () => void, saveError: string | null) => React.ReactNode);
};

/**
 * Form provider wrapper for dive editing.
 * Manages form state, validation, submission, and error handling.
 * Wraps children in ErrorBoundary and FormProvider context.
 */
function DiveEditFormProvider({
  dive,
  onCancel,
  onSaveSuccess,
  children,
}: DiveEditFormProviderProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const { mutateAsync: updateDive } = useUpdateDive();
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize form with dive data and unit-aware validation
  const methods = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    resolver: zodResolver(createUpdateDiveSchema(unitSystem)),
    defaultValues: {
      date: dive.date,
      location: dive.locations?.name ?? '',
      country: dive.locations?.country ?? null,
      country_code: dive.locations?.country_code ?? null,
      depth: dive.depth,
      duration: dive.duration,
      notes: dive.notes ?? '',
      summary: dive.summary ?? '',
      water_temp: dive.water_temp,
      visibility: dive.visibility,
      start_pressure: dive.start_pressure,
      end_pressure: dive.end_pressure,
      air_usage: dive.air_usage,
      equipment: dive.equipment ?? [],
      wildlife: dive.wildlife ?? [],
      dive_type: dive.dive_type,
      water_type: dive.water_type,
      exposure: dive.exposure,
      gas: dive.gas ?? 'air',
      currents: dive.currents,
      weight: dive.weight,
      nitrox_percent: dive.nitrox_percent ?? 32,
    },
  });

  const {
    handleSubmit,
    formState: { isDirty },
    reset,
  } = methods;

  // Handle save with calculated air_usage
  const handleSave = handleSubmit(async (data) => {
    try {
      setSaveError(null);
      // Calculate air_usage from pressures
      const airUsage =
        data.start_pressure !== null && data.end_pressure !== null
          ? data.start_pressure - data.end_pressure
          : null;

      // Transform form data to API payload
      const diveData = {
        depth: data.depth,
        duration: data.duration,
        date: data.date,
        water_temp: data.water_temp,
        visibility: data.visibility,
        dive_type: data.dive_type,
        water_type: data.water_type,
        exposure: data.exposure,
        currents: data.currents,
        weight: data.weight,
        gas: data.gas,
        nitrox_percent: data.gas === 'nitrox' ? data.nitrox_percent : null,
        start_pressure: data.start_pressure,
        end_pressure: data.end_pressure,
        air_usage: airUsage,
        equipment: data.equipment && data.equipment.length > 0 ? data.equipment : null,
        wildlife: data.wildlife && data.wildlife.length > 0 ? data.wildlife : null,
        notes: data.notes?.trim() || null,
        summary: data.summary?.trim() || null,
        locationName: data.location,
        locationCountry: data.country,
        locationCountryCode: data.country_code,
      };

      await updateDive({ id: dive.id, diveData });
      reset(data); // Reset form dirty state after successful save
      setSaveError(null);
      onSaveSuccess();
    } catch (err) {
      // Error handling is done in useUpdateDive hook
      console.error('Save failed:', err);
      setSaveError(
        err instanceof Error ? err.message : 'Failed to save changes. Please try again.'
      );
    }
  });

  // Handle cancel with unsaved changes warning
  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (!confirmed) return;
    }
    reset();
    setSaveError(null);
    onCancel();
  };

  return (
    <ErrorBoundary FallbackComponent={EditErrorFallback} onReset={handleCancel}>
      <FormProvider {...methods}>
        {typeof children === 'function' ? children(handleSave, handleCancel, saveError) : children}
      </FormProvider>
    </ErrorBoundary>
  );
}

export default DiveEditFormProvider;
