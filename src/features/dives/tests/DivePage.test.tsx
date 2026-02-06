import DivePage from '@/pages/Dive';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

// Mock all dive components with simplified versions for testing
vi.mock('@/features/dives', () => ({
  useGetDive: () => ({
    dive: mockDive,
    isLoading: false,
    error: null,
    coverPhotoUrl: null,
  }),
  useUpdateDive: () => ({
    mutateAsync: updateDiveMock,
    isPending: false,
  }),
  useDeleteDive: () => ({
    mutateAsync: deleteDiveMock,
    isPending: false,
  }),
  DiveHeader: ({
    onEdit,
    onCancelEdit,
    onSaveEdit,
    isEditing,
    hasChanges,
  }: {
    onEdit: () => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    isEditing: boolean;
    hasChanges: boolean;
  }) => (
    <div>
      {!isEditing ? (
        <button onClick={onEdit}>Edit</button>
      ) : (
        <>
          <button onClick={onSaveEdit} disabled={!hasChanges}>
            Save
          </button>
          <button onClick={onCancelEdit}>Cancel</button>
        </>
      )}
    </div>
  ),
  DiveStats: ({
    stats,
    onFieldChange,
    isEditing,
  }: {
    stats: { depth: number | null; duration: number | null };
    onFieldChange: (field: string, value: number | null) => void;
    isEditing: boolean;
  }) => (
    <div>
      <label>
        Depth
        <input
          type="number"
          value={stats.depth ?? ''}
          onChange={(e) => onFieldChange('depth', Number(e.target.value) || null)}
          disabled={!isEditing}
          data-testid="depth-input"
        />
      </label>
      <label>
        Duration
        <input
          type="number"
          value={stats.duration ?? ''}
          onChange={(e) => onFieldChange('duration', Number(e.target.value) || null)}
          disabled={!isEditing}
          data-testid="duration-input"
        />
      </label>
    </div>
  ),
  DiveInformation: ({
    editedFields,
    onFieldChange,
    isEditing,
  }: {
    editedFields: { weight: number | null };
    onFieldChange: (field: string, value: number | null) => void;
    isEditing: boolean;
  }) => (
    <div>
      <label>
        Weight
        <input
          type="number"
          value={editedFields.weight ?? ''}
          onChange={(e) => onFieldChange('weight', Number(e.target.value) || null)}
          disabled={!isEditing}
          data-testid="weight-input"
        />
      </label>
    </div>
  ),
  DiveNotes: ({
    notes,
    onNotesChange,
    isEditing,
  }: {
    notes: string;
    onNotesChange: (value: string) => void;
    isEditing: boolean;
  }) => (
    <div>
      <label>
        Notes
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={!isEditing}
          data-testid="notes-input"
        />
      </label>
    </div>
  ),
  GasUsage: ({
    gasMix,
    onGasMixChange,
    isEditing,
  }: {
    gasMix: string;
    onGasMixChange: (value: string) => void;
    isEditing: boolean;
  }) => (
    <div>
      <label>
        Gas Mix
        <select
          value={gasMix}
          onChange={(e) => onGasMixChange(e.target.value)}
          disabled={!isEditing}
          data-testid="gas-mix-select"
        >
          <option value="air">Air</option>
          <option value="nitrox">Nitrox</option>
        </select>
      </label>
    </div>
  ),
  DiveEquipment: ({
    equipment,
    onEquipmentChange,
    isEditing,
  }: {
    equipment: string[];
    onEquipmentChange: (value: string[]) => void;
    isEditing: boolean;
  }) => (
    <div>
      <div data-testid="equipment-list">
        {equipment.map((item: string, idx: number) => (
          <div key={idx}>
            {item}
            {isEditing && (
              <button
                onClick={() =>
                  onEquipmentChange(equipment.filter((_: string, i: number) => i !== idx))
                }
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      {isEditing && (
        <button onClick={() => onEquipmentChange([...equipment, 'New Item'])}>Add Equipment</button>
      )}
    </div>
  ),
  DiveWildlife: ({
    wildlife,
    onWildlifeChange,
    isEditing,
  }: {
    wildlife: string[];
    onWildlifeChange: (value: string[]) => void;
    isEditing: boolean;
  }) => (
    <div>
      <div data-testid="wildlife-list">
        {wildlife.map((item: string, idx: number) => (
          <div key={idx}>
            {item}
            {isEditing && (
              <button
                onClick={() =>
                  onWildlifeChange(wildlife.filter((_: string, i: number) => i !== idx))
                }
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      {isEditing && (
        <button onClick={() => onWildlifeChange([...wildlife, 'New Wildlife'])}>
          Add Wildlife
        </button>
      )}
    </div>
  ),
  DiveSummary: ({
    summary,
    onSummaryChange,
    isEditing,
  }: {
    summary: string;
    onSummaryChange: (value: string) => void;
    isEditing: boolean;
  }) => (
    <div>
      <label>
        Summary
        <textarea
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          disabled={!isEditing}
          data-testid="summary-input"
        />
      </label>
      {isEditing && (
        <button onClick={() => onSummaryChange('AI generated summary')}>Generate</button>
      )}
    </div>
  ),
  DiveGallery: () => <div>Gallery</div>,
  DeleteDiveModal: () => <div>Delete Modal</div>,
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

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.change(screen.getByTestId('depth-input'), { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(alertSpy).toHaveBeenCalledWith('Depth and duration are required.');
      expect(updateDiveMock).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('should not save if duration is null', async () => {
      render(<DivePage />, { wrapper: createWrapper() });

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.change(screen.getByTestId('duration-input'), { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      expect(alertSpy).toHaveBeenCalledWith('Depth and duration are required.');
      expect(updateDiveMock).not.toHaveBeenCalled();

      alertSpy.mockRestore();
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
