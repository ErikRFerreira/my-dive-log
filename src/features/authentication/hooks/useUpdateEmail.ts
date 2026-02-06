import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateEmail } from '@/services/apiAuth';

export function useUpdateEmail() {
  const queryClient = useQueryClient();

  const { mutate: saveEmail, isPending } = useMutation({
    mutationFn: (email: string) => updateEmail({ email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Email update requested. Check your inbox to confirm.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update email. Please try again.');
    },
  });

  return { saveEmail, isPending };
}

