import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLogDiveFormSetup } from './useLogDiveFormSetup';

// Mock dependencies
const mockSetUnitSystem = vi.fn();
const mockUnitSystem = vi.fn(() => 'metric');

vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: (selector: (state: { unitSystem: string; setUnitSystem: (v: string) => void }) => unknown) =>
    selector({
      unitSystem: mockUnitSystem(),
      setUnitSystem: mockSetUnitSystem,
    }),
}));

describe('useLogDiveFormSetup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should initialize form with default values', () => {
    const { result } = renderHook(() => useLogDiveFormSetup());

    expect(result.current.form).toBeDefined();
    expect(result.current.defaultValues).toEqual(
      expect.objectContaining({
        date: '2025-06-15',
        location: '',
        maxDepth: '',
        duration: '',
        unitSystem: 'metric',
        equipment: [],
        wildlife: [],
        nitroxPercent: 32,
      })
    );
  });

  it('should use imperial unit system when set in settings store', () => {
    mockUnitSystem.mockReturnValue('imperial');

    const { result } = renderHook(() => useLogDiveFormSetup());

    expect(result.current.defaultValues.unitSystem).toBe('imperial');
  });

  it('should restore draft from localStorage on mount', async () => {
    const draftData = {
      date: '2025-06-10',
      location: 'Great Barrier Reef',
      countryCode: 'AU',
      maxDepth: '30',
      duration: '45',
      unitSystem: 'imperial',
    };

    localStorage.setItem('dive-log:logDiveDraft', JSON.stringify(draftData));

    const { result } = renderHook(() => useLogDiveFormSetup());

    await waitFor(
      () => {
        const formValues = result.current.form.getValues();
        expect(formValues.location).toBe('Great Barrier Reef');
        expect(formValues.countryCode).toBe('AU');
        expect(formValues.maxDepth).toBe('30');
        expect(formValues.duration).toBe('45');
      },
      { timeout: 3000 }
    );
  });

  it('should apply unit system from draft to settings store', async () => {
    const draftData = {
      date: '2025-06-10',
      location: 'Blue Hole',
      unitSystem: 'imperial',
    };

    localStorage.setItem('dive-log:logDiveDraft', JSON.stringify(draftData));

    renderHook(() => useLogDiveFormSetup());

    await waitFor(
      () => {
        expect(mockSetUnitSystem).toHaveBeenCalledWith('imperial');
      },
      { timeout: 3000 }
    );
  });

  it('should not restore draft if localStorage is empty', () => {
    const { result } = renderHook(() => useLogDiveFormSetup());

    const formValues = result.current.form.getValues();
    expect(formValues.location).toBe('');
    expect(formValues.maxDepth).toBe('');
  });

  it('should provide clearDraft function', async () => {
    const draftData = { location: 'Test Location' };
    localStorage.setItem('dive-log:logDiveDraft', JSON.stringify(draftData));

    const { result } = renderHook(() => useLogDiveFormSetup());

    expect(localStorage.getItem('dive-log:logDiveDraft')).not.toBeNull();

    result.current.clearDraft();

    await waitFor(
      () => {
        expect(localStorage.getItem('dive-log:logDiveDraft')).toBeNull();
      },
      { timeout: 1000 }
    );
  });

  it('should enable draft persistence after restoration', async () => {
    const { result } = renderHook(() => useLogDiveFormSetup());

    // Wait for initial mount to complete
    await waitFor(() => {
      expect(result.current.form).toBeDefined();
    });

    // Change a value after restoration
    result.current.form.setValue('location', 'New Location');

    // Give debounce time to fire
    vi.advanceTimersByTime(500);

    await waitFor(
      () => {
        const savedDraft = localStorage.getItem('dive-log:logDiveDraft');
        expect(savedDraft).not.toBeNull();
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          expect(parsed.location).toBe('New Location');
        }
      },
      { timeout: 2000 }
    );
  });

  it('should handle corrupted draft data gracefully', () => {
    localStorage.setItem('dive-log:logDiveDraft', 'invalid-json{');

    const { result } = renderHook(() => useLogDiveFormSetup());

    // Should still initialize with default values
    expect(result.current.form.getValues().location).toBe('');
  });

  it('should merge draft with default values correctly', async () => {
    const partialDraft = {
      location: 'Maldives',
      maxDepth: '40',
      // Other fields missing
    };

    localStorage.setItem('dive-log:logDiveDraft', JSON.stringify(partialDraft));

    const { result } = renderHook(() => useLogDiveFormSetup());

    await waitFor(
      () => {
        const formValues = result.current.form.getValues();
        expect(formValues.location).toBe('Maldives');
        expect(formValues.maxDepth).toBe('40');
        // Default values should still be present
        expect(formValues.date).toBe('2025-06-15');
        expect(formValues.equipment).toEqual([]);
        expect(formValues.nitroxPercent).toBe(32);
      },
      { timeout: 3000 }
    );
  });
});
