import { describe, it, expect } from 'vitest';
import {
  parsePressureInput,
  clampPressure,
  coercePressureValue,
  pressureColor,
  sliderTrack,
  nitroxTrack,
} from './pressure';

describe('parsePressureInput', () => {
  it('should parse valid number', () => {
    expect(parsePressureInput(150)).toBe(150);
    expect(parsePressureInput(0)).toBe(0);
    expect(parsePressureInput(200.5)).toBe(200.5);
  });

  it('should parse valid string number', () => {
    expect(parsePressureInput('150')).toBe(150);
    expect(parsePressureInput('150.5')).toBe(150.5);
    expect(parsePressureInput('0')).toBe(0);
  });

  it('should handle whitespace in strings', () => {
    expect(parsePressureInput('  150  ')).toBe(150);
    expect(parsePressureInput('  150.5  ')).toBe(150.5);
  });

  it('should return null for empty string', () => {
    expect(parsePressureInput('')).toBe(null);
    expect(parsePressureInput('   ')).toBe(null);
  });

  it('should return null for invalid string input', () => {
    expect(parsePressureInput('abc')).toBe(null);
    expect(parsePressureInput('12abc')).toBe(null);
    expect(parsePressureInput('abc12')).toBe(null);
  });

  it('should return null for non-finite numbers', () => {
    expect(parsePressureInput(NaN)).toBe(null);
    expect(parsePressureInput(Infinity)).toBe(null);
    expect(parsePressureInput(-Infinity)).toBe(null);
  });

  it('should return null for null and undefined', () => {
    expect(parsePressureInput(null)).toBe(null);
    expect(parsePressureInput(undefined)).toBe(null);
  });

  it('should handle negative numbers', () => {
    expect(parsePressureInput(-50)).toBe(-50);
    expect(parsePressureInput('-50')).toBe(-50);
  });

  it('should return null for objects and arrays', () => {
    expect(parsePressureInput({})).toBe(null);
    expect(parsePressureInput([])).toBe(null);
    expect(parsePressureInput([150])).toBe(null);
  });
});

describe('clampPressure', () => {
  describe('clamping to minimum (0)', () => {
    it('should clamp negative values to 0', () => {
      expect(clampPressure(-50, 200, 10)).toBe(0);
      expect(clampPressure(-1, 200, 10)).toBe(0);
      expect(clampPressure(-100, 200, 10)).toBe(0);
    });
  });

  describe('clamping to maximum', () => {
    it('should clamp values above maxValue', () => {
      expect(clampPressure(250, 200, 10)).toBe(200);
      expect(clampPressure(999, 200, 10)).toBe(200);
      expect(clampPressure(201, 200, 10)).toBe(200);
    });
  });

  describe('rounding to nearest step', () => {
    it('should round to nearest 10 for metric', () => {
      expect(clampPressure(155, 200, 10)).toBe(160); // Round up
      expect(clampPressure(154, 200, 10)).toBe(150); // Round down
      expect(clampPressure(145, 200, 10)).toBe(150); // Exactly halfway rounds up
    });

    it('should round to nearest 100 for imperial', () => {
      expect(clampPressure(2550, 3500, 100)).toBe(2600); // Round up
      expect(clampPressure(2549, 3500, 100)).toBe(2500); // Round down
      expect(clampPressure(2450, 3500, 100)).toBe(2500); // Exactly halfway rounds up
    });

    it('should not round when step is 1', () => {
      expect(clampPressure(155, 200, 1)).toBe(155);
      expect(clampPressure(154.7, 200, 1)).toBe(155);
    });
  });

  describe('exact values', () => {
    it('should keep values that are exact multiples of step', () => {
      expect(clampPressure(150, 200, 10)).toBe(150);
      expect(clampPressure(200, 200, 10)).toBe(200);
      expect(clampPressure(0, 200, 10)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle 0 value', () => {
      expect(clampPressure(0, 200, 10)).toBe(0);
    });

    it('should handle max value', () => {
      expect(clampPressure(200, 200, 10)).toBe(200);
    });

    it('should handle decimal steps', () => {
      expect(clampPressure(10.3, 20, 0.5)).toBe(10.5);
    });
  });
});

describe('coercePressureValue', () => {
  it('should coerce valid string values', () => {
    expect(coercePressureValue('150', 200, 10)).toBe(150);
    expect(coercePressureValue('155', 200, 10)).toBe(160); // Rounded
  });

  it('should coerce valid number values', () => {
    expect(coercePressureValue(150, 200, 10)).toBe(150);
    expect(coercePressureValue(155, 200, 10)).toBe(160); // Rounded
  });

  it('should clamp values above max', () => {
    expect(coercePressureValue(250, 200, 10)).toBe(200);
    expect(coercePressureValue('250', 200, 10)).toBe(200);
  });

  it('should clamp negative values to 0', () => {
    expect(coercePressureValue(-50, 200, 10)).toBe(0);
    expect(coercePressureValue('-50', 200, 10)).toBe(0);
  });

  it('should return 0 for invalid input', () => {
    expect(coercePressureValue('abc', 200, 10)).toBe(0);
    expect(coercePressureValue(null, 200, 10)).toBe(0);
    expect(coercePressureValue(undefined, 200, 10)).toBe(0);
    expect(coercePressureValue(NaN, 200, 10)).toBe(0);
    expect(coercePressureValue(Infinity, 200, 10)).toBe(0);
  });

  it('should integrate parse and clamp correctly', () => {
    expect(coercePressureValue('  155  ', 200, 10)).toBe(160);
    expect(coercePressureValue(0, 200, 10)).toBe(0);
  });
});

describe('pressureColor', () => {
  describe('metric (bar)', () => {
    it('should return red for low pressure (<= 50 bar)', () => {
      expect(pressureColor(0, 'metric')).toBe('#ef4444');
      expect(pressureColor(25, 'metric')).toBe('#ef4444');
      expect(pressureColor(50, 'metric')).toBe('#ef4444');
    });

    it('should return orange for reserve pressure (51-70 bar)', () => {
      expect(pressureColor(51, 'metric')).toBe('#f97316');
      expect(pressureColor(60, 'metric')).toBe('#f97316');
      expect(pressureColor(70, 'metric')).toBe('#f97316');
    });

    it('should return teal for safe pressure (> 70 bar)', () => {
      expect(pressureColor(71, 'metric')).toBe('#0ea5a4');
      expect(pressureColor(100, 'metric')).toBe('#0ea5a4');
      expect(pressureColor(200, 'metric')).toBe('#0ea5a4');
    });
  });

  describe('imperial (psi)', () => {
    // 50 bar = 725.19 psi, 70 bar = 1015.266 psi
    it('should return red for low pressure (<= 725 psi)', () => {
      expect(pressureColor(0, 'imperial')).toBe('#ef4444');
      expect(pressureColor(500, 'imperial')).toBe('#ef4444');
      expect(pressureColor(725, 'imperial')).toBe('#ef4444');
      expect(pressureColor(725.19, 'imperial')).toBe('#ef4444');
    });

    it('should return orange for reserve pressure (726-1015 psi)', () => {
      expect(pressureColor(726, 'imperial')).toBe('#f97316');
      expect(pressureColor(900, 'imperial')).toBe('#f97316');
      expect(pressureColor(1015, 'imperial')).toBe('#f97316');
      expect(pressureColor(1015.266, 'imperial')).toBe('#f97316');
    });

    it('should return teal for safe pressure (> 1015 psi)', () => {
      expect(pressureColor(1016, 'imperial')).toBe('#0ea5a4');
      expect(pressureColor(2000, 'imperial')).toBe('#0ea5a4');
      expect(pressureColor(3000, 'imperial')).toBe('#0ea5a4');
    });
  });

  describe('boundary values', () => {
    it('should handle exact threshold values consistently', () => {
      // Metric boundaries
      expect(pressureColor(50, 'metric')).toBe('#ef4444'); // Low boundary
      expect(pressureColor(50.01, 'metric')).toBe('#f97316'); // Just above low
      expect(pressureColor(70, 'metric')).toBe('#f97316'); // Reserve boundary
      expect(pressureColor(70.01, 'metric')).toBe('#0ea5a4'); // Just above reserve
    });
  });
});

describe('sliderTrack', () => {
  it('should generate correct gradient for 0% (empty)', () => {
    const result = sliderTrack(0, 200, 'metric');
    expect(result).toContain('#ef4444'); // Red for 0 pressure
    expect(result).toContain('0%');
    expect(result).toContain('#1f2937'); // Base color
  });

  it('should generate correct gradient for 50% fill', () => {
    const result = sliderTrack(100, 200, 'metric');
    expect(result).toContain('#0ea5a4'); // Teal for 100 bar
    expect(result).toContain('50%');
  });

  it('should generate correct gradient for 100% (full)', () => {
    const result = sliderTrack(200, 200, 'metric');
    expect(result).toContain('100%');
  });

  it('should use correct color based on pressure level', () => {
    const low = sliderTrack(40, 200, 'metric');
    expect(low).toContain('#ef4444'); // Red

    const reserve = sliderTrack(60, 200, 'metric');
    expect(reserve).toContain('#f97316'); // Orange

    const safe = sliderTrack(150, 200, 'metric');
    expect(safe).toContain('#0ea5a4'); // Teal
  });

  it('should generate valid CSS gradient format', () => {
    const result = sliderTrack(100, 200, 'metric');
    expect(result).toMatch(/^linear-gradient\(to right,/);
    expect(result).toContain('#0ea5a4');
    expect(result).toContain('#1f2937');
  });

  it('should calculate correct percentage for various values', () => {
    expect(sliderTrack(0, 200, 'metric')).toContain('0%');
    expect(sliderTrack(50, 200, 'metric')).toContain('25%');
    expect(sliderTrack(100, 200, 'metric')).toContain('50%');
    expect(sliderTrack(150, 200, 'metric')).toContain('75%');
    expect(sliderTrack(200, 200, 'metric')).toContain('100%');
  });

  it('should work with imperial units', () => {
    const result = sliderTrack(1750, 3500, 'imperial');
    expect(result).toContain('50%');
    expect(result).toContain('#0ea5a4'); // Should be safe at 1750 psi
  });
});

describe('nitroxTrack', () => {
  it('should return 0% fill for air (21% O2)', () => {
    const result = nitroxTrack(21);
    expect(result).toContain('0%');
  });

  it('should return 100% fill for pure O2 (100%)', () => {
    const result = nitroxTrack(100);
    expect(result).toContain('100%');
  });

  it('should calculate correct percentage for EAN32', () => {
    const result = nitroxTrack(32);
    // (32 - 21) / (100 - 21) = 11/79 ≈ 13.924%
    expect(result).toMatch(/13\.9\d+%/);
  });

  it('should calculate correct percentage for EAN36', () => {
    const result = nitroxTrack(36);
    // (36 - 21) / (100 - 21) = 15/79 ≈ 18.987%
    expect(result).toMatch(/18\.9\d+%/);
  });

  it('should calculate correct percentage for common mixes', () => {
    // EAN32 (common recreational)
    const ean32 = nitroxTrack(32);
    expect(ean32).toMatch(/13\.9/);

    // EAN40 (deco gas)
    const ean40 = nitroxTrack(40);
    expect(ean40).toMatch(/24\.0/);

    // EAN50 (deco gas)
    const ean50 = nitroxTrack(50);
    expect(ean50).toMatch(/36\.7/);
  });

  it('should generate valid CSS gradient format', () => {
    const result = nitroxTrack(32);
    expect(result).toMatch(/^linear-gradient\(to right,/);
    expect(result).toContain('#0ea5a4'); // Teal color
    expect(result).toContain('#1f2937'); // Base color
  });

  it('should use teal color for nitrox gradient', () => {
    const result = nitroxTrack(50);
    expect(result).toContain('#0ea5a4');
  });

  it('should handle edge cases', () => {
    // Slightly above air
    const result1 = nitroxTrack(21.1);
    expect(result1).toMatch(/0\.1\d+%/);

    // Almost pure O2
    const result2 = nitroxTrack(99);
    expect(result2).toMatch(/98\.7\d+%/);
  });
});
