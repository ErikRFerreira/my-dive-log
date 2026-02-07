import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFormContext } from 'react-hook-form';
import DiveEditFormProvider from '../components/DiveEditFormProvider';
import DiveEquipment from '../components/DiveEquipment';
import DiveWildlife from '../components/DiveWildlife';
import type { Dive, UpdateDivePatch } from '../types';

const { mockMutateAsync, mockUseSettingsStore } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockUseSettingsStore: vi.fn(),
}));

vi.mock('../hooks/useUpdateDive', () => ({
  useUpdateDive: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: (selector: (state: { unitSystem: 'metric' | 'imperial' }) => unknown) =>
    mockUseSettingsStore(selector),
}));

const baseDive: Dive = {
  id: 'dive-1',
  user_id: 'user-1',
  location_id: 'loc-1',
  date: '2025-01-15',
  depth: 18,
  duration: 45,
  notes: null,
  summary: null,
  created_at: '2025-01-15T10:00:00Z',
  water_temp: null,
  visibility: 'good',
  start_pressure: null,
  end_pressure: null,
  air_usage: null,
  equipment: ['Old BCD'],
  wildlife: ['Old Fish'],
  dive_type: 'reef',
  water_type: 'salt',
  exposure: 'wet-5mm',
  gas: 'air',
  currents: 'mild',
  weight: null,
  nitrox_percent: null,
  cylinder_type: null,
  cylinder_size: null,
  cover_photo_path: null,
  locations: {
    id: 'loc-1',
    name: 'Blue Hole',
    country: 'Australia',
    country_code: 'AU',
  },
};

function EditControls({ onSave }: { onSave: () => void }) {
  const { setValue } = useFormContext();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setValue('equipment', ['BCD', 'Mask']);
          setValue('wildlife', ['Sea Turtle', 'Reef Shark']);
        }}
      >
        Set Arrays
      </button>
      <button type="button" onClick={onSave}>
        Save
      </button>
    </>
  );
}

describe('DiveEditFormProvider', () => {
  it('submits and preserves equipment/wildlife as string[] through save/load', async () => {
    mockUseSettingsStore.mockImplementation(
      (selector: (state: { unitSystem: 'metric' | 'imperial' }) => unknown) =>
        selector({ unitSystem: 'metric' })
    );
    mockMutateAsync.mockResolvedValue(baseDive);

    const onCancel = vi.fn();
    const onSaveSuccess = vi.fn();

    render(
      <DiveEditFormProvider dive={baseDive} onCancel={onCancel} onSaveSuccess={onSaveSuccess}>
        {(onSave) => <EditControls onSave={onSave} />}
      </DiveEditFormProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /set arrays/i }));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));

    const submitted = mockMutateAsync.mock.calls[0][0] as {
      id: string;
      diveData: UpdateDivePatch;
    };

    expect(submitted.id).toBe(baseDive.id);
    expect(submitted.diveData.equipment).toEqual(['BCD', 'Mask']);
    expect(submitted.diveData.wildlife).toEqual(['Sea Turtle', 'Reef Shark']);

    const loadedDive: Dive = {
      ...baseDive,
      equipment: Array.isArray(submitted.diveData.equipment) ? submitted.diveData.equipment : [],
      wildlife: Array.isArray(submitted.diveData.wildlife) ? submitted.diveData.wildlife : [],
    };

    render(
      <>
        <DiveEquipment dive={loadedDive} isEditing={false} />
        <DiveWildlife dive={loadedDive} isEditing={false} />
      </>
    );

    expect(screen.getByText('BCD')).toBeInTheDocument();
    expect(screen.getByText('Mask')).toBeInTheDocument();
    expect(screen.getByText('Sea Turtle')).toBeInTheDocument();
    expect(screen.getByText('Reef Shark')).toBeInTheDocument();
  });
});
