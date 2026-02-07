import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Fish } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { TAG_ITEM_LIMIT, TAG_LIST_LIMIT } from '@/shared/constants';
import type { Dive } from '../types';

interface DiveWildlifeProps {
  dive: Dive;
  isEditing: boolean;
}

function EditableDiveWildlife() {
  const [newItem, setNewItem] = useState('');
  const {
    control,
    formState: { isSubmitting = false, errors = {} },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'wildlife',
  });
  const wildlife = useWatch({ control, name: 'wildlife' }) ?? [];
  const canAddWildlife = fields.length < TAG_LIST_LIMIT;

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed || !canAddWildlife) return;
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
          fields.map((animal, idx) => (
            <div
              key={animal.id}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium"
            >
              {wildlife[idx]}
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
      <div className="space-y-2 pt-2 border-border border-t">
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
            placeholder="Add wildlife..."
            className="flex-1"
            disabled={isSubmitting || !canAddWildlife}
            maxLength={TAG_ITEM_LIMIT}
          />
          <Button
            onClick={handleAdd}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting || !newItem.trim() || !canAddWildlife}
          >
            Add
          </Button>
        </div>
        {!canAddWildlife && (
          <p className="text-xs text-muted-foreground">
            Limit {TAG_LIST_LIMIT} items. Remove one to add more.
          </p>
        )}
        {errors.wildlife && (
          <p className="text-xs text-destructive" role="alert">
            {errors.wildlife.message as string}
          </p>
        )}
      </div>
    </>
  );
}

function DiveWildlife({ dive, isEditing }: DiveWildlifeProps) {
  const baseWildlife = useMemo(
    () => (Array.isArray(dive.wildlife) ? dive.wildlife : []),
    [dive.wildlife]
  );

  return (
    <section className="flex-col">
      <div className="flex items-center gap-2 mb-3 px-2">
        <Fish className="w-5 h-5 text-primary" />
        <h3 className="text-foreground text-lg font-semibold">Wildlife Observed</h3>
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl">
        <CardContent className="p-6 space-y-4">
          {isEditing ? (
            <EditableDiveWildlife />
          ) : (
            <div className="flex flex-wrap gap-2">
              {baseWildlife.length === 0 ? (
                <p className="text-muted-foreground">N/A</p>
              ) : (
                baseWildlife.map((animal, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium"
                  >
                    {animal}
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

export default DiveWildlife;
