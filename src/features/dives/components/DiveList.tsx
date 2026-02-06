import NoResults from '@/components/layout/NoResults';
import Pagination from '@/components/layout/Pagination';

import type { Dive } from '@/features/dives/types';
import { Link } from 'react-router';

import DiveCard from './DiveCard';
import DiveCardFull from './DiveCardFull';

type DiveListProps = {
  dives: Dive[];
  title?: string;
  hasActiveFilters?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  variant?: 'simple' | 'full';
};

function DiveList({
  dives,
  title,
  hasActiveFilters = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  variant = 'full',
}: DiveListProps) {
  if (dives.length === 0) {
    if (hasActiveFilters) {
      return (
        <NoResults>
          No dives match your current filters. Try adjusting your filters or reset them to see all
          dives.
        </NoResults>
      );
    }
    return <NoResults>No dives logged yet. Add your first dive by clicking "Add Dive"</NoResults>;
  }

  return (
    <>
      <section aria-label="List of dives" role="list">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <Link to="/dives" className="text-sm font-medium text-primary hover:underline">
              See all dives
            </Link>
          </div>
        )}
        <div
          className={variant === 'simple' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-3 gap-6'}
        >
          {dives.map((dive) =>
            variant === 'simple' ? (
              <DiveCard key={dive.id} dive={dive} />
            ) : (
              <DiveCardFull key={dive.id} dive={dive} />
            )
          )}
        </div>
      </section>
      {totalPages > 1 && onPageChange && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </>
  );
}

export default DiveList;
