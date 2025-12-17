import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { Dive } from '../types';

type TextField = keyof Pick<Dive, 'location' | 'summary' | 'notes'>;

interface DiveNotesProps {
  dive: Dive;
  isEditMode: boolean;
  onTextChange: (
    field: TextField
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function DiveNotes({ dive, isEditMode, onTextChange }: DiveNotesProps) {
  return (
    <Card className="bg-card border-slate-200 dark:border-slate-700">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-foreground">Notes</CardTitle>
      </CardHeader>
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
  );
}

export default DiveNotes;
