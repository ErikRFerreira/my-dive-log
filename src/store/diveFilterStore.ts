import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SortBy = 'date' | 'depth' | 'duration';

interface DiveFilterState {
  showFilters: boolean;
  sortBy: SortBy;
  maxDepth: number;
  setShowFilters: (show: boolean) => void;
  toggleShowFilters: () => void;
  setSortBy: (sortBy: SortBy) => void;
  setMaxDepth: (maxDepth: number) => void;
  resetFilters: () => void;
}

export const DIVE_FILTER_DEFAULTS = {
  showFilters: false,
  sortBy: 'date' as SortBy,
  maxDepth: 150,
};

export const useDiveFilterStore = create<DiveFilterState>()(
  persist(
    (set) => ({
      ...DIVE_FILTER_DEFAULTS,
      setShowFilters: (showFilters) => set({ showFilters }),
      toggleShowFilters: () => set((s) => ({ showFilters: !s.showFilters })),
      setSortBy: (sortBy) => set({ sortBy }),
      setMaxDepth: (maxDepth) => set({ maxDepth }),
      resetFilters: () =>
        set(() => ({
          sortBy: DIVE_FILTER_DEFAULTS.sortBy,
          maxDepth: DIVE_FILTER_DEFAULTS.maxDepth,
        })),
    }),
    {
      name: 'dive-filter',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Keep panel visibility ephemeral; persist only user-facing filters
      partialize: (s) => ({ sortBy: s.sortBy, maxDepth: s.maxDepth, showFilters: s.showFilters }),
    }
  )
);
