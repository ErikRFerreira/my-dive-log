import DiveCard from '../../components/DiveCard';
import { sampleDives } from '../../mock/SampleDives';

function DiveList() {
  const styles = { display: 'grid', gap: 12 };

  return (
    <section aria-label="List of dives" style={styles} role="list">
      {sampleDives.map((dive) => (
        <DiveCard key={dive.id} dive={dive} />
      ))}
    </section>
  );
}

export default DiveList;
