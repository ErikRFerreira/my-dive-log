import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Fish } from 'lucide-react';
import type { Dive } from '../types';

interface DiveWildlifeProps {
  dive: Dive;
  isEditMode: boolean;
  newWildlife: string;
  onNewWildlifeChange: (value: string) => void;
  onAddWildlife: () => void;
  onRemoveWildlife: (index: number) => void;
}

function DiveWildlife({
  dive,
  isEditMode,
  newWildlife,
  onNewWildlifeChange,
  onAddWildlife,
  onRemoveWildlife,
}: DiveWildlifeProps) {
  const wildlife = Array.isArray(dive.wildlife) ? dive.wildlife : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onAddWildlife();
    }
  };

  return (
    <section className="flex-col">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Fish className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Wildlife Observed</h3>
        </div>
        <button type="button" className="text-primary hover:text-primary/80 font-medium">
          Edit
        </button>
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {wildlife.length === 0 && !isEditMode ? (
              <p className="text-muted-foreground">N/A</p>
            ) : (
              wildlife.map((animal: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium"
                >
                  {animal}
                  {isEditMode && (
                    <button
                      onClick={() => onRemoveWildlife(idx)}
                      className="ml-1 hover:opacity-70 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {isEditMode && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Input
                value={newWildlife}
                onChange={(e) => onNewWildlifeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add wildlife..."
                className="flex-1"
              />
              <Button
                onClick={onAddWildlife}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default DiveWildlife;
