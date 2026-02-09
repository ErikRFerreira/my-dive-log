import { useUser } from '@/features/authentication';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useMemo } from 'react';
import { convertValue } from '@/shared/utils/units';
import type { UnitSystem } from '@/shared/constants';
import { MIN_DEPTH_FILTER, MAX_DEPTH_FILTER } from '@/shared/constants';

/**
 * Fetches min and max depth across ALL user's dives (efficient single query)
 */
async function getDepthRange(userId: string): Promise<{ min: number; max: number } | null> {
  const { data, error } = await supabase
    .from('dives')
    .select('depth')
    .eq('user_id', userId)
    .gt('depth', 0);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const depths = data.map((d) => d.depth);
  return {
    min: Math.min(...depths),
    max: Math.max(...depths),
  };
}

/**
 * Hook to get depth range for slider bounds, converted to current unit system.
 * This fetches ALL dives (unfiltered) to get the absolute min/max depth range.
 */
export function useDepthRange(unitSystem: UnitSystem) {
  const { user } = useUser();
  const userId = user?.id;

  const { data: depthRange, isLoading } = useQuery({
    queryKey: ['depth-range', userId],
    queryFn: () => getDepthRange(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - depth range doesn't change often
  });

  const converted = useMemo(() => {
    if (!depthRange) {
      return {
        minDepth: Math.round(convertValue(MIN_DEPTH_FILTER, 'depth', unitSystem)),
        maxDepth: Math.round(convertValue(MAX_DEPTH_FILTER, 'depth', unitSystem)),
      };
    }

    // Convert from stored metric values to current unit system
    return {
      minDepth: Math.round(convertValue(depthRange.min, 'depth', unitSystem)),
      maxDepth: Math.round(convertValue(depthRange.max, 'depth', unitSystem)),
    };
  }, [depthRange, unitSystem]);

  return {
    minDepth: converted.minDepth,
    maxDepth: converted.maxDepth,
    isLoading,
  };
}
