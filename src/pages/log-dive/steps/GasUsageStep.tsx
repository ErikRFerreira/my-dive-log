import { useEffect } from 'react';
import { useController } from 'react-hook-form';
import { Gauge as GaugeIcon, Sparkles, Wind } from 'lucide-react';

import { GAS_OPTIONS } from '../utils/options';

import type { Control } from 'react-hook-form';

import type { LogDiveFormData, LogDiveFormInput } from '../schema/schema';
import type { UnitSystem } from '@/shared/constants';
import NitroxMod from '@/components/common/NitroxMod';
import {
  clampPressure,
  coercePressureValue,
  nitroxTrack,
  parsePressureInput,
  sliderTrack,
} from '@/shared/utils/pressure';
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

      <div>
        <label id="gas-mix-label" className="text-sm font-medium text-foreground mb-3 block">
          <Wind className="w-4 h-4 inline mr-2 text-teal-500" aria-hidden="true" />
          Gas Mix
        </label>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-labelledby="gas-mix-label">
          {GAS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => gasMixField.onChange(option.value)}
              role="radio"
              aria-checked={gasMixField.value === option.value}
              className={`p-4 rounded-lg border-2 transition-all hover:border-teal-400 ${
                gasMixField.value === option.value
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-base font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {gasMixField.value === 'nitrox' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="nitrox-percent-range" className="text-sm font-medium text-foreground">
              <Sparkles className="w-4 h-4 inline mr-2 text-yellow-500" aria-hidden="true" />
              Oxygen (O2)
            </label>
            <span className="text-2xl font-bold text-teal-500">{nitroxPercentField.value}%</span>
          </div>
          <div className="space-y-2">
            <input
              id="nitrox-percent-range"
              type="range"
              min={21}
              max={100}
              step={1}
              value={nitroxPercentField.value}
              onChange={(e) => nitroxPercentField.onChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none range-track"
              style={{ ['--range-track' as string]: nitroxTrack(Number(nitroxPercentField.value)) }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Air (21%)</span>
              <span>Pure O2 (100%)</span>
            </div>
          </div>
          <NitroxMod
            nitroxPercent={Number(nitroxPercentField.value)}
            depthUnit={unitSystemField.value === 'imperial' ? 'imperial' : 'metric'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="starting-pressure-range"
              className="text-sm font-medium text-foreground"
            >
              <GaugeIcon className="w-4 h-4 inline mr-2 text-orange-500" aria-hidden="true" />
              Starting Pressure ({pressureUnit === 'metric' ? 'bar' : 'psi'})
            </label>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>0</span>
            <span className="text-foreground font-semibold">
              {startingPressureValue} {pressureUnit === 'metric' ? 'bar' : 'psi'}
            </span>
            <span>{pressureMax}</span>
          </div>
          <input
            id="starting-pressure-range"
            type="range"
            min={0}
            max={pressureMax}
            step={pressureStep}
            value={startingPressureValue}
            onChange={(e) => startingPressureField.onChange(String(Number(e.target.value)))}
            onBlur={startingPressureField.onBlur}
            aria-invalid={Boolean(startingPressureState.error?.message)}
            aria-describedby={
              startingPressureState.error?.message ? 'starting-pressure-error' : undefined
            }
            className="w-full h-2 rounded-full appearance-none range-track"
            style={{
              ['--range-track' as string]: sliderTrack(
                startingPressureValue,
                pressureMax,
                pressureUnit
              ),
            }}
          />
          {startingPressureState.error?.message && (
            <p id="starting-pressure-error" className="mt-1 text-sm text-destructive">
              {startingPressureState.error.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="ending-pressure-range"
            className="text-sm font-medium text-foreground mb-2 block"
          >
            <GaugeIcon className="w-4 h-4 inline mr-2 text-red-500" aria-hidden="true" />
            Ending Pressure ({pressureUnit === 'metric' ? 'bar' : 'psi'})
          </label>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>0</span>
            <span className="text-foreground font-semibold">
              {endingPressureValue} {pressureUnit === 'metric' ? 'bar' : 'psi'}
            </span>
            <span>{pressureMax}</span>
          </div>
          <input
            id="ending-pressure-range"
            type="range"
            min={0}
            max={pressureMax}
            step={pressureStep}
            value={endingPressureValue}
            onChange={(e) => endingPressureField.onChange(String(Number(e.target.value)))}
            onBlur={endingPressureField.onBlur}
            aria-invalid={Boolean(endingPressureState.error?.message)}
            aria-describedby={
              endingPressureState.error?.message ? 'ending-pressure-error' : undefined
            }
            className="w-full h-2 rounded-full appearance-none range-track"
            style={{
              ['--range-track' as string]: sliderTrack(
                endingPressureValue,
                pressureMax,
                pressureUnit
              ),
            }}
          />
          {endingPressureState.error?.message && (
            <p id="ending-pressure-error" className="mt-1 text-sm text-destructive">
              {endingPressureState.error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
