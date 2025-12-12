import { Card, CardContent } from '@/components/ui/card';
import DiveCard from './DiveCard';
import { type Dive } from '@/features/dives';

type DiveListProps = {
  dives: Dive[];
  title?: string;
  hasActiveFilters?: boolean;
};

function DiveList({ dives, title, hasActiveFilters = false }: DiveListProps) {
  const styles = { display: 'grid', gap: 12 };

  if (dives.length === 0) {
    if (hasActiveFilters) {
      return (
        <Card className="bg-card border-slate-200 dark:border-slate-700">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              No dives match your current filters. Try adjusting your filters or reset them to see
              all dives.
            </p>
          </CardContent>
        </Card>
      );
    }
    return <p>No dives logged yet. Add your first dive by clicking "Add Dive"</p>;
  }

  return (
    <section aria-label="List of dives" style={styles} role="list">
      {title && <h2 className="text-xl font-bold text-foreground">{title}</h2>}
      {dives.map((dive) => (
        <DiveCard key={dive.id} dive={dive} />
      ))}
    </section>
  );
}

export default DiveList;
