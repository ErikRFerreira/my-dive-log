import { describe, expect, it } from 'vitest';
import { createUpdateDiveSchema } from './updateDiveSchema';

describe('createUpdateDiveSchema', () => {
  it('drops non-string equipment/wildlife items instead of coercing them', () => {
    const schema = createUpdateDiveSchema('metric');

    const parsed = schema.parse({
      date: '2025-01-15',
      location: 'Blue Hole',
      country: null,
      country_code: 'AU',
      depth: 18,
      duration: 45,
      notes: '',
      summary: '',
      water_temp: null,
      visibility: 'good',
      start_pressure: null,
      end_pressure: null,
      air_usage: null,
      equipment: ['BCD', { value: 'Regulator' }, '  Mask  '],
      wildlife: ['Sea Turtle', 123, '  Reef Shark  '],
      dive_type: 'reef',
      water_type: 'salt',
      exposure: 'wet-5mm',
      gas: 'air',
      currents: 'mild',
      weight: null,
      nitrox_percent: 32,
    });

    expect(parsed.equipment).toEqual(['BCD', 'Mask']);
    expect(parsed.wildlife).toEqual(['Sea Turtle', 'Reef Shark']);
    expect(parsed.equipment).not.toContain('[object Object]');
    expect(parsed.wildlife).not.toContain('[object Object]');
  });
});
