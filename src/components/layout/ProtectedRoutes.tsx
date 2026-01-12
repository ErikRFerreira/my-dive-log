import AuthLoading from '@/components/layout/AuthLoading';
import { useUser } from '@/features/authentication';
import { buildDivesQueryKey } from '@/features/dives/hooks/useGetDives';
import { getDives } from '@/services/apiDives';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';

type ProtectedRoutesProps = {
  children: React.ReactNode;
};

function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { user, isLoading } = useUser();
  const queryClient = useQueryClient();
  const [isPrefetching, setIsPrefetching] = useState(false);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setIsPrefetching(false);
      return;
    }
    // Prefetch the default dives list so the dashboard mounts with warm data.
    const filters = { sortBy: 'date' as const };
    let isActive = true;
    setIsPrefetching(true);
    queryClient
      .prefetchQuery({
        queryKey: buildDivesQueryKey(userId, filters),
        queryFn: () => getDives(filters),
      })
      .finally(() => {
        if (isActive) setIsPrefetching(false);
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
