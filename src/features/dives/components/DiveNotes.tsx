import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Dive } from '../types';
import { useUpdateDive } from '../hooks/useUpdateDive';

interface DiveNotesProps {
  dive: Dive;
  isEditing: boolean;
  isSaving: boolean;
  notes: string;
  onNotesChange: (value: string) => void;
}

function DiveNotes({ dive, isEditing, isSaving, notes, onNotesChange }: DiveNotesProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [localNotes, setLocalNotes] = useState(dive.notes ?? '');
  const { mutateAsync: updateDive, isPending: isLocalSaving } = useUpdateDive();
  const isEditingActive = isEditing || localIsEditing;
  const isSavingActive = isEditing ? isSaving : isLocalSaving;
  const activeNotes = isEditing ? notes : localNotes;

  useEffect(() => {
    if (isEditing) {
      setLocalIsEditing(false);
      setLocalNotes(dive.notes ?? '');
    } else if (!localIsEditing) {
      setLocalNotes(dive.notes ?? '');
    }
  }, [dive.notes, isEditing, localIsEditing]);

  const hasChanges = localNotes !== (dive.notes ?? '');

  const handleEdit = () => {
    setLocalNotes(dive.notes ?? '');
    setLocalIsEditing(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }
    setLocalNotes(dive.notes ?? '');
    setLocalIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateDive({
        id: dive.id,
        diveData: { notes: localNotes || null },
      });
      setLocalIsEditing(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  return (
    <section className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Notes</h3>
        </div>
        {isEditing ? (
          <button
            type="button"
            className="text-primary/60 cursor-not-allowed font-medium"
            disabled
          >
            Edit
          </button>
        ) : !localIsEditing ? (
          <button
            type="button"
            onClick={handleEdit}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSavingActive || !hasChanges}
              size="sm"
              className="gap-1 h-8 bg-primary hover:bg-primary/90"
            >
              <Check className="w-4 h-4" />
              {isSavingActive ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isSavingActive}
              size="sm"
              variant="outline"
              className="gap-1 h-8"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl h-full flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col">
          {isEditingActive ? (
            <Textarea
              value={activeNotes}
              onChange={(e) =>
                isEditing ? onNotesChange(e.target.value) : setLocalNotes(e.target.value)
              }
              className="flex-1"
              placeholder="Add notes..."
              disabled={isSavingActive}
            />
          ) : (
            <p className="text-foreground leading-relaxed flex-1">{dive.notes ?? 'N/A'}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default DiveNotes;
