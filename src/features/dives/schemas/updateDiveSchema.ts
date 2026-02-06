import { z } from 'zod';
import type { UnitSystem } from '@/shared/constants';
import {
  visibilitySchema,
  currentsSchema,
  diveTypeSchema,
  waterTypeSchema,
  exposureSchema,
  gasSchema,
  emptyStringToNull,
  numberOrNull,
  isoDateSchema,
  stringArrayOrNull,
  DEPTH_LIMITS,
  WATER_TEMP_LIMITS,
  DURATION_LIMIT,
  TAG_LIST_LIMIT,
  TAG_ITEM_LIMIT,
  NITROX_CONFIG,
} from '@/lib/schemas/shared';

export const createUpdateDiveSchema = (unitSystem: UnitSystem = 'metric') => {
  return z
    .object({
      date: isoDateSchema,
      location: z.string().trim().min(2, 'Location is required'),
      country: emptyStringToNull,
      country_code: emptyStringToNull,
      depth: z.number().min(0, 'Depth must be 0 or greater'),
      duration: z
        .number()
        .min(1, 'Duration must be at least 1 minute')
        .max(DURATION_LIMIT, `Duration must be ${DURATION_LIMIT} minutes or less`),
      notes: emptyStringToNull,
      summary: emptyStringToNull,
      water_temp: numberOrNull,
      visibility: visibilitySchema.nullable(),
      start_pressure: numberOrNull,
      end_pressure: numberOrNull,
      air_usage: numberOrNull,
      equipment: stringArrayOrNull(TAG_LIST_LIMIT, TAG_ITEM_LIMIT),
      wildlife: stringArrayOrNull(TAG_LIST_LIMIT, TAG_ITEM_LIMIT),
      dive_type: diveTypeSchema.nullable(),
      water_type: waterTypeSchema.nullable(),
      exposure: exposureSchema.nullable(),
      gas: gasSchema.nullable(),
      currents: currentsSchema.nullable(),
      weight: numberOrNull,
      nitrox_percent: z
        .number()
        .min(NITROX_CONFIG.MIN_O2_PERCENT)
        .max(NITROX_CONFIG.MAX_O2_PERCENT)
        .optional(),
    })
    .superRefine((data, ctx) => {
      // Unit-aware depth validation
      const depthLimit = unitSystem === 'imperial' ? DEPTH_LIMITS.imperial : DEPTH_LIMITS.metric;
      if (data.depth > depthLimit.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['depth'],
          message: `Depth must be ${depthLimit.max} ${unitSystem === 'imperial' ? 'ft' : 'm'} or less`,
        });
      }

      // Unit-aware water temperature validation
      if (data.water_temp !== null) {
        const tempLimits =
          unitSystem === 'imperial' ? WATER_TEMP_LIMITS.imperial : WATER_TEMP_LIMITS.metric;
        if (data.water_temp < tempLimits.min || data.water_temp > tempLimits.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['water_temp'],
            message: `Water temperature must be between ${tempLimits.min} and ${tempLimits.max} ${unitSystem === 'imperial' ? '°F' : '°C'}`,
          });
        }
      }

      // Nitrox validation: require nitrox_percent if gas is nitrox
      if (data.gas === 'nitrox') {
        if (!data.nitrox_percent) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['nitrox_percent'],
            message: 'Nitrox percentage is required when using nitrox',
          });
        }
      }

      // Pressure validation: end_pressure must be less than start_pressure
      if (data.start_pressure !== null && data.end_pressure !== null) {
        if (data.end_pressure >= data.start_pressure) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['end_pressure'],
            message: 'Ending pressure must be less than starting pressure',
          });
        }
      }
    });
};

// Export default schema for backwards compatibility
export const updateDiveSchema = createUpdateDiveSchema('metric');

// Infer types from schema for type safety
export type UpdateDiveInput = z.infer<ReturnType<typeof createUpdateDiveSchema>>;
