import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wind, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Dive, Gas } from '../types';
import { useSettingsStore } from '@/store/settingsStore';
import { formatValueWithUnit } from '@/shared/utils/units';
import GasMixFields from '@/components/common/GasMixFields';
import { coercePressureValue } from '@/shared/utils/pressure';
import { useUpdateDive } from '../hooks/useUpdateDive';

interface GasUsageProps {
  dive: Dive;
  isEditing: boolean;
  isSaving: boolean;
  gasMix: Gas;
  nitroxPercent: number;
  startPressure: number | null;
  endPressure: number | null;
  airUsage: number | null;
  onGasMixChange: (value: Gas) => void;
  onNitroxPercentChange: (value: number) => void;
  onStartPressureChange: (value: number) => void;
  onEndPressureChange: (value: number) => void;
}

function GasUsage({
  dive,
  isEditing,
  isSaving,
  gasMix,
  nitroxPercent,
  startPressure,
  endPressure,
  airUsage,
  onGasMixChange,
  onNitroxPercentChange,
  onStartPressureChange,
  onEndPressureChange,
}: GasUsageProps) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const [localGasMix, setLocalGasMix] = useState<Gas>(dive.gas ?? 'air');
  const [localNitroxPercent, setLocalNitroxPercent] = useState<number>(
    dive.nitrox_percent ?? 21
  );
  const [localStartPressure, setLocalStartPressure] = useState<number | null>(
    dive.start_pressure ?? null
  );
  const [localEndPressure, setLocalEndPressure] = useState<number | null>(
    dive.end_pressure ?? null
  );
  const { mutateAsync: updateDive, isPending: isLocalSaving } = useUpdateDive();
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const isEditingActive = isEditing || localIsEditing;
  const isSavingActive = isEditing ? isSaving : isLocalSaving;
  const activeGasMix = isEditing ? gasMix : localGasMix;
  const activeNitroxPercent = isEditing ? nitroxPercent : localNitroxPercent;
  const activeStartPressure = isEditing ? startPressure : localStartPressure;
  const activeEndPressure = isEditing ? endPressure : localEndPressure;

  const pressureMax = unitSystem === 'metric' ? 240 : 3500;
  const pressureStep = unitSystem === 'metric' ? 10 : 100;
  const pressureUnit = unitSystem === 'metric' ? 'bar' : 'psi';

  const startPressureValue = coercePressureValue(
    activeStartPressure,
    pressureMax,
    pressureStep
  );
  const endPressureValue = coercePressureValue(activeEndPressure, pressureMax, pressureStep);
  const calculatedAirUsage =
    activeStartPressure !== null && activeEndPressure !== null
      ? activeStartPressure - activeEndPressure
      : null;
  const displayAirUsage = isEditing ? airUsage : calculatedAirUsage;

  useEffect(() => {
    if (isEditing) {
      setLocalIsEditing(false);
      setLocalGasMix(dive.gas ?? 'air');
      setLocalNitroxPercent(dive.nitrox_percent ?? 21);
      setLocalStartPressure(dive.start_pressure ?? null);
      setLocalEndPressure(dive.end_pressure ?? null);
    } else if (!localIsEditing) {
      setLocalGasMix(dive.gas ?? 'air');
      setLocalNitroxPercent(dive.nitrox_percent ?? 21);
      setLocalStartPressure(dive.start_pressure ?? null);
      setLocalEndPressure(dive.end_pressure ?? null);
    }
  }, [dive, isEditing, localIsEditing]);

  const hasChanges =
    localGasMix !== (dive.gas ?? 'air') ||
    localNitroxPercent !== (dive.nitrox_percent ?? 21) ||
    localStartPressure !== (dive.start_pressure ?? null) ||
    localEndPressure !== (dive.end_pressure ?? null);

  const handleEdit = () => {
    setLocalGasMix(dive.gas ?? 'air');
    setLocalNitroxPercent(dive.nitrox_percent ?? 21);
    setLocalStartPressure(dive.start_pressure ?? null);
    setLocalEndPressure(dive.end_pressure ?? null);
    setLocalIsEditing(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }
    setLocalGasMix(dive.gas ?? 'air');
    setLocalNitroxPercent(dive.nitrox_percent ?? 21);
    setLocalStartPressure(dive.start_pressure ?? null);
    setLocalEndPressure(dive.end_pressure ?? null);
    setLocalIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateDive({
        id: dive.id,
        diveData: {
          gas: localGasMix,
          nitrox_percent: localGasMix === 'nitrox' ? localNitroxPercent : null,
          start_pressure: localStartPressure,
          end_pressure: localEndPressure,
          air_usage: calculatedAirUsage,
        },
      });
      setLocalIsEditing(false);
    } catch (error) {
      console.error('Failed to save gas usage:', error);
    }
  };

  return (
    <section className="flex-col">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-primary" />
          <h3 className="text-foreground text-lg font-semibold">Gas Usage</h3>
        </div>
        {isEditing ? (
          <button
            type="button"
            className="text-primary/60 cursor-not-allowed font-medium"
            disabled
          >
            Edit
          </button>
        ) : !localIsEditing ? (
          <button
            type="button"
            onClick={handleEdit}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSavingActive || !hasChanges}
              size="sm"
              className="gap-1 h-8 bg-primary hover:bg-primary/90"
            >
              <Check className="w-4 h-4" />
              {isSavingActive ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isSavingActive}
              size="sm"
              variant="outline"
              className="gap-1 h-8"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-card-dark border-border-dark rounded-2xl">
        <CardContent className="p-6 space-y-6">
          {isEditingActive ? (
            <GasMixFields
              gasMix={activeGasMix}
              onGasMixChange={isEditing ? onGasMixChange : setLocalGasMix}
              nitroxPercent={activeNitroxPercent}
              onNitroxPercentChange={
                isEditing ? onNitroxPercentChange : setLocalNitroxPercent
              }
              depthUnit={unitSystem === 'imperial' ? 'imperial' : 'metric'}
              startPressure={startPressureValue}
              endPressure={endPressureValue}
              onStartPressureChange={
                isEditing ? onStartPressureChange : setLocalStartPressure
              }
              onEndPressureChange={isEditing ? onEndPressureChange : setLocalEndPressure}
              pressureMax={pressureMax}
              pressureStep={pressureStep}
              pressureUnit={pressureUnit}
              disabled={isSavingActive}
            />
          ) : (
            <>
              {/* Gas Mix Display */}
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

              {/* Start Pressure Display */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Start Pressure</p>
                <p className="font-semibold text-foreground">
                  {dive.start_pressure !== null && dive.start_pressure !== undefined
                    ? formatValueWithUnit(dive.start_pressure, 'pressure', unitSystem)
                    : 'N/A'}
                </p>
              </div>

              {/* End Pressure Display */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">End Pressure</p>
                <p className="font-semibold text-foreground">
                  {dive.end_pressure !== null && dive.end_pressure !== undefined
                    ? formatValueWithUnit(dive.end_pressure, 'pressure', unitSystem)
                    : 'N/A'}
                </p>
              </div>
            </>
          )}

          {/* Total Used (calculated) - Always visible */}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground">Total Used</p>
            <p className="font-semibold text-foreground">
              {isEditingActive
                ? displayAirUsage !== null
                  ? formatValueWithUnit(displayAirUsage, 'pressure', unitSystem)
                  : 'N/A'
                : dive.air_usage !== null && dive.air_usage !== undefined
                  ? formatValueWithUnit(dive.air_usage, 'pressure', unitSystem)
                  : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default GasUsage;
