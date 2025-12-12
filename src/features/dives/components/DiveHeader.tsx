import GoBack from '@/components/ui/GoBack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Edit2, Trash2, X } from 'lucide-react';
import type { Dive } from '../types';

type TextField = keyof Pick<Dive, 'location' | 'date' | 'summary' | 'notes'>;

interface DiveHeaderProps {
  dive: Dive;
  isEditMode: boolean;
  isUpdating: boolean;
  onTextChange: (
    field: TextField
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onOpenDeleteModal: () => void;
}

function DiveHeader({
  dive,
  isEditMode,
  isUpdating,
  onTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onOpenDeleteModal,
}: DiveHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <GoBack />
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button
                onClick={onSaveEdit}
                disabled={isUpdating}
                className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Check className="w-4 h-4" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={onCancelEdit} variant="outline" className="gap-2 bg-transparent">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onStartEdit} variant="outline" className="gap-2 bg-transparent">
                <Edit2 className="w-4 h-4" />
                Edit Dive
              </Button>
              <Button
                onClick={onOpenDeleteModal}
                variant="outline"
                className="gap-2 bg-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete Dive
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        {isEditMode ? (
          <div className="space-y-3">
            <Input
              value={dive.location ?? ''}
              onChange={onTextChange('location')}
              className="text-2xl font-bold"
              placeholder="Location"
            />
            <Input
              value={dive.date ?? ''}
              onChange={onTextChange('date')}
              className="text-muted-foreground"
              placeholder="Date"
            />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-foreground">{dive.location ?? 'N/A'}</h1>
            <p className="text-muted-foreground mt-1">{dive.date ?? 'N/A'}</p>
          </>
        )}
      </div>
    </>
  );
}

export default DiveHeader;
