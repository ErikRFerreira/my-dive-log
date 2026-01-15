type Props = {
  nitroxPercent: number;
  depthUnit: 'metric' | 'imperial';
};

export default function NitroxMod({ nitroxPercent, depthUnit }: Props) {
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
