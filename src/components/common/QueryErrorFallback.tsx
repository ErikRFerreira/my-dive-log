import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface QueryErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

/**
 * Reusable error fallback component for failed React Query requests.
 * Displays user-friendly error message with optional retry button.
 */
function QueryErrorFallback({
  error,
  onRetry,
  title = 'Something went wrong',
  description,
}: QueryErrorFallbackProps) {
  const defaultDescription =
    'We encountered an error while loading this data. Please try again or contact support if the problem persists.';

  return (
    <div className="p-8">
      <Card className="bg-destructive/10 border-destructive">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground mb-4">{description || defaultDescription}</p>

              {onRetry && (
                <Button onClick={onRetry} variant="default" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              )}

              {import.meta.env.DEV && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <p className="text-xs font-mono text-muted-foreground mb-2">
                    Development Error Details:
                  </p>
                  <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QueryErrorFallback;
