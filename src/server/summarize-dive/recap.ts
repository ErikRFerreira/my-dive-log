import type { DiveContext } from './types.js';

export function buildDeterministicRecap(dive: DiveContext): string {
  const parts = [
    `Dive logged at ${dive.location}${dive.country ? `, ${dive.country}` : ''} on ${dive.date}.`,
  ];

  if (dive.maxDepthMeters !== null || dive.durationMinutes !== null) {
    const profile = [
      dive.maxDepthMeters !== null ? `max depth ${dive.maxDepthMeters} m` : null,
      dive.durationMinutes !== null ? `duration ${dive.durationMinutes} min` : null,
    ]
      .filter(Boolean)
      .join(', ');

    if (profile) {
      parts.push(`Profile: ${profile}.`);
    }
  }

  return parts.join(' ');
}
