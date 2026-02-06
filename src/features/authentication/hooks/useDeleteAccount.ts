import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { deleteAccount as deleteAccountService } from '@/services/apiAuth';

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: deleteAccount, isPending } = useMutation({
    mutationFn: deleteAccountService,
    onSuccess: () => {
      queryClient.clear();
      toast.success('Account deleted.');
      navigate('/login', { replace: true });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete account. Please try again.');
    },
  });

  return { deleteAccount, isPending };
}

