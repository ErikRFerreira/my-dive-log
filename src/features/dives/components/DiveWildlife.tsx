import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Fish, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Dive } from '../types';
import { useUpdateDive } from '../hooks/useUpdateDive';

interface DiveWildlifeProps {
  dive: Dive;
  isEditing: boolean;
  isSaving: boolean;
  wildlife: string[];
  onWildlifeChange: (next: string[]) => void;
}

function DiveWildlife({
  dive,
  isEditing,
  isSaving,
  wildlife,
  onWildlifeChange,
}: DiveWildlifeProps) {
  const WILDLIFE_LIMIT = 20;
  const WILDLIFE_ITEM_LIMIT = 40;
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [localWildlife, setLocalWildlife] = useState<string[]>(
    Array.isArray(dive.wildlife) ? dive.wildlife : []
  );
  const [newItem, setNewItem] = useState('');
  const { mutateAsync: updateDive, isPending: isLocalSaving } = useUpdateDive();
  const baseWildlife = useMemo(
    () => (Array.isArray(dive.wildlife) ? dive.wildlife : []),
    [dive.wildlife]
  );
  const isEditingActive = isEditing || localIsEditing;
  const activeWildlife = isEditing ? wildlife : localWildlife;
  const displayWildlife = isEditingActive ? activeWildlife : baseWildlife;
  const isSavingActive = isEditing ? isSaving : isLocalSaving;

  useEffect(() => {
    if (isEditing) {
      setLocalIsEditing(false);
      setLocalWildlife(baseWildlife);
      setNewItem('');
    } else if (!localIsEditing) {
      setLocalWildlife(baseWildlife);
    }
  }, [baseWildlife, isEditing, localIsEditing]);

  const canAddWildlife = activeWildlife.length < WILDLIFE_LIMIT;

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed || !canAddWildlife) return;
    if (isEditing) {
      onWildlifeChange([...wildlife, trimmed]);
    } else {
      setLocalWildlife([...localWildlife, trimmed]);
    }
    setNewItem('');
  };

  const handleRemove = (index: number) => {
    if (isEditing) {
      onWildlifeChange(wildlife.filter((_, i) => i !== index));
    } else {
      setLocalWildlife(localWildlife.filter((_, i) => i !== index));
    }
  };

  const hasChanges = JSON.stringify(localWildlife) !== JSON.stringify(baseWildlife);

  const handleEdit = () => {
    setLocalWildlife(baseWildlife);
    setLocalIsEditing(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }
    setLocalWildlife(baseWildlife);
    setNewItem('');
    setLocalIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateDive({
        id: dive.id,
        diveData: { wildlife: localWildlife },
      });
      setLocalIsEditing(false);
      setNewItem('');
    } catch (error) {
      console.error('Failed to save wildlife:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <section className="flex-col">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Fish className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Wildlife Observed</h3>
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

      <Card className="bg-card-dark border-border-dark rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {displayWildlife.length === 0 ? (
              <p className="text-muted-foreground">N/A</p>
            ) : (
              displayWildlife.map((animal: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium"
                >
                  {animal}
                  {isEditingActive && (
                    <button
                      onClick={() => handleRemove(idx)}
                      className="ml-1 hover:opacity-70 transition-opacity"
                      disabled={isSavingActive}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {isEditingActive && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {activeWildlife.length}/{WILDLIFE_LIMIT}
                </span>
                <span>Max {WILDLIFE_ITEM_LIMIT} characters per item.</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add wildlife..."
                  className="flex-1"
                  disabled={isSavingActive || !canAddWildlife}
                  maxLength={WILDLIFE_ITEM_LIMIT}
                />
                <Button
                  onClick={handleAdd}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSavingActive || !newItem.trim() || !canAddWildlife}
                >
                  Add
                </Button>
              </div>
              {!canAddWildlife && (
                <p className="text-xs text-muted-foreground">
                  Limit {WILDLIFE_LIMIT} items. Remove one to add more.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default DiveWildlife;
