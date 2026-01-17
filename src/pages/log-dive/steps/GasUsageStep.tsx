import { useEffect } from 'react';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import type { LogDiveFormData, LogDiveFormInput } from '../schema/schema';
import type { UnitSystem } from '@/shared/constants';
import type { Gas } from '@/features/dives/types';
import GasMixFields from '@/components/common/GasMixFields';
import { clampPressure, coercePressureValue, parsePressureInput } from '@/shared/utils/pressure';
type Props = {
  control: Control<LogDiveFormInput, unknown, LogDiveFormData>;
};

export default function GasUsageStep({ control }: Props) {
  const { field: gasMixField } = useController({ name: 'gasMix', control });
  const { field: nitroxPercentField } = useController({ name: 'nitroxPercent', control });
  const { field: startingPressureField, fieldState: startingPressureState } = useController({
    name: 'startingPressure',
    control,
  });
  const { field: endingPressureField, fieldState: endingPressureState } = useController({
    name: 'endingPressure',
    control,
  });
  const { field: unitSystemField } = useController({ name: 'unitSystem', control });
  const pressureUnit: UnitSystem = unitSystemField.value === 'imperial' ? 'imperial' : 'metric';
  const pressureMax = pressureUnit === 'metric' ? 240 : 3500;
  const pressureStep = pressureUnit === 'metric' ? 10 : 100;
  const startingPressureValue = coercePressureValue(
    startingPressureField.value,
    pressureMax,
    pressureStep
  );
  const endingPressureValue = coercePressureValue(
    endingPressureField.value,
    pressureMax,
    pressureStep
  );

  useEffect(() => {
    const startParsed = parsePressureInput(startingPressureField.value);
    if (startParsed !== null) {
      startingPressureField.onChange(String(clampPressure(startParsed, pressureMax, pressureStep)));
    }

    const endParsed = parsePressureInput(endingPressureField.value);
    if (endParsed !== null) {
      endingPressureField.onChange(String(clampPressure(endParsed, pressureMax, pressureStep)));
    }
  }, [pressureMax, pressureStep, startingPressureField, endingPressureField]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Gas Usage</h2>

      <GasMixFields
        gasMix={gasMixField.value as Gas}
        onGasMixChange={(value) => gasMixField.onChange(value)}
        nitroxPercent={Number(nitroxPercentField.value)}
        onNitroxPercentChange={(value) => nitroxPercentField.onChange(value)}
        depthUnit={unitSystemField.value === 'imperial' ? 'imperial' : 'metric'}
        startPressure={startingPressureValue}
        endPressure={endingPressureValue}
        onStartPressureChange={(value) => startingPressureField.onChange(String(value))}
        onEndPressureChange={(value) => endingPressureField.onChange(String(value))}
        pressureMax={pressureMax}
        pressureStep={pressureStep}
        pressureUnit={pressureUnit === 'metric' ? 'bar' : 'psi'}
      />

      {/* Error messages */}
      {startingPressureState.error?.message && (
        <p className="text-sm text-destructive">{startingPressureState.error.message}</p>
      )}
      {endingPressureState.error?.message && (
        <p className="text-sm text-destructive">{endingPressureState.error.message}</p>
      )}
    </div>
  );
}
