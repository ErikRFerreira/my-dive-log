import { useEffect } from 'react';
import toast from 'react-hot-toast';
import type { FallbackProps } from 'react-error-boundary';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

/**
 * Error boundary fallback component for dive editing errors.
 * Displays user-friendly error message and provides exit button.
 * Shows error details in development mode only.
 */
function EditErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  useEffect(() => {
    toast.error('An unexpected error occurred. Your changes were not saved.');
  }, []);

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <div className="p-8">
      <Card className="bg-destructive/10 border-destructive">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Something went wrong while editing this dive
              </h3>
              <p className="text-muted-foreground mb-4">
                An unexpected error occurred. Your changes were not saved. Please try again or
                contact support if the problem persists.
              </p>
              <Button onClick={resetErrorBoundary} variant="default">
                Exit Edit Mode
              </Button>
              {import.meta.env.DEV && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <p className="text-xs font-mono text-muted-foreground mb-2">
                    Development Error Details:
                  </p>
                  <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                    {errorMessage}
                    {errorStack && '\n\n'}
                    {errorStack}
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

export default EditErrorFallback;
