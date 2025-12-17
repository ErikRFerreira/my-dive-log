import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import GoBack from '@/components/ui/GoBack';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check, Edit2, Trash2, X } from 'lucide-react';

import type { Dive } from '../types';
import { format, parse } from 'date-fns';

type TextField = keyof Pick<Dive, 'location' | 'summary' | 'notes'>;

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
  onTextChange: (
    field: TextField
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
  onTextChange,
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
              value={dive.location ?? ''}
              onChange={onTextChange('location')}
              className="text-2xl font-bold"
              placeholder="Location"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dive.date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dive.date ? formatDisplayDate(dive.date) : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dive.date ? parse(dive.date, 'yyyy-MM-dd', new Date()) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      onDateChange(format(date, 'yyyy-MM-dd'));
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-foreground">{dive.location ?? 'N/A'}</h1>
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
