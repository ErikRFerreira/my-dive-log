import type { Dive } from '../types/Dive';

export const sampleDives: Dive[] = [
  {
    id: '1',
    userId: 'user123',
    location: 'Sesimbra, Portugal',
    date: '2025-04-05',
    depth: 18,
    duration: 42,
    notes: 'Calm seas, great vis. Octopus spotted.',
  },
  {
    id: '2',
    userId: 'user123',
    location: 'Berlengas, Portugal',
    date: '2025-06-12',
    depth: 27,
    duration: 38,
    notes: 'Thermocline at 22m, mild current.',
  },
  {
    id: '3',
    userId: 'user123',
    location: 'Madeira, Garajau',
    date: '2025-08-21',
    depth: 34,
    duration: 35,
    notes: 'Groupers and barracuda schools. Slight surge.',
  },
  {
    id: '4',
    userId: 'user123',
    location: 'Cabo Raso, Portugal',
    date: '2025-09-15',
    depth: 52,
    duration: 40,
    notes: 'Rock formations, good vis, saw a moray eel.',
  },
];
