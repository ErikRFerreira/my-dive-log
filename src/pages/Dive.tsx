import Loading from '@/components/common/Loading';
import GoBack from '@/components/ui/GoBack';
import {
  AirUsage,
  DeleteDiveModal,
  DiveEquipment,
  DiveGallery,
  DiveHeader,
  DiveInformation,
  DiveNotes,
  DiveStats,
  DiveSummary,
  DiveWildlife,
  useDeleteDive,
  useGenerateSummary,
  useGetDive,
  useUpdateDive,
} from '@/features/dives';
import DiveBackground from '@/features/dives/components/DiveBackground';

import type { Dive as DiveType, UpdateDivePatch } from '@/features/dives/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Type aliases for field handlers
type TextField = keyof Pick<DiveType, 'summary' | 'notes'>;
type NumericField = keyof Pick<
  DiveType,
  'depth' | 'duration' | 'water_temp' | 'start_pressure' | 'end_pressure' | 'air_usage' | 'weight'
>;
type SelectField = keyof Pick<
  DiveType,
  'visibility' | 'dive_type' | 'water_type' | 'exposure' | 'gas' | 'currents'
>;

function Dive() {
  const { dive, isLoading, error, coverPhotoUrl } = useGetDive();
  const { mutateAsync: deleteDive, isPending: isDeleting } = useDeleteDive();
  const { mutateAsync: updateDive, isPending: isUpdating } = useUpdateDive();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [locationNameDraft, setLocationNameDraft] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newWildlife, setNewWildlife] = useState('');
  const [editedDive, setEditedDive] = useState<DiveType | null>(null);

  const { generateSummary, isGenerating } = useGenerateSummary(
    dive ?? ({} as DiveType),
    setEditedDive
  );

  const navigate = useNavigate();

  // Determine which dive data to display: original or edited
  const currentDive = isEditMode && editedDive ? editedDive : dive;

  // Delete dive and navigate back to dives list
  const onConfirmDeletion = async () => {
    if (!currentDive) return;
    try {
      await deleteDive(currentDive.id);
      setIsModalOpen(false);
      navigate('/dives');
    } catch (err) {
      console.error('Failed to delete dive:', err);
    }
  };

  // Cancel deletion
  const onCancelDelete = () => setIsModalOpen(false);

  // Start edit mode
  const startEdit = () => {
    if (!dive) return;
    setEditedDive(dive);
    setLocationNameDraft(dive.locations?.name ?? '');
    setIsEditMode(true);
  };

  // Save edited dive
  const handleSaveEdit = async () => {
    if (!editedDive) return;

    const updates: UpdateDivePatch = {
      date: editedDive.date,
      depth: editedDive.depth,
      duration: editedDive.duration,
      notes: editedDive.notes,
      summary: editedDive.summary,
      water_temp: editedDive.water_temp,
      visibility: editedDive.visibility,
      start_pressure: editedDive.start_pressure,
      end_pressure: editedDive.end_pressure,
      air_usage: editedDive.air_usage,
      equipment: editedDive.equipment ?? [],
      wildlife: editedDive.wildlife ?? [],
      dive_type: editedDive.dive_type,
      water_type: editedDive.water_type,
      exposure: editedDive.exposure,
      gas: editedDive.gas,
      currents: editedDive.currents,
      weight: editedDive.weight,
    };

    try {
      const trimmedLocationName = locationNameDraft.trim();
      const currentLocationName = dive?.locations?.name ?? '';
      if (trimmedLocationName && trimmedLocationName !== currentLocationName) {
        updates.locationName = trimmedLocationName;
        updates.locationCountry = dive?.locations?.country ?? null;
        updates.locationCountryCode = dive?.locations?.country_code ?? null;
      }

      await updateDive({ id: editedDive.id, diveData: updates });
      setIsEditMode(false);
      setEditedDive(null);
    } catch (err) {
      console.error('Failed to update dive:', err);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedDive(null);
    setLocationNameDraft(dive?.locations?.name ?? '');
  };

  // Handle changes in edit mode for text fields
  const handleTextChange =
    (field: TextField) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setEditedDive((prev) =>
        prev
          ? {
              ...prev,
              [field]: value,
            }
          : prev
      );
    };

  // Handle date changes
  const handleDateChange = (date: string) => {
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            date,
          }
        : prev
    );
  };

  // Handle changes for numeric fields
  const handleNumberChange = (field: NumericField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = raw === '' ? null : Number(raw);
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            [field]: parsed,
          }
        : prev
    );
  };

  // Handler for select fields
  const handleSelectChange = (field: SelectField, value: string) => {
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : prev
    );
  };

  // Add equipment item
  const addEquipment = () => {
    if (!isEditMode || !editedDive || !newEquipment.trim()) return;
    const value = newEquipment.trim();
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            equipment: [...(prev.equipment ?? []), value],
          }
        : prev
    );
    setNewEquipment('');
  };

  // Remove equipment item
  const removeEquipment = (index: number) => {
    if (!isEditMode || !editedDive) return;
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            equipment: (prev.equipment ?? []).filter((_, i) => i !== index),
          }
        : prev
    );
  };

  // Add wildlife item
  const addWildlife = () => {
    if (!isEditMode || !editedDive || !newWildlife.trim()) return;
    const value = newWildlife.trim();
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            wildlife: [...(prev.wildlife ?? []), value],
          }
        : prev
    );
    setNewWildlife('');
  };

  // Remove wildlife item
  const removeWildlife = (index: number) => {
    if (!isEditMode || !editedDive) return;
    setEditedDive((prev) =>
      prev
        ? {
            ...prev,
            wildlife: (prev.wildlife ?? []).filter((_, i) => i !== index),
          }
        : prev
    );
  };

  // Generate AI summary
  const handleGenerateAISummary = async () => {
    if (!editedDive) return;
    try {
      await generateSummary();
    } catch (err) {
      console.error('Failed to generate summary', err);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !dive || !currentDive) {
    return (
      <div className="p-8">
        <GoBack />
        <p className="text-muted-foreground">Dive not found</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Background */}
      {coverPhotoUrl && <DiveBackground coverPhotoUrl={coverPhotoUrl} />}

      <div className="relative z-10 p-8 space-y-6">
        {/* Header */}
        <DiveHeader
          dive={currentDive}
          isEditMode={isEditMode}
          isUpdating={isUpdating}
          locationName={locationNameDraft}
          onLocationNameChange={setLocationNameDraft}
          onDateChange={handleDateChange}
          onStartEdit={startEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onOpenDeleteModal={() => setIsModalOpen(true)}
        />

        {/* Stats */}
        <DiveStats
          dive={currentDive}
          isEditMode={isEditMode}
          onNumberChange={handleNumberChange}
          onSelectChange={handleSelectChange}
        />

        {/* Gallery */}
        <DiveGallery diveId={currentDive.id} coverPhotoPath={currentDive.cover_photo_path} />

        {/* Information */}
        <DiveInformation
          dive={currentDive}
          isEditMode={isEditMode}
          onNumberChange={handleNumberChange}
          onSelectChange={handleSelectChange}
        />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Summary */}
          <DiveSummary
            dive={currentDive}
            isEditMode={isEditMode}
            isGenerating={isGenerating}
            onTextChange={handleTextChange}
            onGenerateSummary={handleGenerateAISummary}
          />
          {/* Air Usage */}
          <AirUsage
            dive={currentDive}
            isEditMode={isEditMode}
            onNumberChange={handleNumberChange}
          />
        </div>

        {/* Notes */}
        <DiveNotes dive={currentDive} isEditMode={isEditMode} onTextChange={handleTextChange} />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Equipment */}
          <DiveEquipment
            dive={currentDive}
            isEditMode={isEditMode}
            newEquipment={newEquipment}
            onNewEquipmentChange={setNewEquipment}
            onAddEquipment={addEquipment}
            onRemoveEquipment={removeEquipment}
          />

          {/* Wildlife */}
          <DiveWildlife
            dive={currentDive}
            isEditMode={isEditMode}
            newWildlife={newWildlife}
            onNewWildlifeChange={setNewWildlife}
            onAddWildlife={addWildlife}
            onRemoveWildlife={removeWildlife}
          />
        </div>

        {/* Delete Dive Modal */}
        <DeleteDiveModal
          isOpen={isModalOpen}
          location={currentDive.locations?.name ?? 'N/A'}
          isPending={isDeleting}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDeletion}
        />
      </div>
    </div>
  );
}

export default Dive;
