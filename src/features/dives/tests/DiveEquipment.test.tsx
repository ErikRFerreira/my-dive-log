import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import DiveEquipment from '../components/DiveEquipment';
import type { Dive } from '../types';

type TestFormValues = {
  equipment: string[];
  wildlife: string[];
};

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
  equipment: [],
  wildlife: [],
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

function EquipmentValueProbe() {
  const equipment = useWatch<TestFormValues>({ name: 'equipment' }) ?? [];
  return <pre data-testid="equipment-value">{JSON.stringify(equipment)}</pre>;
}

function RenderHarness() {
  const methods = useForm<TestFormValues>({
    defaultValues: {
      equipment: [],
      wildlife: [],
    },
  });

  return (
    <FormProvider {...methods}>
      <DiveEquipment dive={baseDive} isEditing />
      <EquipmentValueProbe />
    </FormProvider>
  );
}

describe('DiveEquipment', () => {
  it('adds equipment as string[] form values', () => {
    render(<RenderHarness />);

    fireEvent.change(screen.getByPlaceholderText(/add equipment/i), {
      target: { value: 'BCD' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(screen.getByTestId('equipment-value')).toHaveTextContent('["BCD"]');
  });
});
