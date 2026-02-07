import DivePage from '@/pages/Dive';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

import type { Dive as DiveType } from '@/features/dives/types';

// Mock navigation
const navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ diveId: 'dive-123' }),
}));

// Mock dive data
const mockDive: DiveType = {
  id: 'dive-123',
  user_id: 'user-1',
  location_id: 'loc-1',
  date: '2025-01-15',
  depth: 25,
  duration: 45,
  water_temp: 28,
  visibility: 'good' as const,
  dive_type: 'reef' as const,
  water_type: 'salt' as const,
  exposure: 'wet-5mm' as const,
  currents: 'mild' as const,
  weight: 4,
  gas: 'air' as const,
  nitrox_percent: null,
  start_pressure: 200,
  end_pressure: 50,
  air_usage: 150,
  cylinder_type: 'aluminum' as const,
  cylinder_size: 80,
  equipment: ['BCD', 'Regulator', 'Mask'],
  wildlife: ['Clownfish', 'Sea Turtle'],
  notes: 'Great dive with good visibility',
  summary: 'Explored the reef and saw amazing marine life',
  cover_photo_path: null,
  created_at: '2025-01-15T10:00:00Z',
  locations: {
    id: 'loc-1',
    name: 'Great Barrier Reef',
    country: 'Australia',
    country_code: 'AU',
    lat: -18.2871,
    lng: 147.6992,
  },
};

const updateDiveMock = vi.fn();
const deleteDiveMock = vi.fn();
const refetchMock = vi.fn();

type FormState = {
  depth: number | null;
  duration: number | null;
  weight: number | null;
  notes: string;
  gas: string;
  equipment: string[];
  wildlife: string[];
  summary: string;
};

type FormContextValue = {
  values: FormState;
  setValues: Dispatch<SetStateAction<FormState>>;
  isDirty: boolean;
  setIsDirty: Dispatch<SetStateAction<boolean>>;
  resetValues: () => void;
};

const FormStateContext = createContext<FormContextValue | null>(null);

const useFormState = () => {
  const ctx = useContext(FormStateContext);
  if (!ctx) throw new Error('FormStateContext missing');
  return ctx;
};

const getDefaultValues = (dive: DiveType): FormState => ({
  depth: dive.depth ?? null,
  duration: dive.duration ?? null,
  weight: dive.weight ?? null,
  notes: dive.notes ?? '',
  gas: dive.gas ?? 'air',
  equipment: Array.isArray(dive.equipment) ? dive.equipment : [],
  wildlife: Array.isArray(dive.wildlife) ? dive.wildlife : [],
  summary: dive.summary ?? '',
});

vi.mock('@/features/dives/hooks/useGetDive', () => ({
  useGetDive: () => ({
    dive: mockDive,
    isLoading: false,
    error: null,
    coverPhotoUrl: null,
    refetch: refetchMock,
  }),
}));

vi.mock('@/features/dives/hooks/useDeleteDive', () => ({
  useDeleteDive: () => ({
    mutateAsync: deleteDiveMock,
    isPending: false,
  }),
}));

vi.mock('@/features/dives/components/DiveEditFormProvider', () => ({
  default: ({
    dive,
    onCancel,
    onSaveSuccess,
    children,
  }: {
    dive: DiveType;
    onCancel: () => void;
    onSaveSuccess: () => void;
    children:
      | ReactNode
      | ((handleSave: () => void, handleCancel: () => void, saveError: string | null) => ReactNode);
  }) => {
    const defaults = useMemo(() => getDefaultValues(dive), [dive]);
    const [values, setValues] = useState<FormState>(defaults);
    const [isDirty, setIsDirty] = useState(false);

    const resetValues = () => {
      setValues(defaults);
      setIsDirty(false);
    };

    const handleSave = () => {
      if (values.depth === null || values.duration === null) return;
      updateDiveMock({
        id: dive.id,
        diveData: {
          depth: values.depth,
          duration: values.duration,
          notes: values.notes,
          gas: values.gas,
        },
      });
      setIsDirty(false);
      onSaveSuccess();
    };

    const handleCancel = () => {
      if (isDirty) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to cancel?'
        );
        if (!confirmed) return;
      }
      resetValues();
      onCancel();
    };

    const ctxValue: FormContextValue = {
      values,
      setValues,
      isDirty,
      setIsDirty,
      resetValues,
    };

    return (
      <FormStateContext.Provider value={ctxValue}>
        {typeof children === 'function' ? children(handleSave, handleCancel, null) : children}
      </FormStateContext.Provider>
    );
  },
}));

// Mock dive components with simplified versions for testing
vi.mock('@/features/dives/components/DiveHeader', () => ({
  default: ({
    onEdit,
    onSave,
    onCancel,
    isEditing,
  }: {
    onEdit: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    isEditing: boolean;
  }) => {
    const { isDirty } = useFormState();
    return (
      <div>
        {!isEditing ? (
          <button onClick={onEdit}>Edit</button>
        ) : (
          <>
            <button onClick={onSave} disabled={!isDirty}>
              Save
            </button>
            <button onClick={onCancel}>Cancel</button>
          </>
        )}
      </div>
    );
  },
}));

vi.mock('@/features/dives/components/DiveStats', () => ({
  default: ({ isEditing }: { isEditing: boolean }) => {
    const { values, setValues, setIsDirty } = useFormState();
    return (
      <div>
        <label>
          Depth
          <input
            type="number"
            value={values.depth ?? ''}
            onChange={(e) => {
              const next = e.target.value === '' ? null : Number(e.target.value);
              setValues((prev) => ({ ...prev, depth: next }));
              setIsDirty(true);
            }}
            disabled={!isEditing}
            data-testid="depth-input"
          />
        </label>
        <label>
          Duration
          <input
            type="number"
            value={values.duration ?? ''}
            onChange={(e) => {
              const next = e.target.value === '' ? null : Number(e.target.value);
              setValues((prev) => ({ ...prev, duration: next }));
              setIsDirty(true);
            }}
            disabled={!isEditing}
            data-testid="duration-input"
          />
        </label>
      </div>
    );
  },
}));

vi.mock('@/features/dives/components/DiveInformation', () => ({
  default: ({ isEditing }: { isEditing: boolean }) => {
    const { values, setValues, setIsDirty } = useFormState();
    return (
      <div>
        <label>
          Weight
          <input
            type="number"
            value={values.weight ?? ''}
            onChange={(e) => {
              const next = e.target.value === '' ? null : Number(e.target.value);
              setValues((prev) => ({ ...prev, weight: next }));
              setIsDirty(true);
            }}
            disabled={!isEditing}
            data-testid="weight-input"
          />
        </label>
      </div>
    );
  },
}));

vi.mock('@/features/dives/components/DiveNotes', () => ({
  default: ({ isEditing }: { isEditing: boolean }) => {
    const { values, setValues, setIsDirty } = useFormState();
    return (
      <div>
        <label>
          Notes
          <textarea
            value={values.notes}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, notes: e.target.value }));
              setIsDirty(true);
            }}
            disabled={!isEditing}
            data-testid="notes-input"
          />
        </label>
      </div>
    );
  },
}));

vi.mock('@/features/dives/components/GasUsage', () => ({
  default: ({ isEditing }: { isEditing: boolean }) => {
    const { values, setValues, setIsDirty } = useFormState();
    return (
      <div>
        <label>
          Gas Mix
          <select
            value={values.gas}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, gas: e.target.value }));
              setIsDirty(true);
            }}
            disabled={!isEditing}
            data-testid="gas-mix-select"
          >
            <option value="air">Air</option>
            <option value="nitrox">Nitrox</option>
          </select>
        </label>
      </div>
    );
  },
}));

vi.mock('@/features/dives/components/DiveEquipment', () => ({
  default: ({ isEditing }: { isEditing: boolean }) => {
    const { values, setValues, setIsDirty } = useFormState();
    return (
      <div>
        <div data-testid="equipment-list">
          {values.equipment.map((item, idx) => (
            <div key={idx}>
              {item}
              {isEditing && (
                <button
                  onClick={() => {
                    setValues((prev) => ({
                      ...prev,
                      equipment: prev.equipment.filter((_, i) => i !== idx),
                    }));
                    setIsDirty(true);
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditing && (
          <button
            onClick={() => {
              setValues((prev) => ({
                ...prev,
                equipment: [...prev.equipment, 'New Item'],
              }));
              setIsDirty(true);
            }}
          >
            Add Equipment
          </button>
        )}
      </div>
    );
  },
}));

vi.mock('@/features/dives/components/DiveWildlife', () => ({
  default: ({ isEditing }: { isEditing: boolean }) => {
    const { values, setValues, setIsDirty } = useFormState();
    return (
      <div>
        <div data-testid="wildlife-list">
          {values.wildlife.map((item, idx) => (
            <div key={idx}>
              {item}
              {isEditing && (
                <button
                  onClick={() => {
                    setValues((prev) => ({
                      ...prev,
                      wildlife: prev.wildlife.filter((_, i) => i !== idx),
                    }));
                    setIsDirty(true);
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditing && (
          <button
            onClick={() => {
              setValues((prev) => ({
                ...prev,
                wildlife: [...prev.wildlife, 'New Wildlife'],
              }));
              setIsDirty(true);
            }}
          >
            Add Wildlife
          </button>
        )}
      </div>
    );
  },
}));

vi.mock('@/features/dives/components/DiveSummary', () => ({
  default: ({ isEditing }: { isEditing: boolean }) => {
    const { values, setValues, setIsDirty } = useFormState();
    return (
      <div>
        <label>
          Summary
          <textarea
            value={values.summary}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, summary: e.target.value }));
              setIsDirty(true);
            }}
            disabled={!isEditing}
            data-testid="summary-input"
          />
        </label>
        {isEditing && (
          <button
            onClick={() => {
              setValues((prev) => ({ ...prev, summary: 'AI generated summary' }));
              setIsDirty(true);
            }}
          >
            Generate
          </button>
        )}
      </div>
    );
  },
}));

vi.mock('@/features/dives/components/DiveGallery', () => ({
  default: () => <div>Gallery</div>,
}));

vi.mock('@/features/dives/components/DeleteDiveModal', () => ({
  default: () => <div>Delete Modal</div>,
}));

vi.mock('@/features/dives/components/DiveBackground', () => ({
  default: () => <div>Background</div>,
}));

vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: () => ({
    unitSystem: 'metric',
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Dive Page - Edit Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateDiveMock.mockResolvedValue(undefined);
    deleteDiveMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Entering Edit Mode', () => {
    it('should enter edit mode when Edit button is clicked', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
    });

    it('should enable all form fields in edit mode', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      expect(screen.getByTestId('depth-input')).not.toBeDisabled();
      expect(screen.getByTestId('duration-input')).not.toBeDisabled();
      expect(screen.getByTestId('notes-input')).not.toBeDisabled();
      expect(screen.getByTestId('weight-input')).not.toBeDisabled();
    });
  });

  describe('Field Editing', () => {
    it('should update depth field', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const depthInput = screen.getByTestId('depth-input');
      fireEvent.change(depthInput, { target: { value: '30' } });

      expect(depthInput).toHaveValue(30);
    });

    it('should update notes field', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const notesInput = screen.getByTestId('notes-input');
      fireEvent.change(notesInput, { target: { value: 'Updated notes' } });

      expect(notesInput).toHaveValue('Updated notes');
    });

    it('should update gas mix selection', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const gasSelect = screen.getByTestId('gas-mix-select');
      fireEvent.change(gasSelect, { target: { value: 'nitrox' } });

      expect(gasSelect).toHaveValue('nitrox');
    });

    it('should add equipment item', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const addButton = screen.getByRole('button', { name: /add equipment/i });
      fireEvent.click(addButton);

      const equipmentList = screen.getByTestId('equipment-list');
      expect(equipmentList).toHaveTextContent('New Item');
    });

    it('should remove equipment item', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      fireEvent.click(removeButtons[0]);

      const equipmentList = screen.getByTestId('equipment-list');
      expect(equipmentList).not.toHaveTextContent('BCD');
    });
  });

  describe('Change Detection', () => {
    it('should enable Save button when changes are made', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();

      const depthInput = screen.getByTestId('depth-input');
      fireEvent.change(depthInput, { target: { value: '30' } });

      expect(saveButton).not.toBeDisabled();
    });

    it('should disable Save button when no changes', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Saving Changes', () => {
    it('should save all edited fields', async () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '30' } });
      fireEvent.change(screen.getByTestId('duration-input'), { target: { value: '50' } });
      fireEvent.change(screen.getByTestId('notes-input'), { target: { value: 'Updated notes' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(updateDiveMock).toHaveBeenCalledWith({
          id: 'dive-123',
          diveData: expect.objectContaining({
            depth: 30,
            duration: 50,
            notes: 'Updated notes',
          }),
        });
      });
    });

    it('should exit edit mode after successful save', async () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '30' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });
    });

    it('should not save if depth is null', async () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(updateDiveMock).not.toHaveBeenCalled();
    });

    it('should not save if duration is null', async () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.change(screen.getByTestId('duration-input'), { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(updateDiveMock).not.toHaveBeenCalled();
    });
  });

  describe('Canceling Edit', () => {
    it('should show confirmation dialog when canceling with unsaved changes', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '30' } });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(confirmSpy).toHaveBeenCalledWith(
        'You have unsaved changes. Are you sure you want to cancel?'
      );

      confirmSpy.mockRestore();
    });

    it('should not exit edit mode when canceling confirmation', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '30' } });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();

      confirmSpy.mockRestore();
    });

    it('should exit edit mode when confirming cancel', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '30' } });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();

      confirmSpy.mockRestore();
    });

    it('should reset fields to original values when cancel is confirmed', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const depthInput = screen.getByTestId('depth-input');
      fireEvent.change(depthInput, { target: { value: '30' } });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(depthInput).toHaveValue(25); // Original value

      confirmSpy.mockRestore();
    });
  });

  describe('AI Summary Generation', () => {
    it('should show Generate button only in edit mode', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      expect(screen.queryByRole('button', { name: /generate/i })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
    });

    it('should populate summary field when Generate is clicked', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);

      const summaryInput = screen.getByTestId('summary-input');
      expect(summaryInput).toHaveValue('AI generated summary');
    });

    it('should enable Save button after generating summary', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      const generateButton = screen.getByRole('button', { name: /generate/i });
      fireEvent.click(generateButton);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple field edits before saving', async () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '35' } });
      fireEvent.change(screen.getByTestId('duration-input'), { target: { value: '60' } });
      fireEvent.change(screen.getByTestId('notes-input'), { target: { value: 'New notes' } });
      fireEvent.change(screen.getByTestId('gas-mix-select'), { target: { value: 'nitrox' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(updateDiveMock).toHaveBeenCalledWith({
          id: 'dive-123',
          diveData: expect.objectContaining({
            depth: 35,
            duration: 60,
            notes: 'New notes',
            gas: 'nitrox',
          }),
        });
      });
    });

    it('should preserve changes when switching between fields', () => {
      render(<DivePage />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '35' } });
      fireEvent.change(screen.getByTestId('duration-input'), { target: { value: '60' } });

      expect(screen.getByTestId('depth-input')).toHaveValue(35);
      expect(screen.getByTestId('duration-input')).toHaveValue(60);
    });
  });
});
