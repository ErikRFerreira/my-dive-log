import { useEffect, useRef } from 'react';

import { GAS_OPTIONS } from '../utils/options';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import type { LogDiveFormData } from '../schema/schema';
import { Input } from '@/components/ui/input';
import { convertValueBetweenSystems } from '@/shared/utils/units';
type Props = {
  control: Control<LogDiveFormData, unknown, LogDiveFormData>;
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
  const { field: pressureUnitField } = useController({ name: 'pressureUnit', control });
  const { field: depthUnitField } = useController({ name: 'depthUnit', control });
  const pressureUnit = pressureUnitField.value === 'imperial' ? 'imperial' : 'metric';
  const pressureMax = pressureUnit === 'metric' ? 240 : 3500;
  const pressureStep = pressureUnit === 'metric' ? 10 : 100;
  const prevPressureUnitRef = useRef(pressureUnit);
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
    const prevUnit = prevPressureUnitRef.current;
    if (prevUnit === pressureUnit) return;

    const startParsed = parsePressureInput(startingPressureField.value);
    if (startParsed !== null) {
      const converted = convertValueBetweenSystems(startParsed, 'pressure', prevUnit, pressureUnit);
      startingPressureField.onChange(String(clampPressure(converted, pressureMax, pressureStep)));
    }

    const endParsed = parsePressureInput(endingPressureField.value);
    if (endParsed !== null) {
      const converted = convertValueBetweenSystems(endParsed, 'pressure', prevUnit, pressureUnit);
      endingPressureField.onChange(String(clampPressure(converted, pressureMax, pressureStep)));
    }

    prevPressureUnitRef.current = pressureUnit;
  }, [
    pressureUnit,
    pressureMax,
    pressureStep,
    startingPressureField,
    endingPressureField,
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Gas Usage</h2>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Gas Mix</label>
        <div className="grid grid-cols-2 gap-3">
          {GAS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => gasMixField.onChange(option.value)}
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
            <span className="text-sm font-medium text-foreground">Oxygen (O2)</span>
            <span className="text-2xl font-bold text-teal-500">{nitroxPercentField.value}%</span>
          </div>
          <div className="space-y-2">
            <input
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
            depthUnit={depthUnitField.value === 'imperial' ? 'imperial' : 'metric'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">
              Starting Pressure ({pressureUnit === 'metric' ? 'bar' : 'psi'})
            </label>
            <div className="flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                type="button"
                onClick={() => pressureUnitField.onChange('metric')}
                className={`px-2 py-1 text-xs ${
                  pressureUnit === 'metric'
                    ? 'bg-teal-500 text-white'
                    : 'bg-transparent text-muted-foreground'
                }`}
              >
                bar
              </button>
              <button
                type="button"
                onClick={() => pressureUnitField.onChange('imperial')}
                className={`px-2 py-1 text-xs ${
                  pressureUnit === 'imperial'
                    ? 'bg-teal-500 text-white'
                    : 'bg-transparent text-muted-foreground'
                }`}
              >
                psi
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>0</span>
            <span className="text-foreground font-semibold">
              {startingPressureValue} {pressureUnit === 'metric' ? 'bar' : 'psi'}
            </span>
            <span>{pressureMax}</span>
          </div>
          <input
            type="range"
            min={0}
            max={pressureMax}
            step={pressureStep}
            value={startingPressureValue}
            onChange={(e) => startingPressureField.onChange(String(Number(e.target.value)))}
            onBlur={startingPressureField.onBlur}
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
            <p className="mt-1 text-sm text-destructive">{startingPressureState.error.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
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
            type="range"
            min={0}
            max={pressureMax}
            step={pressureStep}
            value={endingPressureValue}
            onChange={(e) => endingPressureField.onChange(String(Number(e.target.value)))}
            onBlur={endingPressureField.onBlur}
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
            <p className="mt-1 text-sm text-destructive">{endingPressureState.error.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function NitroxMod({
  nitroxPercent,
  depthUnit,
}: {
  nitroxPercent: number;
  depthUnit: 'metric' | 'imperial';
}) {
  const fraction = Math.max(0.21, Math.min(1, nitroxPercent / 100));
  const maxPpo2 = 1.4;
  const depthMeters = Math.max(0, (maxPpo2 / fraction - 1) * 10);
  const depth = depthUnit === 'metric' ? depthMeters : depthMeters * 3.28084;
  const depthLabel = depthUnit === 'metric' ? 'meters' : 'feet';

  return (
    <div className="rounded-lg border border-teal-200/60 dark:border-teal-900/60 bg-teal-50/60 dark:bg-teal-950/40 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-teal-600 dark:text-teal-300">
        Max Operating Depth (MOD)
      </p>
      <p className="text-lg font-semibold text-foreground">
        {depth.toFixed(1)} {depthLabel} <span className="text-muted-foreground">@ 1.4 ppO2</span>
      </p>
    </div>
  );
}

function coercePressureValue(value: unknown, maxValue: number, step: number) {
  const parsed = parsePressureInput(value);
  if (parsed !== null) return clampPressure(parsed, maxValue, step);
  return maxValue;
}

function clampPressure(value: number, maxValue: number, step: number) {
  return Math.max(0, Math.min(maxValue, Math.round(value / step) * step));
}

function parsePressureInput(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function pressureColor(value: number, unit: 'metric' | 'imperial') {
  const barToPsi = 14.5038;
  const low = unit === 'metric' ? 50 : 50 * barToPsi;
  const warn = unit === 'metric' ? 70 : 70 * barToPsi;
  if (value <= low) return '#ef4444';
  if (value <= warn) return '#f97316';
  return '#0ea5a4';
}

function sliderTrack(value: number, maxValue: number, unit: 'metric' | 'imperial') {
  const percent = (value / maxValue) * 100;
  const color = pressureColor(value, unit);
  const base = '#1f2937';
  return `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, ${base} ${percent}%, ${base} 100%)`;
}

function nitroxTrack(value: number) {
  const percent = ((value - 21) / (100 - 21)) * 100;
  const color = '#0ea5a4';
  const base = '#1f2937';
  return `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, ${base} ${percent}%, ${base} 100%)`;
}
