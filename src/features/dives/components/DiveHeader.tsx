import { Button } from '@/components/ui/button';
import GoBack from '@/components/ui/GoBack';
import { Input } from '@/components/ui/input';
import { Check, Edit2, Trash2, X } from 'lucide-react';

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
  isEditMode: boolean;
  isUpdating: boolean;
  locationName: string;
  onLocationNameChange: (name: string) => void;
  onDateChange: (date: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onOpenDeleteModal: () => void;
}

function DiveHeader({
  dive,
  isEditMode,
  isUpdating,
  locationName,
  onLocationNameChange,
  onDateChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onOpenDeleteModal,
}: DiveHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <GoBack disabled={isEditMode} />
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
              value={locationName}
              onChange={(e) => onLocationNameChange(e.target.value)}
              className="text-2xl font-bold"
              placeholder="Location"
            />
            <Input
              id="date"
              type="date"
              value={dive.date ?? ''}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-foreground">
              {dive.locations?.name ?? 'N/A'}
              {dive.locations?.country ? `, ${dive.locations.country}` : ''}
            </h1>
            <p className="text-muted-foreground mt-1">
              {dive.date ? formatDisplayDate(dive.date) : 'N/A'}
            </p>
          </>
        )}
      </div>
    </>
  );
}

export default DiveHeader;
