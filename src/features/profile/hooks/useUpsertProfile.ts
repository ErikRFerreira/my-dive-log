import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertUserProfile } from '../../../services/apiProfile';
import { useUser } from '@/features/authentication';
import type { UserProfile } from '@/features/profile';

export function useUpsertProfile() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Partial - a type representing a subset of UserProfile fields
  // e.g., { name?: string; email?: string; avatarUrl?: string }
  // This is useful for updates where not all fields are required
  const { isPending, mutate: mutateUpsert } = useMutation({
    mutationFn: (profileData: Partial<UserProfile>) => {
      if (!user?.id) {
        return Promise.reject('Missing user ID');
      }
      return upsertUserProfile(user.id, profileData);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    },
  });
  return { isPending, mutateUpsert };
}
