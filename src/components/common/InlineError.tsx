import { AlertCircle } from 'lucide-react';

interface InlineErrorProps {
  message: string;
  className?: string;
}

/**
 * Compact inline error message for displaying errors within a component.
 * Used for non-critical errors that don't require full-page fallback.
 */
function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <div
      className={`flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md ${className}`}
      role="alert"
    >
      <AlertCircle className="w-4 h-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

export default InlineError;
