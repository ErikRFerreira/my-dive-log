import type {
  BaselinesBundle,
  ComparisonResult,
  ComputedMetrics,
  DiveContext,
  DiverProfile,
} from './types.js';

const DEPTH_DELTA_THRESHOLD_METERS = 1;
const DURATION_DELTA_THRESHOLD_MINUTES = 5;
const GAS_EFFICIENCY_DELTA_THRESHOLD_RATIO = 0.1;
const GLOBAL_BASELINE_MIN = 5;
const LOCATION_BASELINE_MIN = 3;
const RECENT_BASELINE_MIN = 3;

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

function rmvConfidence(estimatedRMV: number | null, averageDepthSource: DiveContext['averageDepthSource']): ComputedMetrics['rmvConfidence'] {
  if (estimatedRMV === null) return 'missing';
  if (averageDepthSource === 'logged') return 'measured';
  if (averageDepthSource === 'estimated') return 'estimated';
  return 'missing';
}

function addComparison(params: {
  kind: ComparisonResult['kind'];
  baseline: ComparisonResult['baseline'];
  current: number | null;
  baselineValue: number | null;
  sampleSize: number;
  minSamples: number;
  evidence: string[];
}): ComparisonResult | null {
  const { kind, baseline, current, baselineValue, sampleSize, minSamples, evidence } = params;
  if (current === null || baselineValue === null) return null;
  if (!Number.isFinite(current) || !Number.isFinite(baselineValue)) return null;
  if (sampleSize < minSamples) return null;

  const delta = round(current - baselineValue);
  const percent =
    baselineValue !== 0 && baselineValue !== null ? round((delta / baselineValue) * 100) : null;

  let score = 0;
  if (kind === 'rmv') {
    const ratio = percent !== null ? Math.abs(percent) / 100 : 0;
    score = ratio;
  } else if (kind === 'depth') {
    score = Math.abs(delta) / DEPTH_DELTA_THRESHOLD_METERS;
  } else {
    score = Math.abs(delta) / DURATION_DELTA_THRESHOLD_MINUTES;
  }

  let text: string;
  if (kind === 'depth') {
    text =
      Math.abs(delta) < DEPTH_DELTA_THRESHOLD_METERS
        ? `Depth is in line with ${baseline} baseline (±${DEPTH_DELTA_THRESHOLD_METERS} m).`
        : delta > 0
        ? `Depth deeper than ${baseline} average by ~${Math.abs(delta)} m.`
        : `Depth shallower than ${baseline} average by ~${Math.abs(delta)} m.`;
  } else if (kind === 'duration') {
    text =
      Math.abs(delta) < DURATION_DELTA_THRESHOLD_MINUTES
        ? `Duration matches ${baseline} baseline (±${DURATION_DELTA_THRESHOLD_MINUTES} min).`
        : delta > 0
        ? `Bottom time longer than ${baseline} average by ~${Math.abs(delta)} min.`
        : `Bottom time shorter than ${baseline} average by ~${Math.abs(delta)} min.`;
  } else {
    if (percent !== null && Math.abs(percent) < GAS_EFFICIENCY_DELTA_THRESHOLD_RATIO * 100) {
      text = `Gas efficiency near ${baseline} baseline (RMV within ~${Math.round(
        GAS_EFFICIENCY_DELTA_THRESHOLD_RATIO * 100
      )}% ).`;
    } else if (delta < 0) {
      text = `Gas efficiency improved vs ${baseline} baseline (~${Math.abs(percent ?? 0)}% lower RMV).`;
    } else {
      text = `Gas efficiency worse vs ${baseline} baseline (~${Math.abs(percent ?? 0)}% higher RMV).`;
    }
  }

  return {
    kind,
    baseline,
    text,
    evidence,
    score,
    delta,
    percent,
  };
}

function priorityBaselineRank(baseline: ComparisonResult['baseline']): number {
  if (baseline === 'location') return 1;
  if (baseline === 'recent') return 2;
  return 3;
}

function sortComparisons(a: ComparisonResult, b: ComparisonResult): number {
  if (b.score !== a.score) return b.score - a.score;
  const rankDiff = priorityBaselineRank(a.baseline) - priorityBaselineRank(b.baseline);
  if (rankDiff !== 0) return rankDiff;
  const kindOrder: Record<ComparisonResult['kind'], number> = { rmv: 1, depth: 2, duration: 3 };
  return kindOrder[a.kind] - kindOrder[b.kind];
}

export function computeDiveMetrics(
  dive: DiveContext,
  // profile parameter retained for future extensions; currently unused in metrics calculations.
  _profile: DiverProfile,
  baselines: BaselinesBundle
): ComputedMetrics {
  const estimatedRMV = computeEstimatedRMV({
    gasUsedBar: dive.gasUsedBar,
    cylinderSizeLiters: dive.cylinderSizeLiters,
    averageDepthMeters: dive.averageDepthMeters,
    durationMinutes: dive.durationMinutes,
  });

  const availability = baselines.availability;
  const comparisons: ComparisonResult[] = [];

  const scopes: Array<{
    label: ComparisonResult['baseline'];
    baselineObj: BaselinesBundle[keyof BaselinesBundle] | null | undefined;
    minSamples: number;
  }> = [
    { label: 'location', baselineObj: baselines.location, minSamples: LOCATION_BASELINE_MIN },
    { label: 'recent', baselineObj: baselines.recent, minSamples: RECENT_BASELINE_MIN },
    { label: 'global', baselineObj: baselines.global, minSamples: GLOBAL_BASELINE_MIN },
  ];

  for (const { label, baselineObj, minSamples } of scopes) {
    if (!baselineObj) continue;
    const base = baselineObj as {
      sampleSize: number;
      avgDepth: number | null;
      avgDuration: number | null;
      avgRMV: number | null;
    };
    const baseEvidencePrefix = `baseline.${label}`;
    const depthComparison = addComparison({
      kind: 'depth',
      baseline: label,
      current: dive.maxDepthMeters,
      baselineValue: base.avgDepth,
      sampleSize: base.sampleSize,
      minSamples,
      evidence: ['dive.maxDepthMeters', `${baseEvidencePrefix}.avgDepth`],
    });
    if (depthComparison) comparisons.push(depthComparison);

    const durationComparison = addComparison({
      kind: 'duration',
      baseline: label,
      current: dive.durationMinutes,
      baselineValue: base.avgDuration,
      sampleSize: base.sampleSize,
      minSamples,
      evidence: ['dive.durationMinutes', `${baseEvidencePrefix}.avgDuration`],
    });
    if (durationComparison) comparisons.push(durationComparison);

    const rmvComparison = addComparison({
      kind: 'rmv',
      baseline: label,
      current: estimatedRMV,
      baselineValue: base.avgRMV,
      sampleSize: base.sampleSize,
      minSamples,
      evidence: ['metrics.estimatedRMV', `${baseEvidencePrefix}.avgRMV`],
    });
    if (rmvComparison) comparisons.push(rmvComparison);
  }

  const sortedComparisons = comparisons.sort(sortComparisons);
  const topComparison = sortedComparisons[0] ?? null;

  return {
    estimatedRMV,
    rmvConfidence: rmvConfidence(estimatedRMV, dive.averageDepthSource),
    averageDepthSource: dive.averageDepthSource,
    comparisons: sortedComparisons,
    topComparison,
    baselineAvailability: availability,
  };
}
