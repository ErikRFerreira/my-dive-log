import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { registerWithEmail } from '@/services/apiAuth';

type RegisterParams = {
  fullName: string;
  email: string;
  password: string;
};

export function useRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: ({ email, password, fullName }: RegisterParams) =>
      registerWithEmail({ email, password, fullName }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['user'] });

      if (data.session) {
        toast.success('Account created!');
        navigate('/dashboard', { replace: true });
        return;
      }

      toast.success('Account created. Please check your email to confirm your account.');
      navigate('/login', { replace: true });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed. Please try again.');
    },
  });

  return { register, isRegistering };
}

