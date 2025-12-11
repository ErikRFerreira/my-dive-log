// src/features/dives/hooks/useGenerateSummary.ts
import { useMutation } from '@tanstack/react-query';
import type { Dive } from '../types';
import { getDiveSummaryFromAPI } from '@/services/apiAI';

type SetEditedDive = React.Dispatch<React.SetStateAction<Dive | null>>;

export function useGenerateSummary(dive: Dive, setEditedDive: SetEditedDive) {
  const { mutateAsync, isPending } = useMutation<string, Error>({
    mutationFn: () => getDiveSummaryFromAPI(dive),
    onSuccess: (summary) => {
      // update local edit state so textarea shows the AI text
      setEditedDive((prev) =>
        prev
          ? { ...prev, summary }
          : { ...dive, summary }
      );
    },
  });

  return {
    generateSummary: mutateAsync,
    isGenerating: isPending,
  };
}
