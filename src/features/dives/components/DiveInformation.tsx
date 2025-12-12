import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Dive } from '../types';

type NumericField = keyof Pick<
  Dive,
  'depth' | 'duration' | 'water_temp' | 'start_pressure' | 'end_pressure' | 'air_usage' | 'weight'
>;

type SelectField = keyof Pick<
  Dive,
  'visibility' | 'dive_type' | 'water_type' | 'exposure' | 'gas' | 'currents'
>;

interface DiveInformationProps {
  dive: Dive;
  isEditMode: boolean;
  onNumberChange: (field: NumericField) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: SelectField, value: string) => void;
}

function DiveInformation({
  dive,
  isEditMode,
  onNumberChange,
  onSelectChange,
}: DiveInformationProps) {
  return (
    <Card className="bg-card border-slate-200 dark:border-slate-700">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-foreground">Dive Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-6 gap-6">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Dive Type</p>
            {isEditMode ? (
              <Select
                value={dive.dive_type ?? ''}
                onValueChange={(value) => onSelectChange('dive_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reef">Reef</SelectItem>
                  <SelectItem value="wreck">Wreck</SelectItem>
                  <SelectItem value="wall">Wall</SelectItem>
                  <SelectItem value="cave">Cave</SelectItem>
                  <SelectItem value="drift">Drift</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground capitalize">{dive.dive_type ?? 'N/A'}</p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Water Type</p>
            {isEditMode ? (
              <Select
                value={dive.water_type ?? ''}
                onValueChange={(value) => onSelectChange('water_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select water type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salt">Salt Water</SelectItem>
                  <SelectItem value="fresh">Fresh Water</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground capitalize">
                {dive.water_type === 'salt'
                  ? 'Salt Water'
                  : dive.water_type === 'fresh'
                    ? 'Fresh Water'
                    : 'N/A'}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Exposure Protection</p>
            {isEditMode ? (
              <Select
                value={dive.exposure ?? ''}
                onValueChange={(value) => onSelectChange('exposure', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exposure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wet-2mm">Wetsuit (2mm)</SelectItem>
                  <SelectItem value="wet-3mm">Wetsuit (3mm)</SelectItem>
                  <SelectItem value="wet-5mm">Wetsuit (5mm)</SelectItem>
                  <SelectItem value="wet-7mm">Wetsuit (7mm)</SelectItem>
                  <SelectItem value="semi-dry">Semy-dry suit</SelectItem>
                  <SelectItem value="dry">Dry suit</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground capitalize">
                {dive.exposure === 'wet-2mm'
                  ? 'Wetsuit (2mm)'
                  : dive.exposure === 'wet-3mm'
                    ? 'Wetsuit (3mm)'
                    : dive.exposure === 'wet-5mm'
                      ? 'Wetsuit (5mm)'
                      : dive.exposure === 'wet-7mm'
                        ? 'Wetsuit (7mm)'
                        : dive.exposure === 'semi-dry'
                          ? 'Semi-dry suit'
                          : dive.exposure === 'dry'
                            ? 'Dry suit'
                            : 'N/A'}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Gas Mix</p>
            {isEditMode ? (
              <Select
                value={dive.gas ?? ''}
                onValueChange={(value) => onSelectChange('gas', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="air">Air</SelectItem>
                  <SelectItem value="nitrox">Nitrox</SelectItem>
                  <SelectItem value="trimix">Trimix</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground capitalize">{dive.gas ?? 'N/A'}</p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Currents</p>
            {isEditMode ? (
              <Select
                value={dive.currents ?? ''}
                onValueChange={(value) => onSelectChange('currents', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground capitalize">{dive.currents ?? 'N/A'}</p>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Weight (kg)</p>
            {isEditMode ? (
              <Input
                type="number"
                value={dive.weight ?? ''}
                onChange={onNumberChange('weight')}
                placeholder="0"
              />
            ) : (
              <p className="text-foreground">{dive.weight ? `${dive.weight} kg` : 'N/A'}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DiveInformation;
