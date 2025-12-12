import DiveCard from './DiveCard';
import { type Dive } from '@/features/dives';
import NoResults from '@/components/layout/NoResults';
import Pagination from '@/components/layout/Pagination';

type DiveListProps = {
  dives: Dive[];
  title?: string;
  hasActiveFilters?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
};

function DiveList({
  dives,
  title,
  hasActiveFilters = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: DiveListProps) {
  // Remove local pagination logic - now handled by parent
  //const totalPages = Math.ceil(dives.length / itemsPerPage);

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
      <section aria-label="List of dives" role="list" className="space-y-4">
        {title && <h2 className="text-xl font-bold text-foreground">{title}</h2>}
        {dives.map((dive) => (
          <DiveCard key={dive.id} dive={dive} />
        ))}
      </section>
      {totalPages > 1 && onPageChange && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </>
  );
}

export default DiveList;
