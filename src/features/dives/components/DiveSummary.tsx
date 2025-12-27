import InlineSpinner from '@/components/common/InlineSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import type { Dive } from '../types';

type TextField = keyof Pick<Dive, 'summary' | 'notes'>;

interface DiveSummaryProps {
  dive: Dive;
  isEditMode: boolean;
  isGenerating: boolean;
  onTextChange: (
    field: TextField
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onGenerateSummary: () => void;
}

function DiveSummary({
  dive,
  isEditMode,
  isGenerating,
  onTextChange,
  onGenerateSummary,
}: DiveSummaryProps) {
  return (
    <Card className="bg-card border-slate-200 dark:border-slate-700">
      <CardHeader className="border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Dive Summary</CardTitle>
        {isEditMode && (
          <Button
            onClick={onGenerateSummary}
            disabled={isGenerating}
            size="sm"
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? (
              <>
                Generating... <InlineSpinner />
              </>
            ) : (
              'Generate AI Summary'
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          {isEditMode ? (
            <Textarea
              value={dive.summary ?? ''}
              onChange={onTextChange('summary')}
              className="min-h-20"
              placeholder="N/A"
            />
          ) : (
            <p className="text-foreground whitespace-pre-line">{dive.summary ?? 'N/A'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DiveSummary;
