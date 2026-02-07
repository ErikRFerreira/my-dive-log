import { Card, CardContent } from '@/components/ui/card';
import { Wind } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { Dive } from '../types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit } from '@/shared/utils/units';
import GasMixFields from '@/components/common/GasMixFields';
import { coercePressureValue } from '@/shared/utils/pressure';

interface GasUsageProps {
  dive: Dive;
  isEditing: boolean;
}

type EditableGasUsageProps = {
  unitSystem: 'metric' | 'imperial';
};

function EditableGasUsage({ unitSystem }: EditableGasUsageProps) {
  const {
    watch,
    setValue,
    formState: { isSubmitting = false },
  } = useFormContext();

  // Watch pressure fields for real-time air usage calculation
  const gasMix = watch('gas') ?? 'air';
  const nitroxPercent = watch('nitrox_percent') ?? 32;
  const startPressure = watch('start_pressure');
  const endPressure = watch('end_pressure');

  // Calculate air usage in real-time
  const airUsage =
    startPressure !== null && endPressure !== null ? startPressure - endPressure : null;

  const pressureMax = unitSystem === 'metric' ? 240 : 3500;
  const pressureStep = unitSystem === 'metric' ? 10 : 100;
  const pressureUnit = unitSystem === 'metric' ? 'bar' : 'psi';

  const startPressureValue = coercePressureValue(startPressure, pressureMax, pressureStep);
  const endPressureValue = coercePressureValue(endPressure, pressureMax, pressureStep);

  return (
    <>
      <GasMixFields
        gasMix={gasMix}
        onGasMixChange={(value) => setValue('gas', value, { shouldDirty: true })}
        nitroxPercent={nitroxPercent}
        onNitroxPercentChange={(value) => setValue('nitrox_percent', value, { shouldDirty: true })}
        depthUnit={unitSystem === 'imperial' ? 'imperial' : 'metric'}
        startPressure={startPressureValue}
        endPressure={endPressureValue}
        onStartPressureChange={(value) => setValue('start_pressure', value, { shouldDirty: true })}
        onEndPressureChange={(value) => setValue('end_pressure', value, { shouldDirty: true })}
        pressureMax={pressureMax}
        pressureStep={pressureStep}
        pressureUnit={pressureUnit}
        disabled={isSubmitting}
      />
      <div className="flex justify-between items-center pt-2 border-t border-border">
        <p className="text-sm text-muted-foreground">Total Used</p>
        <p className="font-semibold text-foreground">
          {airUsage !== null ? formatValueWithUnit(airUsage, 'pressure', unitSystem) : 'N/A'}
        </p>
      </div>
    </>
  );
}

type ReadOnlyGasUsageProps = {
  dive: Dive;
  unitSystem: 'metric' | 'imperial';
};

function ReadOnlyGasUsage({ dive, unitSystem }: ReadOnlyGasUsageProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Gas Mix</p>
        <p className="font-semibold text-foreground">
          {dive.gas === 'nitrox'
            ? `Nitrox ${dive.nitrox_percent ?? 21}%`
            : dive.gas === 'air'
              ? 'Air'
              : 'N/A'}
        </p>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Start Pressure</p>
        <p className="font-semibold text-foreground">
          {dive.start_pressure !== null && dive.start_pressure !== undefined
            ? formatValueWithUnit(dive.start_pressure, 'pressure', unitSystem)
            : 'N/A'}
        </p>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">End Pressure</p>
        <p className="font-semibold text-foreground">
          {dive.end_pressure !== null && dive.end_pressure !== undefined
            ? formatValueWithUnit(dive.end_pressure, 'pressure', unitSystem)
            : 'N/A'}
        </p>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-border">
        <p className="text-sm text-muted-foreground">Total Used</p>
        <p className="font-semibold text-foreground">
          {dive.air_usage !== null && dive.air_usage !== undefined
            ? formatValueWithUnit(dive.air_usage, 'pressure', unitSystem)
            : 'N/A'}
        </p>
      </div>
    </>
  );
}

function GasUsage({ dive, isEditing }: GasUsageProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  return (
    <section className="flex-col">
      <div className="flex items-center gap-2 mb-3 px-2">
        <Wind className="w-5 h-5 text-primary" />
        <h3 className="text-foreground text-lg font-semibold">Gas Usage</h3>
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl">
        <CardContent className="p-6 space-y-6">
          {isEditing ? (
            <EditableGasUsage unitSystem={unitSystem} />
          ) : (
            <ReadOnlyGasUsage dive={dive} unitSystem={unitSystem} />
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default GasUsage;
