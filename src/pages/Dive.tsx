import Loading from '@/components/common/Loading';
import GoBack from '@/components/ui/GoBack';
import {
  GasUsage,
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
  useGetDive,
  useUpdateDive,
} from '@/features/dives';

import DiveBackground from '@/features/dives/components/DiveBackground';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Dive, Gas } from '@/features/dives/types';

function Dive() {
  const { dive, isLoading, error, coverPhotoUrl } = useGetDive();
  const { mutateAsync: deleteDive, isPending: isDeleting } = useDeleteDive();
  const { mutateAsync: updateDive, isPending: isSaving } = useUpdateDive();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  type DiveEditState = {
    depth: Dive['depth'] | null;
    duration: Dive['duration'] | null;
    water_temp: Dive['water_temp'];
    visibility: Dive['visibility'];
    dive_type: Dive['dive_type'];
    water_type: Dive['water_type'];
    exposure: Dive['exposure'];
    currents: Dive['currents'];
    weight: Dive['weight'];
    gas: Gas;
    nitrox_percent: number;
    start_pressure: Dive['start_pressure'];
    end_pressure: Dive['end_pressure'];
    equipment: string[];
    wildlife: string[];
    notes: string;
    summary: string;
  };

  const [editState, setEditState] = useState<DiveEditState | null>(null);

  const buildEditState = (sourceDive: Dive): DiveEditState => ({
    depth: sourceDive.depth ?? null,
    duration: sourceDive.duration ?? null,
    water_temp: sourceDive.water_temp ?? null,
    visibility: sourceDive.visibility ?? null,
    dive_type: sourceDive.dive_type ?? null,
    water_type: sourceDive.water_type ?? null,
    exposure: sourceDive.exposure ?? null,
    currents: sourceDive.currents ?? null,
    weight: sourceDive.weight ?? null,
    gas: sourceDive.gas ?? 'air',
    nitrox_percent: sourceDive.nitrox_percent ?? 21,
    start_pressure: sourceDive.start_pressure ?? null,
    end_pressure: sourceDive.end_pressure ?? null,
    equipment: Array.isArray(sourceDive.equipment) ? sourceDive.equipment : [],
    wildlife: Array.isArray(sourceDive.wildlife) ? sourceDive.wildlife : [],
    notes: sourceDive.notes ?? '',
    summary: sourceDive.summary ?? '',
  });

  useEffect(() => {
    if (dive && !isEditing) {
      setEditState(buildEditState(dive));
    }
  }, [dive, isEditing]);

  // Delete dive and navigate back to dives list
  const onConfirmDeletion = async () => {
    if (!dive) return;
    try {
      await deleteDive(dive.id);
      setIsModalOpen(false);
      navigate('/dives');
    } catch (err) {
      console.error('Failed to delete dive:', err);
    }
  };

  // Cancel deletion
  const onCancelDelete = () => setIsModalOpen(false);

  const currentEditState = dive ? (editState ?? buildEditState(dive)) : null;
  const calculatedAirUsage =
    currentEditState &&
    currentEditState.start_pressure !== null &&
    currentEditState.end_pressure !== null
      ? currentEditState.start_pressure - currentEditState.end_pressure
      : null;

  const hasChanges = (() => {
    if (!dive || !currentEditState) return false;
    const baseEquipment = Array.isArray(dive.equipment) ? dive.equipment : [];
    const baseWildlife = Array.isArray(dive.wildlife) ? dive.wildlife : [];
    return (
      currentEditState.dive_type !== (dive.dive_type ?? null) ||
      currentEditState.water_type !== (dive.water_type ?? null) ||
      currentEditState.exposure !== (dive.exposure ?? null) ||
      currentEditState.currents !== (dive.currents ?? null) ||
      currentEditState.weight !== (dive.weight ?? null) ||
      currentEditState.depth !== dive.depth ||
      currentEditState.duration !== dive.duration ||
      currentEditState.water_temp !== (dive.water_temp ?? null) ||
      currentEditState.visibility !== (dive.visibility ?? null) ||
      currentEditState.gas !== (dive.gas ?? 'air') ||
      currentEditState.nitrox_percent !== (dive.nitrox_percent ?? 21) ||
      currentEditState.start_pressure !== (dive.start_pressure ?? null) ||
      currentEditState.end_pressure !== (dive.end_pressure ?? null) ||
      JSON.stringify(currentEditState.equipment) !== JSON.stringify(baseEquipment) ||
      JSON.stringify(currentEditState.wildlife) !== JSON.stringify(baseWildlife) ||
      currentEditState.notes !== (dive.notes ?? '') ||
      currentEditState.summary !== (dive.summary ?? '')
    );
  })();

  const handleStartEdit = () => {
    if (!dive) return;
    setEditState(buildEditState(dive));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!dive) return;
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }
    setEditState(buildEditState(dive));
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!dive || !currentEditState) return;
    if (currentEditState.depth === null || currentEditState.duration === null) {
      window.alert('Depth and duration are required.');
      return;
    }
    try {
      const notes = currentEditState.notes.trim();
      const summary = currentEditState.summary.trim();
      await updateDive({
        id: dive.id,
        diveData: {
          depth: currentEditState.depth,
          duration: currentEditState.duration,
          water_temp: currentEditState.water_temp,
          visibility: currentEditState.visibility,
          dive_type: currentEditState.dive_type,
          water_type: currentEditState.water_type,
          exposure: currentEditState.exposure,
          currents: currentEditState.currents,
          weight: currentEditState.weight,
          gas: currentEditState.gas,
          nitrox_percent:
            currentEditState.gas === 'nitrox' ? currentEditState.nitrox_percent : null,
          start_pressure: currentEditState.start_pressure,
          end_pressure: currentEditState.end_pressure,
          air_usage: calculatedAirUsage,
          equipment: currentEditState.equipment,
          wildlife: currentEditState.wildlife,
          notes: notes.length > 0 ? currentEditState.notes : null,
          summary: summary.length > 0 ? currentEditState.summary : null,
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update dive:', err);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !dive) {
    return (
      <div className="p-8">
        <GoBack />
        <p className="text-muted-foreground">Dive not found</p>
      </div>
    );
  }

  if (!currentEditState) {
    return <Loading />;
  }

  const updateEditField = <K extends keyof DiveEditState>(key: K, value: DiveEditState[K]) => {
    setEditState((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  console.log(coverPhotoUrl);

  return (
    <div className="mt-8">
      {/* Background */}
      {coverPhotoUrl || dive.dive_type ? (
        <DiveBackground coverPhotoUrl={coverPhotoUrl} diveType={dive.dive_type} />
      ) : null}

      <div className="relative z-10 p-8 space-y-6">
        {/* Header */}
        <DiveHeader
          dive={dive}
          onOpenDeleteModal={() => setIsModalOpen(true)}
          isEditing={isEditing}
          isSaving={isSaving}
          hasChanges={hasChanges}
          onEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
        />

        {/* Stats */}
        <DiveStats
          dive={dive}
          isEditing={isEditing}
          isSaving={isSaving}
          stats={{
            depth: currentEditState.depth,
            duration: currentEditState.duration,
            water_temp: currentEditState.water_temp,
            dive_type: currentEditState.dive_type,
          }}
          onFieldChange={updateEditField}
        />

        {/* Gallery */}
        <DiveGallery diveId={dive.id} coverPhotoPath={dive.cover_photo_path} />

        {/* Information */}
        <DiveInformation
          dive={dive}
          isEditing={isEditing}
          isSaving={isSaving}
          editedFields={{
            visibility: currentEditState.visibility,
            water_type: currentEditState.water_type,
            exposure: currentEditState.exposure,
            currents: currentEditState.currents,
            weight: currentEditState.weight,
          }}
          onFieldChange={(field, value) =>
            setEditState((prev) => (prev ? { ...prev, [field]: value } : prev))
          }
        />

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Notes */}
          <DiveNotes
            dive={dive}
            isEditing={isEditing}
            isSaving={isSaving}
            notes={currentEditState.notes}
            onNotesChange={(value) => updateEditField('notes', value)}
          />

          {/* Gas Usage */}
          <GasUsage
            dive={dive}
            isEditing={isEditing}
            isSaving={isSaving}
            gasMix={currentEditState.gas}
            nitroxPercent={currentEditState.nitrox_percent}
            startPressure={currentEditState.start_pressure}
            endPressure={currentEditState.end_pressure}
            airUsage={calculatedAirUsage}
            onGasMixChange={(value) => updateEditField('gas', value)}
            onNitroxPercentChange={(value) => updateEditField('nitrox_percent', value)}
            onStartPressureChange={(value) => updateEditField('start_pressure', value)}
            onEndPressureChange={(value) => updateEditField('end_pressure', value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Equipment */}
          <DiveEquipment
            dive={dive}
            isEditing={isEditing}
            isSaving={isSaving}
            equipment={currentEditState.equipment}
            onEquipmentChange={(value) => updateEditField('equipment', value)}
          />

          {/* Wildlife */}
          <DiveWildlife
            dive={dive}
            isEditing={isEditing}
            isSaving={isSaving}
            wildlife={currentEditState.wildlife}
            onWildlifeChange={(value) => updateEditField('wildlife', value)}
          />
        </div>

        {/* Summary */}
        <DiveSummary
          dive={dive}
          isEditing={isEditing}
          isSaving={isSaving}
          summary={currentEditState.summary}
          onSummaryChange={(value) => updateEditField('summary', value)}
        />

        {/* Delete Dive Modal */}
        <DeleteDiveModal
          isOpen={isModalOpen}
          location={dive.locations?.name ?? 'N/A'}
          isPending={isDeleting}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDeletion}
        />
      </div>
    </div>
  );
}

export default Dive;
