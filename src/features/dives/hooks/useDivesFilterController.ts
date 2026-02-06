import { DEFAULT_MAX_DEPTH } from '@/shared/constants';
import { useDiveFilterStore } from '@/store/diveFilterStore';

export function useDivesFilterController() {
  const {
    showFilters,
    sortBy,
    maxDepth,
    currentPage,
    searchQuery,
    locationId,
    country,
    setSortBy,
    setMaxDepth,
    setCurrentPage,
    setSearchQuery,
    setCountry,
    setLocationId,
    resetFilters,
    toggleShowFilters,
  } = useDiveFilterStore();

  const setPageAndSortBy = (nextSortBy: typeof sortBy) => {
    setSortBy(nextSortBy);
    setCurrentPage(1);
  };

  const setPageAndMaxDepth = (nextMaxDepth: number) => {
    setMaxDepth(nextMaxDepth);
    setCurrentPage(1);
  };

  const setPageAndSearchQuery = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const setPageAndCountry = (nextCountry: string | null) => {
    setCountry(nextCountry);
    setCurrentPage(1);
    setLocationId(null);
  };

  const setPageAndLocationId = (nextLocationId: string | null) => {
    setLocationId(nextLocationId);
    setCurrentPage(1);
  };

  const handleReset = () => {
    resetFilters();
    setCurrentPage(1);
  };

  const hasActiveFilters =
    maxDepth < DEFAULT_MAX_DEPTH ||
    locationId !== null ||
    country !== null ||
    sortBy !== 'date' ||
    searchQuery.trim() !== '';

  return {
    showFilters,
    sortBy,
    maxDepth,
    currentPage,
    searchQuery,
    locationId,
    country,
    toggleShowFilters,
    setCurrentPage,
    setPageAndSortBy,
    setPageAndMaxDepth,
    setPageAndSearchQuery,
    setPageAndCountry,
    setPageAndLocationId,
    handleReset,
    hasActiveFilters,
  };
}
