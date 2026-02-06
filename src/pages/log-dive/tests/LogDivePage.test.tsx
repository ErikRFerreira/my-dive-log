import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LogDivePage from '../LogDivePage';

// Track navigation and mutation calls so we can assert behavior without
// triggering real navigation or network requests.
const navigateMock = vi.fn();
const mutateAddMock = vi.fn();
const setUnitSystemMock = vi.fn();

// Mock routing to avoid changing test URLs and to verify post-submit redirects.
vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));

// Force the settings store into a known unit system (metric) so conversions
// are deterministic for assertions.
vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: (
    selector: (state: {
      unitSystem: 'metric' | 'imperial';
      setUnitSystem: (unitSystem: 'metric' | 'imperial') => void;
    }) => unknown
  ) => selector({ unitSystem: 'metric', setUnitSystem: setUnitSystemMock }),
}));

// Mock the create-dive hook so we can intercept the payload and emulate success.
vi.mock('@/features/dives/hooks/useAddDive', () => ({
  useAddDive: () => ({
    isPending: false,
    mutateAdd: mutateAddMock,
  }),
}));

// Provide a small, fixed location list so auto-fill and filtering logic are stable.
vi.mock('@/features/dives/hooks/useGetLocations', () => ({
  useGetLocations: () => ({
    locations: [
      { id: 'loc-1', name: 'Malapascua', country_code: 'ph' },
      { id: 'loc-2', name: 'Blue Hole', country_code: 'pt' },
    ],
    isLoading: false,
    isError: false,
  }),
}));

// Avoid real toasts; we only care that the flow can complete without errors.
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LogDivePage', () => {
  beforeEach(() => {
    // Use fake timers to control date-dependent defaults and keep tests stable.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-02T00:00:00Z'));
    mutateAddMock.mockReset();
    navigateMock.mockReset();
    setUnitSystemMock.mockReset();
  });

  afterEach(() => {
    // Restore real timers so other tests are not affected.
    vi.useRealTimers();
  });

  it('submits a dive with single unit system and nitrox settings', async () => {
    // Intercept submission so we can assert conversions and derived values.
    mutateAddMock.mockImplementation(
      (payload, options: { onSuccess?: (created: { id: string } | null) => void }) => {
        // Base fields should serialize as expected.
        expect(payload).toEqual(
          expect.objectContaining({
            date: '2025-01-02',
            locationName: 'Malapascua',
            locationCountryCode: 'PH',
            duration: 45,
            gas: 'nitrox',
          })
        );
        // Unit conversions: UI inputs are imperial here but payload should be metric.
        expect(payload.depth).toBeCloseTo(30.48, 2); // 100 ft -> m
        expect(payload.water_temp).toBeCloseTo(26.67, 1); // 80F -> C
        expect(payload.weight).toBeCloseTo(9.07, 2); // 20 lbs -> kg
        expect(payload.start_pressure).toBeCloseTo(206.84, 1); // 3000 psi -> bar
        expect(payload.end_pressure).toBeCloseTo(34.47, 1); // 500 psi -> bar
        // Multi-value fields should include the user-added items.
        expect(payload.equipment).toEqual(expect.arrayContaining(['BCD']));
        expect(payload.wildlife).toEqual(expect.arrayContaining(['Sea Turtle']));

        // Simulate a successful create so any post-submit logic runs.
        options?.onSuccess?.({ id: 'dive-1' });
      }
    );

    render(<LogDivePage />);

    // Step 1: essentials.
    fireEvent.click(screen.getByRole('radio', { name: /imperial/i }));

    fireEvent.change(screen.getByDisplayValue('2025-01-02'), {
      target: { value: '2025-01-02' },
    });

    fireEvent.change(screen.getByPlaceholderText(/e\.g\., blue hole/i), {
      target: { value: 'Malapascua' },
    });

    // Location auto-fill should select the correct country.
    expect(screen.getByText(/philippines/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/e\.g\., 100/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\., 45/i), {
      target: { value: '45' },
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await vi.runAllTimersAsync();

    // Step 2: dive details (conditions + wildlife).
    fireEvent.click(screen.getByRole('radio', { name: /reef/i }));
    fireEvent.click(screen.getByRole('radio', { name: /saltwater/i }));
    fireEvent.change(screen.getByPlaceholderText(/e\.g\., 75/i), {
      target: { value: '80' },
    });

    const wildlifeInput = screen.getByPlaceholderText(/add wildlife/i);
    fireEvent.change(wildlifeInput, { target: { value: 'Sea Turtle' } });
    fireEvent.keyDown(wildlifeInput, { key: 'Enter' });
    expect(screen.getByText(/sea turtle/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await vi.runAllTimersAsync();

    // Step 3: equipment.
    fireEvent.change(screen.getByPlaceholderText(/e\.g\., 13/i), {
      target: { value: '20' },
    });

    const equipmentInput = screen.getByPlaceholderText(/add equipment/i);
    fireEvent.change(equipmentInput, { target: { value: 'BCD' } });
    fireEvent.keyDown(equipmentInput, { key: 'Enter' });
    expect(screen.getByText(/bcd/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await vi.runAllTimersAsync();

    // Step 4: gas usage.
    fireEvent.click(screen.getByRole('button', { name: /nitrox/i }));

    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '36' } });

    const updatedSliders = screen.getAllByRole('slider');
    fireEvent.change(updatedSliders[1], { target: { value: '3000' } });
    fireEvent.change(updatedSliders[2], { target: { value: '500' } });

    // Submit and verify the mocked mutation was called once.
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await vi.runAllTimersAsync();

    expect(mutateAddMock).toHaveBeenCalledTimes(1);
  });
});
