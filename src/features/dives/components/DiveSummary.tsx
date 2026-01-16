import InlineSpinner from '@/components/common/InlineSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ScrollText } from 'lucide-react';
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
    <section className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Dive Summary</h3>
        </div>
        <button type="button" className="text-primary hover:text-primary/80 font-medium">
          Edit
        </button>
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl flex-1 flex flex-col">
        <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
          <div className="flex-1 flex flex-col relative">
            {isEditMode && (
              <Button
                onClick={onGenerateSummary}
                disabled={isGenerating}
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
            {isEditMode ? (
              <Textarea
                value={dive.summary ?? ''}
                onChange={onTextChange('summary')}
                className="min-h-full h-full resize-none pt-14"
                placeholder="N/A"
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
