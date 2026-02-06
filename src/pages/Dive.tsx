import Loading from '@/components/common/Loading';
import GoBack from '@/components/ui/GoBack';
import QueryErrorFallback from '@/components/common/QueryErrorFallback';
import {
  DeleteDiveModal,
  DiveEquipment,
  DiveGallery,
  DiveHeader,
  DiveInformation,
  DiveNotes,
  DiveStats,
  DiveSummary,
  DiveWildlife,
  GasUsage,
  useDeleteDive,
  useGetDive,
  DiveEditFormProvider,
} from '@/features/dives';
import DiveBackground from '@/features/dives/components/DiveBackground';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DivePage() {
  const { dive, isLoading, error, coverPhotoUrl, refetch } = useGetDive();
  const { mutateAsync: deleteDive, isPending: isDeleting } = useDeleteDive();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  // Delete dive and navigate back to dives list
  const onConfirmDeletion = async () => {
    if (!dive) return;
    try {
      await deleteDive(dive.id);
      setIsModalOpen(false);
      navigate('/dives');
    } catch {
      // Error toast is handled by useDeleteDive hook
    }
  };

  // Cancel deletion
  const onCancelDelete = () => setIsModalOpen(false);

  // Edit mode handlers
  const handleStartEdit = () => setIsEditing(true);
  const handleCancelEdit = () => setIsEditing(false);
  const handleSaveSuccess = () => setIsEditing(false);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <QueryErrorFallback
        error={error as Error}
        onRetry={refetch}
        title="Failed to load dive"
        description="We couldn't load this dive. It may have been deleted or you may not have permission to view it."
      />
    );
  }

  if (!dive) {
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
      {coverPhotoUrl || dive.dive_type ? (
        <DiveBackground coverPhotoUrl={coverPhotoUrl} diveType={dive.dive_type} />
      ) : null}

      {/* Wrap content in form provider when editing */}
      {isEditing ? (
        <DiveEditFormProvider
          dive={dive}
          onCancel={handleCancelEdit}
          onSaveSuccess={handleSaveSuccess}
        >
          {(handleSave, handleCancel) => (
            <div className="relative z-10 p-8 space-y-6">
              {/* Header with form actions */}
              <DiveHeader
                dive={dive}
                onOpenDeleteModal={() => setIsModalOpen(true)}
                isEditing={isEditing}
                onEdit={handleStartEdit}
                onSave={handleSave}
                onCancel={handleCancel}
              />

              {/* Stats */}
              <DiveStats dive={dive} isEditing={isEditing} />

              {/* Gallery */}
              <DiveGallery diveId={dive.id} coverPhotoPath={dive.cover_photo_path} />

              {/* Information */}
              <DiveInformation dive={dive} isEditing={isEditing} />

              <div className="grid md:grid-cols-2 gap-6 items-stretch">
                {/* Notes */}
                <DiveNotes dive={dive} isEditing={isEditing} />

                {/* Gas Usage */}
                <GasUsage dive={dive} isEditing={isEditing} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Equipment */}
                <DiveEquipment dive={dive} isEditing={isEditing} />

                {/* Wildlife */}
                <DiveWildlife dive={dive} isEditing={isEditing} />
              </div>

              {/* Summary */}
              <DiveSummary dive={dive} isEditing={isEditing} />

              {/* Delete Dive Modal */}
              <DeleteDiveModal
                isOpen={isModalOpen}
                location={dive.locations?.name ?? 'N/A'}
                isPending={isDeleting}
                onCancel={onCancelDelete}
                onConfirm={onConfirmDeletion}
              />
            </div>
          )}
        </DiveEditFormProvider>
      ) : (
        <div className="relative z-10 p-8 space-y-6">
          {/* Header */}
          <DiveHeader
            dive={dive}
            onOpenDeleteModal={() => setIsModalOpen(true)}
            isEditing={isEditing}
            onEdit={handleStartEdit}
          />

          {/* Stats */}
          <DiveStats dive={dive} isEditing={isEditing} />

          {/* Gallery */}
          <DiveGallery diveId={dive.id} coverPhotoPath={dive.cover_photo_path} />

          {/* Information */}
          <DiveInformation dive={dive} isEditing={isEditing} />

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Notes */}
            <DiveNotes dive={dive} isEditing={isEditing} />

            {/* Gas Usage */}
            <GasUsage dive={dive} isEditing={isEditing} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Equipment */}
            <DiveEquipment dive={dive} isEditing={isEditing} />

            {/* Wildlife */}
            <DiveWildlife dive={dive} isEditing={isEditing} />
          </div>

          {/* Summary */}
          <DiveSummary dive={dive} isEditing={isEditing} />

          {/* Delete Dive Modal */}
          <DeleteDiveModal
            isOpen={isModalOpen}
            location={dive.locations?.name ?? 'N/A'}
            isPending={isDeleting}
            onCancel={onCancelDelete}
            onConfirm={onConfirmDeletion}
          />
        </div>
      )}
    </div>
  );
}

export default DivePage;
