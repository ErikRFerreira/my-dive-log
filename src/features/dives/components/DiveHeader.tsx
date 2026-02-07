import { Button } from '@/components/ui/button';
import GoBack from '@/components/ui/GoBack';
import { Calendar, Check, Pencil, Trash2, X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import type { Dive } from '../types';
import { format, parse } from 'date-fns';

const formatDisplayDate = (dateStr: string): string => {
  try {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    const formatted = format(date, 'dd MMMM yyyy');
    return formatted.replace(
      /([A-Z][a-z]+)/,
      (month) => month.toUpperCase()[0] + month.slice(1).toLowerCase()
    );
  } catch {
    return dateStr;
  }
};

interface DiveHeaderProps {
  dive: Dive;
  onOpenDeleteModal: () => void;
  isEditing: boolean;
  onEdit: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  isPending?: boolean;
}

type DiveHeaderEditingActionsProps = {
  onSave: () => void;
  onCancel: () => void;
  isPending?: boolean;
};

function DiveHeaderEditingActions({ onSave, onCancel, isPending }: DiveHeaderEditingActionsProps) {
  const {
    formState: { isDirty },
  } = useFormContext();

  return (
    <>
      <Button
        onClick={onSave}
        disabled={isPending || !isDirty}
        size="sm"
        className="gap-2 h-9 bg-primary hover:bg-primary/90"
      >
        <Check className="w-4 h-4" />
        {isPending ? 'Saving...' : 'Save'}
      </Button>
      <Button
        onClick={onCancel}
        disabled={isPending}
        size="sm"
        variant="outline"
        className="gap-2 h-9"
        type="button"
      >
        <X className="w-4 h-4" />
        Cancel
      </Button>
    </>
  );
}

function DiveHeader({
  dive,
  onOpenDeleteModal,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isPending,
}: DiveHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <GoBack />
        <div className="flex items-center gap-2">
          {isEditing && onSave && onCancel ? (
            <DiveHeaderEditingActions onSave={onSave} onCancel={onCancel} isPending={isPending} />
          ) : (
            <Button
              onClick={onEdit}
              variant="outline"
              className="gap-2 bg-[#0f1419]/20 backdrop-blur-[5px] border-[#1e2936]/80"
            >
              <Pencil className="w-4 h-4" />
              Edit Dive
            </Button>
          )}
          {!isEditing && (
            <Button
              onClick={onOpenDeleteModal}
              variant="outline"
              className="gap-2 bg-[#0f1419]/20 backdrop-blur-[20px] border-[#1e2936]/80 text-red-500 hover:bg-red-50/20 dark:hover:bg-red-900/20 hover:text-red-600 disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              Delete Dive
            </Button>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {dive.locations?.name ?? 'N/A'}
          {dive.locations?.country ? `, ${dive.locations.country}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1 flex items-center">
          <Calendar className="w-4 h-4 inline mr-2 text-foreground" aria-hidden="true" />
          {dive.date ? formatDisplayDate(dive.date) : 'N/A'}
        </p>
      </div>
    </>
  );
}

export default DiveHeader;
