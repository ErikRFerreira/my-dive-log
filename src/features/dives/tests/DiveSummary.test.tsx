import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Dive } from '../types';
import DiveSummary from '../components/DiveSummary';

const { getDiveSummaryFromAPIMock, toastErrorMock } = vi.hoisted(() => ({
  getDiveSummaryFromAPIMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock('@/services/apiAI', () => ({
  getDiveSummaryFromAPI: getDiveSummaryFromAPIMock,
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: toastErrorMock,
  },
}));

const baseDive: Dive = {
  id: 'dive-1',
  user_id: 'user-1',
  location_id: 'loc-1',
  date: '2026-02-06',
  depth: 24,
  duration: 40,
  notes: 'Base note',
  summary: null,
  created_at: '2026-02-06T10:00:00Z',
  water_temp: 22,
  visibility: 'good',
  start_pressure: 210,
  end_pressure: 60,
  air_usage: 150,
  equipment: ['BCD'],
  wildlife: ['Turtle'],
  dive_type: 'reef',
  water_type: 'salt',
  exposure: 'wet-5mm',
  gas: 'air',
  currents: 'mild',
  weight: 4,
  nitrox_percent: null,
  cylinder_type: 'aluminum',
  cylinder_size: 12,
  cover_photo_path: null,
  locations: {
    id: 'loc-1',
    name: 'Old Site',
    country: 'Old Country',
    country_code: 'OC',
  },
};

function SetDraftValuesButton() {
  const { setValue } = useFormContext();

  return (
    <button
      type="button"
      onClick={() => {
        setValue('location', 'Zapote');
        setValue('country', 'Mexico');
        setValue('dive_type', 'cave');
        setValue('water_type', 'fresh');
        setValue('notes', 'Very cold cave dive with overhead environment.');
        setValue('depth', 26);
      }}
    >
      Set Draft Values
    </button>
  );
}

function renderHarness() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Harness() {
    const methods = useForm({
      defaultValues: {
        date: baseDive.date,
        location: baseDive.locations?.name ?? '',
        country: baseDive.locations?.country ?? null,
        country_code: baseDive.locations?.country_code ?? null,
        depth: baseDive.depth,
        duration: baseDive.duration,
        notes: baseDive.notes ?? '',
        summary: baseDive.summary ?? '',
        water_temp: baseDive.water_temp,
        visibility: baseDive.visibility,
        start_pressure: baseDive.start_pressure,
        end_pressure: baseDive.end_pressure,
        air_usage: baseDive.air_usage,
        equipment: baseDive.equipment ?? [],
        wildlife: baseDive.wildlife ?? [],
        dive_type: baseDive.dive_type,
        water_type: baseDive.water_type,
        exposure: baseDive.exposure,
        gas: baseDive.gas ?? 'air',
        currents: baseDive.currents,
        weight: baseDive.weight,
        nitrox_percent: baseDive.nitrox_percent ?? 32,
      },
    });

    return (
      <QueryClientProvider client={queryClient}>
        <FormProvider {...methods}>
          <SetDraftValuesButton />
          <DiveSummary dive={baseDive} isEditing />
        </FormProvider>
      </QueryClientProvider>
    );
  }

  return render(<Harness />);
}

describe('DiveSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDiveSummaryFromAPIMock.mockResolvedValue('Generated summary text.');
  });

  it('generates summary from current unsaved form values', async () => {
    renderHarness();

    fireEvent.click(screen.getByRole('button', { name: /set draft values/i }));
    fireEvent.click(screen.getByRole('button', { name: /generate ai summary/i }));

    await waitFor(() => {
      expect(getDiveSummaryFromAPIMock).toHaveBeenCalledTimes(1);
    });

    expect(getDiveSummaryFromAPIMock).toHaveBeenCalledWith(
      expect.objectContaining({
        location: 'Zapote',
        country: 'Mexico',
        locations: { name: 'Zapote', country: 'Mexico' },
        dive_type: 'cave',
        water_type: 'fresh',
        depth: 26,
        notes: 'Very cold cave dive with overhead environment.',
      })
    );
    expect(getDiveSummaryFromAPIMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        location: 'Old Site',
      })
    );
  });
});
