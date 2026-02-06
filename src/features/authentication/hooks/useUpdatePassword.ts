import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updatePassword } from '@/services/apiAuth';

export function useUpdatePassword() {
  const queryClient = useQueryClient();

  const { mutate: savePassword, isPending } = useMutation({
    mutationFn: (password: string) => updatePassword({ password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Password updated.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update password. Please try again.');
    },
  });

  return { savePassword, isPending };
}

