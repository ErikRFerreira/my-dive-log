import DiveCard from './DiveCard';
import { type Dive } from '@/features/dives';

type DiveListProps = {
  dives: Dive[];
};

function DiveList({ dives }: DiveListProps) {
  const styles = { display: 'grid', gap: 12 };

  if (dives.length === 0) {
    return <p>No dives logged yet. Add your first dive by clicking "Add Dive"</p>;
  }

  return (
    <section aria-label="List of dives" style={styles} role="list">
      {dives.map((dive) => (
        <DiveCard key={dive.id} dive={dive} />
      ))}
    </section>
  );
}

export default DiveList;
