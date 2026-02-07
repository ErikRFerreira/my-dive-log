import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { loginWithGoogle as loginWithGoogleService } from '@/services/apiAuth';

async function preflightGoogleOAuth() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('No internet connection. Please check your network and try again.');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Authentication is not configured correctly.');
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: supabaseAnonKey },
    });

    if (!response.ok) {
      throw new Error('Authentication service is temporarily unavailable. Please try again shortly.');
    }
  } catch {
    throw new Error('Authentication service is temporarily unavailable. Please try again shortly.');
  }
}

export function useGoogleLogin() {
  const { mutate: loginWithGoogle, isPending: isGoogleLoggingIn } = useMutation({
    mutationFn: async () => {
      await preflightGoogleOAuth();
      return loginWithGoogleService();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Google sign-in failed. Please try again.');
    },
  });

  return { loginWithGoogle, isGoogleLoggingIn };
}

