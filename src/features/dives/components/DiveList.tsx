import DiveCard from './DiveCard';
import { type Dive } from '@/features/dives';

type DiveListProps = {
  dives: Dive[];
};

function DiveList({ dives }: DiveListProps) {
  const styles = { display: 'grid', gap: 12 };

  return (
    <section aria-label="List of dives" style={styles} role="list">
      {dives.map((dive) => (
        <DiveCard key={dive.id} dive={dive} />
      ))}
    </section>
  );
}

export default DiveList;
