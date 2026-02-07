import QueryErrorFallback from '@/components/common/QueryErrorFallback';
import AuthLoading from '@/components/layout/AuthLoading';
import { useUser } from '@/features/authentication';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router';

type ProtectedRoutesProps = {
  children: React.ReactNode;
};

/**
 * Guards authenticated routes and renders auth-related fallback UI.
 * Keeps users on the current route when auth cannot be verified.
 */
function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { user, isLoading, isError, error } = useUser();
  const queryClient = useQueryClient();

  // Normalize unknown query errors to a consistent Error instance for UI rendering.
  const resolvedError =
    error instanceof Error ? error : new Error('Unable to verify your session.');
  const message = resolvedError.message.toLowerCase();

  // Treat "offline" as an actual client connectivity state.
  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

  // Classify backend/auth outages separately from true offline state.
  const isServiceUnavailable =
    message.includes('project is paused') ||
    message.includes('service unavailable') ||
    message.includes('temporarily unavailable') ||
    message.includes('503') ||
    message.includes('failed to fetch') ||
    message.includes('network request failed') ||
    message.includes('fetch failed');

  // Retry only the auth identity query, avoiding a full page reload.
  const handleRetry = () => {
    void queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  // Auth status is still being resolved.
  if (isLoading) return <AuthLoading />;

  // Render explicit auth failure states instead of redirecting to login immediately.
  if (isError) {
    if (isOffline) {
      return (
        <QueryErrorFallback
          error={resolvedError}
          title="No Internet Connection"
          description="Please check your connection and try again later."
          onRetry={handleRetry}
        />
      );
    }

    if (isServiceUnavailable) {
      return (
        <QueryErrorFallback
          error={resolvedError}
          title="Service Temporarily Unavailable"
          description="Authentication service is currently unavailable. Please try again later."
          onRetry={handleRetry}
        />
      );
    }

    return (
      <QueryErrorFallback
        error={resolvedError}
        title="Authentication Error"
        description="We couldn't verify your session right now. Please try again later."
        onRetry={handleRetry}
      />
    );
  }

  // Only redirect when auth resolution succeeded and there is no authenticated user.
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoutes;
