import { DEFAULT_MAX_DEPTH } from '@/shared/constants';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SortBy = 'date' | 'depth' | 'duration';
interface DiveFilterState {
  showFilters: boolean;
  sortBy: SortBy;
  maxDepth: number;
  currentPage: number;
  searchQuery: string;
  locationId: string | null;
  country: string | null;
  setShowFilters: (show: boolean) => void;
  toggleShowFilters: () => void;
  setSortBy: (sortBy: SortBy) => void;
  setMaxDepth: (maxDepth: number) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setCountry: (country: string | null) => void;
  setLocationId: (locationId: string | null) => void;
  resetFilters: () => void;
}

export const DIVE_FILTER_DEFAULTS = {
  showFilters: false,
  sortBy: 'date' as SortBy,
  maxDepth: DEFAULT_MAX_DEPTH,
  currentPage: 1,
  searchQuery: '',
  locationId: null,
  country: null,
};

export const useDiveFilterStore = create<DiveFilterState>()(
  persist(
    (set) => ({
      ...DIVE_FILTER_DEFAULTS,
      setShowFilters: (showFilters) => set({ showFilters }),
      toggleShowFilters: () => set((s) => ({ showFilters: !s.showFilters })),
      setSortBy: (sortBy) => set({ sortBy, currentPage: 1 }),
      setMaxDepth: (maxDepth) => set({ maxDepth, currentPage: 1 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
      setCountry: (country) => set({ country, currentPage: 1 }),
      setLocationId: (locationId) => set({ locationId, currentPage: 1 }),
      resetFilters: () =>
        set(() => ({
          sortBy: DIVE_FILTER_DEFAULTS.sortBy,
          maxDepth: DIVE_FILTER_DEFAULTS.maxDepth,
          currentPage: DIVE_FILTER_DEFAULTS.currentPage,
          searchQuery: DIVE_FILTER_DEFAULTS.searchQuery,
          locationId: DIVE_FILTER_DEFAULTS.locationId,
          country: DIVE_FILTER_DEFAULTS.country,
        })),
    }),
    {
      name: 'dive-filter',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        sortBy: s.sortBy,
        maxDepth: s.maxDepth,
        currentPage: s.currentPage,
        searchQuery: s.searchQuery,
        locationId: s.locationId,
        country: s.country,
      }),
    }
  )
);
