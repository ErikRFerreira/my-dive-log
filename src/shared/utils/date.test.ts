import { describe, expect, it } from 'vitest';
import { getLocalDateInputValue } from './date';

describe('getLocalDateInputValue', () => {
  it('uses local date getters instead of UTC ISO date slicing', () => {
    const fakeDate = {
      getFullYear: () => 2026,
      getMonth: () => 0, // January
      getDate: () => 2,
      toISOString: () => '2026-01-01T18:00:00.000Z',
    } as unknown as Date;

    expect(getLocalDateInputValue(fakeDate)).toBe('2026-01-02');
  });
});
