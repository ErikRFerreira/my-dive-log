import { act, renderHook, waitFor } from '@testing-library/react';
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
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should initialize form with default values', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T10:00:00Z'));

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

  it('should enable draft persistence after restoration', async () => {
    // Keep fake timers scoped to this test to avoid waitFor deadlocks.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T10:00:00Z'));

    const { result } = renderHook(() => useLogDiveFormSetup());

    act(() => {
      result.current.form.setValue('location', 'New Location');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const savedDraft = localStorage.getItem('dive-log:logDiveDraft');
    expect(savedDraft).not.toBeNull();
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      expect(parsed.location).toBe('New Location');
    }
  });

  it('should handle corrupted draft data gracefully', () => {
    localStorage.setItem('dive-log:logDiveDraft', 'invalid-json{');

    const { result } = renderHook(() => useLogDiveFormSetup());

    // Should still initialize with default values
    expect(result.current.form.getValues().location).toBe('');
    expect(localStorage.getItem('dive-log:logDiveDraft')).toBeNull();
  });

  it('should restore draft and merge with default values correctly', async () => {
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
        expect(formValues.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(formValues.equipment).toEqual([]);
        expect(formValues.nitroxPercent).toBe(32);
      },
      { timeout: 3000 }
    );
  });
});
