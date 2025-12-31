import { upsertUserProfile } from '../../../services/apiProfile';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UserProfile } from '@/features/profile';

export function useUpsertProfile(userId: string | undefined) {
  const queryClient = useQueryClient();

  // Partial - a type representing a subset of UserProfile fields
  // e.g., { name?: string; email?: string; avatarUrl?: string }
  // This is useful for updates where not all fields are required
  const { isPending, mutate: mutateUpsert } = useMutation({
    mutationFn: (profileData: Partial<UserProfile>) => {
      if (!userId) {
        return Promise.reject('Missing user ID');
      }
      return upsertUserProfile(userId, profileData);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    },
  });
  return { isPending, mutateUpsert };
}
