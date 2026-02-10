import type { UnitSystem } from '@/shared/constants';
import { useSettingsStore } from '@/store/settingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ruler } from 'lucide-react';

function Units() {
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem);

  return (
    <Card>
      <CardHeader className="max-[991px]:p-4">
        <CardTitle className="flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Units
        </CardTitle>
        <CardDescription>Choose your preferred unit system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-[991px]:p-4">
        <div className="space-y-2">
          <Label htmlFor="unitSystem">Measurement System</Label>
          <Select value={unitSystem} onValueChange={(value) => setUnitSystem(value as UnitSystem)}>
            <SelectTrigger id="unitSystem" className="bg-slate-900/50 border-slate-700">
              <SelectValue placeholder="Select unit system" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric</SelectItem>
              <SelectItem value="imperial">Imperial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-slate-900/30 p-4 rounded-lg text-sm text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">Metric:</span> meters (m), Celsius (°C),
            bar, kilograms (kg)
          </p>
          <p>
            <span className="font-semibold text-foreground">Imperial:</span> feet (ft), Fahrenheit
            (°F), PSI, pounds (lbs)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default Units;
