import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { login as loginService } from '@/services/apiAuth';

type LoginParams = {
  email: string;
  password: string;
};

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: login, isPending: isLogingIn } = useMutation({
    mutationFn: ({ email, password }: LoginParams) => loginService({ email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Login successful!');
      // wait 1 second before redirecting
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed. Please try again.');
    },
  });

  return { login, isLogingIn };
}
