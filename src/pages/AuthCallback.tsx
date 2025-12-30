import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/services/supabase';

function AuthCallback() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    async function finishOAuth() {
      try {
        const url = new URL(window.location.href);
        const errorDescription = url.searchParams.get('error_description');
        const code = url.searchParams.get('code');

        if (errorDescription) {
          toast.error(errorDescription);
          navigate('/login', { replace: true });
          return;
        }

        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        await queryClient.invalidateQueries({ queryKey: ['user'] });

        const { data } = await supabase.auth.getSession();
        navigate(data.session ? '/dashboard' : '/login', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Sign-in failed. Please try again.');
        navigate('/login', { replace: true });
      }
    }

    finishOAuth();
  }, [navigate, queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="text-slate-700 dark:text-slate-200">Signing you in…</div>
    </div>
  );
}

export default AuthCallback;
