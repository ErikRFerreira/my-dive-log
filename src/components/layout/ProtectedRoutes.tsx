import AuthLoading from '@/components/layout/AuthLoading';
import { useUser } from '@/features/authentication';
import { buildDivesQueryKey } from '@/features/dives/hooks/useGetDives';
import { getDives } from '@/services/apiDives';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router';

type ProtectedRoutesProps = {
  children: React.ReactNode;
};

function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { user, isLoading } = useUser();
  const queryClient = useQueryClient();
  const [isPrefetching, setIsPrefetching] = useState(false);
  const prefetchStartRef = useRef<number | null>(null);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setIsPrefetching(false);
      return;
    }
    // Prefetch the default dives list so the dashboard mounts with warm data.
    const filters = { sortBy: 'date' as const };
    let isActive = true;
    // Start prefetch and record start time to ensure a minimum loader duration.
    setIsPrefetching(true);
    prefetchStartRef.current = Date.now();
    queryClient
      .prefetchQuery({
        queryKey: buildDivesQueryKey(userId, filters),
        queryFn: () => getDives(filters),
      })
      .finally(() => {
        if (!isActive) return;
        // Hold the loading screen until the progress bar has time to reach 100%.
        const minMs = 1500; // Minimum loading screen duration
        const elapsed = prefetchStartRef.current ? Date.now() - prefetchStartRef.current : 0;
        const remaining = Math.max(0, minMs - elapsed);
        setTimeout(() => {
          if (isActive) setIsPrefetching(false);
        }, remaining);
      });

    return () => {
      isActive = false;
    };
  }, [queryClient, user?.id]);

  if (isLoading || isPrefetching) {
    // Hold the gate until auth and initial dives prefetch complete.
    return <AuthLoading />;
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoutes;
