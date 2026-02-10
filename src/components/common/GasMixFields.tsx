import { Gauge as GaugeIcon, Sparkles, Wind } from 'lucide-react';
import type { Gas } from '@/features/dives/types';
import NitroxMod from './NitroxMod';
import { sliderTrack, nitroxTrack } from '@/shared/utils/pressure';

interface GasMixFieldsProps {
  // Gas Mix
  gasMix: Gas;
  onGasMixChange: (value: Gas) => void;

  // Nitrox
  nitroxPercent: number;
  onNitroxPercentChange: (value: number) => void;
  showNitroxMod?: boolean;
  depthUnit: 'metric' | 'imperial';

  // Pressure
  startPressure: number;
  endPressure: number;
  onStartPressureChange: (value: number) => void;
  onEndPressureChange: (value: number) => void;
  pressureMax: number;
  pressureStep: number;
  pressureUnit: string;

  // Optional
  disabled?: boolean;
  showGasMixLabel?: boolean;
}

export default function GasMixFields({
  gasMix,
  onGasMixChange,
  nitroxPercent,
  onNitroxPercentChange,
  showNitroxMod = true,
  depthUnit,
  startPressure,
  endPressure,
  onStartPressureChange,
  onEndPressureChange,
  pressureMax,
  pressureStep,
  pressureUnit,
  disabled = false,
  showGasMixLabel = true,
}: GasMixFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Gas Mix Selection */}
      <div>
        {showGasMixLabel && (
          <label className="text-sm font-medium text-foreground mb-3 block">
            <Wind className="w-4 h-4 inline mr-2 text-teal-500" aria-hidden="true" />
            Gas Mix
          </label>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onGasMixChange('air')}
            disabled={disabled}
            className={`p-4 rounded-lg border-2 transition-all hover:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed ${
              gasMix === 'air'
                ? 'border-teal-500 bg-teal-950'
                : 'border-slate-700'
            }`}
          >
            <div className="text-base font-medium">Air</div>
          </button>
          <button
            type="button"
            onClick={() => onGasMixChange('nitrox')}
            disabled={disabled}
            className={`p-4 rounded-lg border-2 transition-all hover:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed ${
              gasMix === 'nitrox'
                ? 'border-teal-500 bg-teal-950'
                : 'border-slate-700'
            }`}
          >
            <div className="text-base font-medium">Nitrox</div>
          </button>
        </div>
      </div>

      {/* Nitrox Percentage Slider */}
      {gasMix === 'nitrox' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="nitrox-percent-range" className="text-sm font-medium text-foreground">
              <Sparkles className="w-4 h-4 inline mr-2 text-yellow-500" aria-hidden="true" />
              Oxygen (O2)
            </label>
            <span className="text-2xl font-bold text-teal-500">{nitroxPercent}%</span>
          </div>
          <div className="space-y-2">
            <input
              id="nitrox-percent-range"
              type="range"
              min={21}
              max={100}
              step={1}
              value={nitroxPercent}
              onChange={(e) => onNitroxPercentChange(Number(e.target.value))}
              disabled={disabled}
              className="w-full h-2 rounded-full appearance-none range-track disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ ['--range-track' as string]: nitroxTrack(nitroxPercent) }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Air (21%)</span>
              <span>Pure O2 (100%)</span>
            </div>
          </div>
          {showNitroxMod && <NitroxMod nitroxPercent={nitroxPercent} depthUnit={depthUnit} />}
        </div>
      )}

      {/* Starting Pressure */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="starting-pressure-range" className="text-sm font-medium text-foreground">
            <GaugeIcon className="w-4 h-4 inline mr-2 text-orange-500" aria-hidden="true" />
            Starting Pressure ({pressureUnit})
          </label>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>0</span>
          <span className="text-foreground font-semibold">
            {startPressure} {pressureUnit}
          </span>
          <span>{pressureMax}</span>
        </div>
        <input
          id="starting-pressure-range"
          type="range"
          min={0}
          max={pressureMax}
          step={pressureStep}
          value={startPressure}
          onChange={(e) => onStartPressureChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 rounded-full appearance-none range-track disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            ['--range-track' as string]: sliderTrack(
              startPressure,
              pressureMax,
              pressureUnit === 'psi' ? 'imperial' : 'metric'
            ),
          }}
        />
      </div>

      {/* Ending Pressure */}
      <div>
        <label
          htmlFor="ending-pressure-range"
          className="text-sm font-medium text-foreground mb-2 block"
        >
          <GaugeIcon className="w-4 h-4 inline mr-2 text-red-500" aria-hidden="true" />
          Ending Pressure ({pressureUnit})
        </label>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>0</span>
          <span className="text-foreground font-semibold">
            {endPressure} {pressureUnit}
          </span>
          <span>{pressureMax}</span>
        </div>
        <input
          id="ending-pressure-range"
          type="range"
          min={0}
          max={pressureMax}
          step={pressureStep}
          value={endPressure}
          onChange={(e) => onEndPressureChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 rounded-full appearance-none range-track disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            ['--range-track' as string]: sliderTrack(
              endPressure,
              pressureMax,
              pressureUnit === 'psi' ? 'imperial' : 'metric'
            ),
          }}
        />
      </div>
    </div>
  );
}

