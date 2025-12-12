import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_MAX_DEPTH } from '@/shared/constants';

export type SortBy = 'date' | 'depth' | 'duration';

interface DiveFilterState {
  showFilters: boolean;
  sortBy: SortBy;
  maxDepth: number;
  currentPage: number;
  setShowFilters: (show: boolean) => void;
  toggleShowFilters: () => void;
  setSortBy: (sortBy: SortBy) => void;
  setMaxDepth: (maxDepth: number) => void;
  setCurrentPage: (page: number) => void;
  resetFilters: () => void;
}

export const DIVE_FILTER_DEFAULTS = {
  showFilters: false,
  sortBy: 'date' as SortBy,
  maxDepth: DEFAULT_MAX_DEPTH,
  currentPage: 1,
};

export const useDiveFilterStore = create<DiveFilterState>()(
  persist(
    (set) => ({
      ...DIVE_FILTER_DEFAULTS,
      setShowFilters: (showFilters) => set({ showFilters }),
      toggleShowFilters: () => set((s) => ({ showFilters: !s.showFilters })),
      setSortBy: (sortBy) => set({ sortBy }),
      setMaxDepth: (maxDepth) => set({ maxDepth }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      resetFilters: () =>
        set(() => ({
          sortBy: DIVE_FILTER_DEFAULTS.sortBy,
          maxDepth: DIVE_FILTER_DEFAULTS.maxDepth,
          currentPage: DIVE_FILTER_DEFAULTS.currentPage,
        })),
    }),
    {
      name: 'dive-filter',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Keep panel visibility ephemeral; persist only user-facing filters
      partialize: (s) => ({ sortBy: s.sortBy, maxDepth: s.maxDepth, showFilters: s.showFilters, currentPage: s.currentPage }),
    }
  )
);
