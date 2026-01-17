import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Package, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Dive } from '../types';
import { useUpdateDive } from '../hooks/useUpdateDive';

interface DiveEquipmentProps {
  dive: Dive;
  isEditing: boolean;
  isSaving: boolean;
  equipment: string[];
  onEquipmentChange: (next: string[]) => void;
}

function DiveEquipment({
  dive,
  isEditing,
  isSaving,
  equipment,
  onEquipmentChange,
}: DiveEquipmentProps) {
  const EQUIPMENT_LIMIT = 20;
  const EQUIPMENT_ITEM_LIMIT = 40;
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [localEquipment, setLocalEquipment] = useState<string[]>(
    Array.isArray(dive.equipment) ? dive.equipment : []
  );
  const [newItem, setNewItem] = useState('');
  const { mutateAsync: updateDive, isPending: isLocalSaving } = useUpdateDive();
  const baseEquipment = useMemo(
    () => (Array.isArray(dive.equipment) ? dive.equipment : []),
    [dive.equipment]
  );
  const isEditingActive = isEditing || localIsEditing;
  const activeEquipment = isEditing ? equipment : localEquipment;
  const displayEquipment = isEditingActive ? activeEquipment : baseEquipment;
  const isSavingActive = isEditing ? isSaving : isLocalSaving;

  useEffect(() => {
    if (isEditing) {
      setLocalIsEditing(false);
      setLocalEquipment(baseEquipment);
      setNewItem('');
    } else if (!localIsEditing) {
      setLocalEquipment(baseEquipment);
    }
  }, [baseEquipment, isEditing, localIsEditing]);

  const canAddEquipment = activeEquipment.length < EQUIPMENT_LIMIT;

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed || !canAddEquipment) return;
    if (isEditing) {
      onEquipmentChange([...equipment, trimmed]);
    } else {
      setLocalEquipment([...localEquipment, trimmed]);
    }
    setNewItem('');
  };

  const handleRemove = (index: number) => {
    if (isEditing) {
      onEquipmentChange(equipment.filter((_, i) => i !== index));
    } else {
      setLocalEquipment(localEquipment.filter((_, i) => i !== index));
    }
  };

  const hasChanges = JSON.stringify(localEquipment) !== JSON.stringify(baseEquipment);

  const handleEdit = () => {
    setLocalEquipment(baseEquipment);
    setLocalIsEditing(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }
    setLocalEquipment(baseEquipment);
    setNewItem('');
    setLocalIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateDive({
        id: dive.id,
        diveData: { equipment: localEquipment },
      });
      setLocalIsEditing(false);
      setNewItem('');
    } catch (error) {
      console.error('Failed to save equipment:', error);
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
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Equipment Used</h3>
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
            {displayEquipment.length === 0 ? (
              <p className="text-muted-foreground">N/A</p>
            ) : (
              displayEquipment.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 rounded-full text-sm font-medium"
                >
                  {item}
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
                  {activeEquipment.length}/{EQUIPMENT_LIMIT}
                </span>
                <span>Max {EQUIPMENT_ITEM_LIMIT} characters per item.</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add equipment..."
                  className="flex-1"
                  disabled={isSavingActive || !canAddEquipment}
                  maxLength={EQUIPMENT_ITEM_LIMIT}
                />
                <Button
                  onClick={handleAdd}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={isSavingActive || !newItem.trim() || !canAddEquipment}
                >
                  Add
                </Button>
              </div>
              {!canAddEquipment && (
                <p className="text-xs text-muted-foreground">
                  Limit {EQUIPMENT_LIMIT} items. Remove one to add more.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default DiveEquipment;
