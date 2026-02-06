import type { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import QueryErrorFallback from './QueryErrorFallback';

interface PageErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

/**
 * Error boundary wrapper for page-level error handling.
 * Catches React errors and displays user-friendly fallback UI.
 */
function PageErrorBoundary({
  children,
  fallbackTitle = 'Page Error',
  fallbackDescription = 'An unexpected error occurred on this page. Please refresh or try again later.',
}: PageErrorBoundaryProps) {
  const handleReset = () => {
    // Reload the page to reset state
    window.location.reload();
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={(props) => (
        <QueryErrorFallback
          {...props}
          title={fallbackTitle}
          description={fallbackDescription}
          onRetry={handleReset}
          error={props.error instanceof Error ? props.error : new Error(String(props.error))}
        />
      )}
      onReset={handleReset}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export default PageErrorBoundary;
