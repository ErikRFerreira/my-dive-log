/**
 * Centralized schema exports for API validation and type safety.
 * Schemas are used for both form validation and API response validation.
 */

// Shared utilities
export * from './shared';

// Domain-specific schemas
export * from './dive';
export * from './location';
export * from './profile';
export * from './auth';
export * from './misc';
