import { QueryClient } from '@tanstack/react-query';

/**
 * Standard retry configuration for React Query.
 * Implements exponential backoff with max 3 retries.
 */
export const queryRetryConfig = {
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

/**
 * Retry configuration for mutations (more conservative).
 * Single retry with 1 second delay.
 */
export const mutationRetryConfig = {
  retry: 1,
  retryDelay: 1000,
};

/**
 * Default query client configuration with error handling.
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      ...queryRetryConfig,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
    mutations: {
      ...mutationRetryConfig,
    },
  },
};

export const queryClient = new QueryClient(queryClientConfig);
