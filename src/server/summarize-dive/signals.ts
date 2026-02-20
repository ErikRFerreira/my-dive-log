import type { ComputedMetrics, DiveContext, DiverProfile, DiveSignal } from './types.js';

function pushSignal(
  signals: DiveSignal[],
  code: string,
  severity: DiveSignal['severity'],
  message: string,
  source: DiveSignal['source']
) {
  signals.push({ code, severity, message, source });
}

export function extractSignals(
  dive: DiveContext,
  profile: DiverProfile,
  metrics: ComputedMetrics
): DiveSignal[] {
  const signals: DiveSignal[] = [];

  if (dive.waterTempCelsius !== null && dive.waterTempCelsius <= 20) {
    pushSignal(
      signals,
      'cold_water',
      'medium',
      'Cold-water exposure likely increased thermal load and breathing demand.',
      'context'
    );
  }

  if (dive.currents === 'Moderate' || dive.currents === 'Strong') {
    pushSignal(
      signals,
      'current_load',
      'medium',
      'Current management demand was elevated.',
      'context'
    );
  }

  if (dive.diveType === 'Cave') {
    pushSignal(
      signals,
      'overhead_environment',
      'high',
      'Overhead environment profile requires disciplined team and guideline procedures.',
      'context'
    );
  }

  if (dive.visibility === 'Poor' || dive.visibility === 'Fair') {
    pushSignal(
      signals,
      'limited_visibility',
      'medium',
      'Limited visibility likely increased navigation and communication complexity.',
      'context'
    );
  }

  if (dive.maxDepthMeters !== null && dive.maxDepthMeters >= 30) {
    pushSignal(
      signals,
      'deep_profile',
      'high',
      'Depth profile likely increased gas demand and decompression planning workload.',
      'context'
    );
  }

  if (dive.durationMinutes !== null && dive.durationMinutes >= 50) {
    pushSignal(signals, 'long_duration', 'medium', 'Extended bottom-time profile.', 'context');
  }

  if (dive.gas?.startsWith('Nitrox')) {
    pushSignal(
      signals,
      'nitrox_used',
      'low',
      'Nitrox was used; oxygen exposure planning remains relevant.',
      'context'
    );
  }

  if (profile.totalLoggedDives > 0 && profile.totalLoggedDives < 25) {
    pushSignal(
      signals,
      'early_experience_band',
      'low',
      'Diver appears to be in an early experience band (<25 logged dives).',
      'profile'
    );
  }

  const rmvComparison = metrics.comparisons.find(
    (c) => c.kind === 'rmv' && c.delta !== null && c.delta > 0
  );
  if (rmvComparison) {
    pushSignal(
      signals,
      'gas_efficiency_drop',
      'medium',
      'Gas efficiency dropped compared to available baseline.',
      'metrics'
    );
  }

  return signals;
}
