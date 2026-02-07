export type SortBy = 'date' | 'depth' | 'duration';

export type DiveFilters = {
  sortBy?: SortBy;
  maxDepth?: number;
  country?: string;
  locationId?: string;
  page?: number;
  pageSize?: number;
  searchQuery?: string;
};
