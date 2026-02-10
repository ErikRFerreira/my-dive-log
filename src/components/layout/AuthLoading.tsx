import diverIcon from '@/assets/icons/diver.svg?raw';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

function AuthLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        const next = Math.min(100, current + 10);
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
      <div className="flex w-full max-w-md flex-col items-center gap-12 px-6">
        <span
          aria-hidden="true"
          className="flex h-20 w-20 items-center justify-center text-primary [&>svg]:h-12 [&>svg]:w-12"
          dangerouslySetInnerHTML={{ __html: diverIcon }}
        />
        <Progress
          value={progress}
          className="h-1 w-full shadow-[0_0_14px_hsl(var(--primary)/0.45)]"
        />
      </div>
    </div>
  );
}

export default AuthLoading;

