import InlineSpinner from '@/components/common/InlineSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ScrollText } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Dive } from '../types';
import { useMutation } from '@tanstack/react-query';
import { getDiveSummaryFromAPI } from '@/services/apiAI';
import toast from 'react-hot-toast';
import { useUpdateDive } from '../hooks/useUpdateDive';

interface DiveSummaryProps {
  dive: Dive;
  isEditing: boolean;
  isSaving: boolean;
  summary: string;
  onSummaryChange: (value: string) => void;
}

function DiveSummary({
  dive,
  isEditing,
  isSaving,
  summary,
  onSummaryChange,
}: DiveSummaryProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [localSummary, setLocalSummary] = useState(dive.summary ?? '');
  const { mutateAsync: updateDive, isPending: isLocalSaving } = useUpdateDive();
  const isEditingActive = isEditing || localIsEditing;
  const isSavingActive = isEditing ? isSaving : isLocalSaving;
  const activeSummary = isEditing ? summary : localSummary;

  useEffect(() => {
    if (isEditing) {
      setLocalIsEditing(false);
      setLocalSummary(dive.summary ?? '');
    } else if (!localIsEditing) {
      setLocalSummary(dive.summary ?? '');
    }
  }, [dive.summary, isEditing, localIsEditing]);

  const { mutateAsync: generateSummary, isPending: isGenerating } = useMutation<string, Error>({
    mutationFn: () => getDiveSummaryFromAPI(dive),
    onSuccess: (summary) => {
      if (isEditing) {
        onSummaryChange(summary);
      } else {
        setLocalSummary(summary);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const hasChanges = localSummary !== (dive.summary ?? '');

  const handleEdit = () => {
    setLocalSummary(dive.summary ?? '');
    setLocalIsEditing(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }
    setLocalSummary(dive.summary ?? '');
    setLocalIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateDive({
        id: dive.id,
        diveData: { summary: localSummary || null },
      });
      setLocalIsEditing(false);
    } catch (error) {
      console.error('Failed to save summary:', error);
    }
  };

  const handleGenerate = async () => {
    try {
      await generateSummary();
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
  };

  return (
    <section className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Dive Summary</h3>
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
              {isSavingActive ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isSavingActive}
              size="sm"
              variant="outline"
              className="gap-1 h-8"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl flex-1 flex flex-col">
        <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col relative">
            {isEditingActive && (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || isSavingActive}
                size="sm"
                className="absolute top-2 right-2 z-10 gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? (
                  <>
                    Generating... <InlineSpinner />
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
            )}
            {isEditingActive ? (
              <Textarea
                value={activeSummary}
                onChange={(e) =>
                  isEditing ? onSummaryChange(e.target.value) : setLocalSummary(e.target.value)
                }
                className="min-h-full h-full resize-none pt-14"
                placeholder="Add summary..."
                disabled={isSavingActive}
              />
            ) : (
              <p className="text-foreground whitespace-pre-line">{dive.summary ?? 'N/A'}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default DiveSummary;
