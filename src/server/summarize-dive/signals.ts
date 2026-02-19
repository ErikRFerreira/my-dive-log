import type { NormalizedDiveContext } from './types.js';

export function extractSignals(context: NormalizedDiveContext): string[] {
  const signals: string[] = [];

  if (context.waterTemp !== null && context.waterTemp <= 20) {
    signals.push('Cold-water exposure likely affected comfort and thermal management.');
  }

  if (context.currents === 'Moderate' || context.currents === 'Strong') {
    signals.push('Current management demand appears elevated.');
  }

  if (context.diveType === 'Cave') {
    signals.push('Overhead environment profile requires strict guideline discipline.');
  }

  if (context.visibility === 'Poor' || context.visibility === 'Fair') {
    signals.push('Limited visibility likely affected navigation and communication.');
  }

  if (context.depth !== null && context.depth >= 30) {
    signals.push('Deeper profile likely increased gas and decompression planning demands.');
  }

  if (context.duration !== null && context.duration >= 50) {
    signals.push('Extended bottom-time profile.');
  }

  if (context.gas?.startsWith('Nitrox')) {
    signals.push('Nitrox was used; gas planning awareness remains relevant.');
  }

  return signals;
}

export function inferEnvironmentHints(context: NormalizedDiveContext): string[] {
  const hints: string[] = [];
  const locationLower = context.location.toLowerCase();

  if (locationLower.includes('cenote')) {
    hints.push('High-confidence inference: this environment is likely a cenote.');
  } else if (context.diveType === 'Cave' && context.waterType === 'Fresh water') {
    hints.push('High-confidence inference: this was likely a freshwater overhead cave environment.');
  } else if (context.diveType === 'Drift' && (context.currents === 'Moderate' || context.currents === 'Strong')) {
    hints.push('High-confidence inference: this profile likely emphasized drift/current diving techniques.');
  }

  return hints;
}
