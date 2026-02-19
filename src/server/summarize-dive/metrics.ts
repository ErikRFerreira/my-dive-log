import type { ComputedMetrics, DiveContext, DiverProfile } from './types.js';

const DEPTH_DELTA_THRESHOLD_METERS = 1;
const DURATION_DELTA_THRESHOLD_MINUTES = 5;
const GAS_EFFICIENCY_DELTA_THRESHOLD_RATIO = 0.1;

function round(value: number): number {
  return Number(value.toFixed(1));
}

/**
 * Estimate RMV (surface L/min) from logged gas + cylinder + depth + time.
 * Formula:
 *   ATA ~= (avgDepthMeters / 10) + 1
 *   litersUsed = gasUsedBar * cylinderSizeLiters
 *   RMV = litersUsed / (ATA * durationMinutes)
 * Returns null for missing/invalid/non-physical inputs.
 */
export function computeEstimatedRMV(params: {
  gasUsedBar: number | null;
  cylinderSizeLiters: number | null;
  averageDepthMeters: number | null;
  durationMinutes: number | null;
}): number | null {
  const { gasUsedBar, cylinderSizeLiters, averageDepthMeters, durationMinutes } = params;

  if (
    gasUsedBar == null ||
    cylinderSizeLiters == null ||
    averageDepthMeters == null ||
    durationMinutes == null
  ) {
    return null;
  }

  if (
    !Number.isFinite(gasUsedBar) ||
    !Number.isFinite(cylinderSizeLiters) ||
    !Number.isFinite(averageDepthMeters) ||
    !Number.isFinite(durationMinutes)
  ) {
    return null;
  }

  if (gasUsedBar <= 0 || cylinderSizeLiters <= 0 || durationMinutes <= 0 || averageDepthMeters < 0) {
    return null;
  }

  const ata = averageDepthMeters / 10 + 1;
  if (ata <= 0) return null;

  const litersUsed = gasUsedBar * cylinderSizeLiters;
  const rmv = litersUsed / (ata * durationMinutes);

  if (!Number.isFinite(rmv) || rmv <= 0) return null;
  return round(rmv);
}

function compareDepth(currentDepth: number | null, avgDepth: number | null): string | null {
  if (currentDepth === null || avgDepth === null) return null;

  const delta = round(currentDepth - avgDepth);
  if (Math.abs(delta) < DEPTH_DELTA_THRESHOLD_METERS) {
    return `Depth is in line with your baseline (within ~${DEPTH_DELTA_THRESHOLD_METERS} m).`;
  }

  if (delta > 0) {
    return `Deeper than your average by ~${Math.abs(delta)} m.`;
  }

  return `Shallower than your average by ~${Math.abs(delta)} m.`;
}

function compareDuration(currentDuration: number | null, avgDuration: number | null): string | null {
  if (currentDuration === null || avgDuration === null) return null;

  const delta = round(currentDuration - avgDuration);
  if (Math.abs(delta) < DURATION_DELTA_THRESHOLD_MINUTES) {
    return `Duration is close to your baseline (within ~${DURATION_DELTA_THRESHOLD_MINUTES} min).`;
  }

  if (delta > 0) {
    return `Longer bottom time than usual by ~${Math.abs(delta)} min.`;
  }

  return `Shorter bottom time than usual by ~${Math.abs(delta)} min.`;
}

function compareGasEfficiency(
  estimatedRMV: number | null,
  avgEstimatedRMV: number | null
): string | null {
  if (estimatedRMV === null || avgEstimatedRMV === null || avgEstimatedRMV <= 0) return null;

  const deltaRatio = (estimatedRMV - avgEstimatedRMV) / avgEstimatedRMV;
  const deltaPercent = round(Math.abs(deltaRatio) * 100);

  if (Math.abs(deltaRatio) < GAS_EFFICIENCY_DELTA_THRESHOLD_RATIO) {
    return 'Gas efficiency is near your baseline.';
  }

  if (deltaRatio < 0) {
    return `Gas efficiency slightly improved compared to your baseline (~${deltaPercent}% lower RMV).`;
  }

  return `Gas efficiency decreased compared to your baseline (~${deltaPercent}% higher RMV).`;
}

export function hasHistoricalBaseline(profile: DiverProfile): boolean {
  return (
    profile.totalLoggedDives >= 5 &&
    (profile.avgDepth !== null || profile.avgDuration !== null || profile.avgEstimatedRMV !== null)
  );
}

export function pickDeterministicBaselineComparison(metrics: ComputedMetrics): string | null {
  return (
    metrics.depthComparedToAverage ??
    metrics.durationComparedToAverage ??
    metrics.gasEfficiencyComparedToAverage
  );
}

export function computeDiveMetrics(dive: DiveContext, profile: DiverProfile): ComputedMetrics {
  const estimatedRMV = computeEstimatedRMV({
    gasUsedBar: dive.gasUsedBar,
    cylinderSizeLiters: dive.cylinderSizeLiters,
    averageDepthMeters: dive.averageDepthMeters,
    durationMinutes: dive.durationMinutes,
  });

  return {
    estimatedRMV,
    depthComparedToAverage: compareDepth(dive.maxDepthMeters, profile.avgDepth),
    durationComparedToAverage: compareDuration(dive.durationMinutes, profile.avgDuration),
    gasEfficiencyComparedToAverage: compareGasEfficiency(estimatedRMV, profile.avgEstimatedRMV ?? null),
  };
}
