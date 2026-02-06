import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout as logoutService } from '@/services/apiAuth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Logout failed. Please try again.');
    },
  });

  return {
    logout,
    isLoggingOut,
  };
}
