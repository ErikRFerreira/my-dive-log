import { supabase } from '@/services/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

function AuthCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function finishOAuth() {
      try {
        const url = new URL(window.location.href);
        const errorDescription = url.searchParams.get('error_description');
        const code = url.searchParams.get('code');

        if (errorDescription) {
          setErrorMessage(errorDescription);
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        await queryClient.invalidateQueries({ queryKey: ['user'] });

        const { data } = await supabase.auth.getSession();
        navigate(data.session ? '/dashboard' : '/login', { replace: true });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Sign-in failed. Please try again.';
        setErrorMessage(message);
      }
    }

    void finishOAuth();
  }, [navigate, queryClient]);

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border bg-slate-800 p-6 space-y-4">
          <h1 className="text-lg font-semibold">Unable to complete sign-in</h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="h-10 px-4 rounded-md border text-sm font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">Completing sign-in...</p>
    </div>
  );
}

export default AuthCallback;

