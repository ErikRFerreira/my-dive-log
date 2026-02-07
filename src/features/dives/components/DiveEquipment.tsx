import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Package } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { TAG_ITEM_LIMIT, TAG_LIST_LIMIT } from '@/shared/constants';
import type { Dive } from '../types';

interface DiveEquipmentProps {
  dive: Dive;
  isEditing: boolean;
}

function EditableDiveEquipment() {
  const [newItem, setNewItem] = useState('');
  const {
    control,
    formState: { isSubmitting = false, errors = {} },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'equipment',
  });
  const equipment = useWatch({ control, name: 'equipment' }) ?? [];
  const canAddEquipment = fields.length < TAG_LIST_LIMIT;

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed || !canAddEquipment) return;
    append(trimmed);
    setNewItem('');
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {fields.length === 0 ? (
          <p className="text-muted-foreground">N/A</p>
        ) : (
          fields.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 rounded-full text-sm font-medium"
            >
              {equipment[idx]}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="ml-1 hover:opacity-70 transition-opacity"
                disabled={isSubmitting}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {fields.length}/{TAG_LIST_LIMIT}
          </span>
          <span>Max {TAG_ITEM_LIMIT} characters per item.</span>
        </div>
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add equipment..."
            className="flex-1"
            disabled={isSubmitting || !canAddEquipment}
            maxLength={TAG_ITEM_LIMIT}
          />
          <Button
            onClick={handleAdd}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isSubmitting || !newItem.trim() || !canAddEquipment}
          >
            Add
          </Button>
        </div>
        {!canAddEquipment && (
          <p className="text-xs text-muted-foreground">
            Limit {TAG_LIST_LIMIT} items. Remove one to add more.
          </p>
        )}
        {errors.equipment && (
          <p className="text-xs text-destructive" role="alert">
            {errors.equipment.message as string}
          </p>
        )}
      </div>
    </>
  );
}

function DiveEquipment({ dive, isEditing }: DiveEquipmentProps) {
  const baseEquipment = useMemo(
    () => (Array.isArray(dive.equipment) ? dive.equipment : []),
    [dive.equipment]
  );

  return (
    <section className="flex-col">
      <div className="flex items-center gap-2 mb-3 px-2">
        <Package className="w-5 h-5 text-primary" />
        <h3 className="text-foreground text-lg font-semibold">Equipment Used</h3>
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl">
        <CardContent className="p-6 space-y-4">
          {isEditing ? (
            <EditableDiveEquipment />
          ) : (
            <div className="flex flex-wrap gap-2">
              {baseEquipment.length === 0 ? (
                <p className="text-muted-foreground">N/A</p>
              ) : (
                baseEquipment.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 rounded-full text-sm font-medium"
                  >
                    {item}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default DiveEquipment;
