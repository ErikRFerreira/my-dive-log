import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import type { Dive } from '../types';

type TextField = keyof Pick<Dive, 'summary' | 'notes'>;

interface DiveNotesProps {
  dive: Dive;
  isEditMode: boolean;
  onTextChange: (
    field: TextField
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function DiveNotes({ dive, isEditMode, onTextChange }: DiveNotesProps) {
  return (
    <section className="flex-col">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Notes</h3>
        </div>
        <button type="button" className="text-primary hover:text-primary/80 font-medium">
          Edit
        </button>
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl">
        <CardContent className="p-6">
          {isEditMode ? (
            <Textarea
              value={dive.notes ?? ''}
              onChange={onTextChange('notes')}
              className="min-h-32"
              placeholder="N/A"
            />
          ) : (
            <p className="text-foreground leading-relaxed">{dive.notes ?? 'N/A'}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default DiveNotes;
