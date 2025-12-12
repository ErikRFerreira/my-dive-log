import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import type { Dive } from '../types';

interface DiveEquipmentProps {
  dive: Dive;
  isEditMode: boolean;
  newEquipment: string;
  onNewEquipmentChange: (value: string) => void;
  onAddEquipment: () => void;
  onRemoveEquipment: (index: number) => void;
}

function DiveEquipment({
  dive,
  isEditMode,
  newEquipment,
  onNewEquipmentChange,
  onAddEquipment,
  onRemoveEquipment,
}: DiveEquipmentProps) {
  const equipment = Array.isArray(dive.equipment) ? dive.equipment : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onAddEquipment();
    }
  };

  return (
    <Card className="bg-card border-slate-200 dark:border-slate-700">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-foreground">Equipment Used</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {equipment.length === 0 && !isEditMode ? (
            <p className="text-muted-foreground">N/A</p>
          ) : (
            equipment.map((item: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 rounded-full text-sm font-medium"
              >
                {item}
                {isEditMode && (
                  <button
                    onClick={() => onRemoveEquipment(idx)}
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
              value={newEquipment}
              onChange={(e) => onNewEquipmentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add equipment..."
              className="flex-1"
            />
            <Button
              onClick={onAddEquipment}
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Add
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DiveEquipment;
