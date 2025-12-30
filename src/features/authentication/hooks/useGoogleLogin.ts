import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { loginWithGoogle as loginWithGoogleService } from '@/services/apiAuth';

export function useGoogleLogin() {
  const { mutate: loginWithGoogle, isPending: isGoogleLoggingIn } = useMutation({
    mutationFn: () => loginWithGoogleService(),
    onError: (error: Error) => {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google sign-in failed. Please try again.');
    },
  });

  return { loginWithGoogle, isGoogleLoggingIn };
}

