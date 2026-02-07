import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLogDiveSubmission } from './useLogDiveSubmission';
import type { LogDiveFormData, LogDiveFormInput } from '../schema/schema';

const {
  mockNavigate,
  mockMutateAdd,
  mockToastSuccess,
  mockToastError,
  mockBuildNewDivePayload,
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockMutateAdd: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockBuildNewDivePayload: vi.fn<
    (args: { formData: LogDiveFormData }) => { payload: unknown; blockingError?: string }
  >((args: { formData: LogDiveFormData }) => ({
    payload: {
      ...args.formData,
      locationName: args.formData.location,
      locationCountryCode: args.formData.countryCode,
      depth: parseFloat(args.formData.maxDepth) || 0,
    },
  })),
}));

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/features/dives/hooks/useAddDive', () => ({
  useAddDive: () => ({
    mutateAdd: mockMutateAdd,
    isPending: false,
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock('../utils/mappers', () => ({
  buildNewDivePayload: mockBuildNewDivePayload,
}));

describe('useLogDiveSubmission', () => {
  const mockOnClearDraft = vi.fn();
  const mockOnResetForm = vi.fn();
  const mockOnResetWizard = vi.fn();
  const mockDefaultValues: LogDiveFormInput = {
    date: '2025-06-15',
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
    unitSystem: 'metric',
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildNewDivePayload.mockImplementation((args: { formData: LogDiveFormData }) => ({
      payload: {
        ...args.formData,
        locationName: args.formData.location,
        locationCountryCode: args.formData.countryCode,
        depth: parseFloat(args.formData.maxDepth) || 0,
      },
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useLogDiveSubmission({
        onClearDraft: mockOnClearDraft,
        onResetForm: mockOnResetForm,
        onResetWizard: mockOnResetWizard,
        defaultValues: mockDefaultValues,
      })
    );

    expect(result.current.isPending).toBe(false);
    expect(result.current.submitIntentRef.current).toBe('save');
  });

  it('should handle successful dive submission and navigate to dashboard', async () => {
    const { result } = renderHook(() =>
      useLogDiveSubmission({
        onClearDraft: mockOnClearDraft,
        onResetForm: mockOnResetForm,
        onResetWizard: mockOnResetWizard,
        defaultValues: mockDefaultValues,
      })
    );

    const mockFormData = {
      date: '2025-06-15',
      location: 'Great Barrier Reef',
      countryCode: 'AU',
      maxDepth: '30',
      duration: '45',
    } as LogDiveFormData;

    mockMutateAdd.mockImplementation((_payload, options) => {
      options?.onSuccess?.({ id: 'dive-123' });
    });

    result.current.submitIntentRef.current = 'save';
    result.current.handleSubmit(mockFormData);

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Dive logged successfully');
      expect(mockOnClearDraft).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(mockOnResetForm).not.toHaveBeenCalled();
    });
  });

  it('should handle "save & log another" flow', async () => {
    const { result } = renderHook(() =>
      useLogDiveSubmission({
        onClearDraft: mockOnClearDraft,
        onResetForm: mockOnResetForm,
        onResetWizard: mockOnResetWizard,
        defaultValues: mockDefaultValues,
      })
    );

    const mockFormData = {
      date: '2025-06-15',
      location: 'Blue Hole',
      maxDepth: '25',
    } as LogDiveFormData;

    mockMutateAdd.mockImplementation((_payload, options) => {
      options?.onSuccess?.({ id: 'dive-456' });
    });

    result.current.submitIntentRef.current = 'saveAnother';
    result.current.handleSubmit(mockFormData);

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Dive logged successfully');
      expect(mockOnClearDraft).toHaveBeenCalled();
      expect(mockOnResetForm).toHaveBeenCalledWith(
        expect.objectContaining({
          date: expect.any(String), // Should be today's date
          location: '',
          maxDepth: '',
        })
      );
      expect(mockOnResetWizard).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      // Intent should reset to 'save' for next submission
      expect(result.current.submitIntentRef.current).toBe('save');
    });
  });

  it('should handle API errors without emitting an extra local error toast', async () => {
    const { result } = renderHook(() =>
      useLogDiveSubmission({
        onClearDraft: mockOnClearDraft,
        onResetForm: mockOnResetForm,
        onResetWizard: mockOnResetWizard,
        defaultValues: mockDefaultValues,
      })
    );

    const mockFormData = {
      date: '2025-06-15',
      location: 'Test Location',
    } as LogDiveFormData;

    const testError = new Error('Network error');
    mockMutateAdd.mockImplementation((_payload, options) => {
      options?.onError?.(testError);
    });

    result.current.handleSubmit(mockFormData);

    await waitFor(() => {
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockOnClearDraft).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('should handle blocking errors from payload builder', () => {
    const { result } = renderHook(() =>
      useLogDiveSubmission({
        onClearDraft: mockOnClearDraft,
        onResetForm: mockOnResetForm,
        onResetWizard: mockOnResetWizard,
        defaultValues: mockDefaultValues,
      })
    );

    const mockFormData = {
      date: '2025-06-15',
    } as LogDiveFormData;

    mockBuildNewDivePayload.mockReturnValue({
      payload: {} as never,
      blockingError: 'Location is required',
    });

    result.current.handleSubmit(mockFormData);

    expect(mockToastError).toHaveBeenCalledWith('Location is required');
    expect(mockOnResetWizard).toHaveBeenCalled();
    expect(mockMutateAdd).not.toHaveBeenCalled();
  });

  it('should handle form validation errors', () => {
    const { result } = renderHook(() =>
      useLogDiveSubmission({
        onClearDraft: mockOnClearDraft,
        onResetForm: mockOnResetForm,
        onResetWizard: mockOnResetWizard,
        defaultValues: mockDefaultValues,
      })
    );

    const mockErrors = {
      location: {
        type: 'required',
        message: 'Location is required',
      },
      maxDepth: {
        type: 'required',
        message: 'Max depth is required',
      },
    };

    result.current.handleSubmitError(mockErrors);

    expect(mockToastError).toHaveBeenCalledWith('Location is required');
    expect(mockOnResetWizard).toHaveBeenCalled();
  });

  it('should show default error message for unknown validation errors', () => {
    const { result } = renderHook(() =>
      useLogDiveSubmission({
        onClearDraft: mockOnClearDraft,
        onResetForm: mockOnResetForm,
        onResetWizard: mockOnResetWizard,
        defaultValues: mockDefaultValues,
      })
    );

    const mockErrors = {
      location: {
        type: 'custom',
        // No message property, will use default
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.current.handleSubmitError(mockErrors as any);

    expect(mockToastError).toHaveBeenCalledWith('Please complete the required fields first.');
    expect(mockOnResetWizard).toHaveBeenCalled();
  });

});
