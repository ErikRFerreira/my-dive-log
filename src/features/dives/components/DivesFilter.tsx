import { useEffect, useId, useState } from 'react';
import { DIVE_FILTER_DEFAULTS } from '@/store/diveFilterStore';

type SortBy = 'date' | 'depth' | 'duration';
type DivesFilterValue = {
  sortBy: SortBy;
  maxDepth: number; // meters
};

type DivesFilterProps = {
  onChange?: (value: DivesFilterValue) => void;
  defaultSort: SortBy;
  defaultMaxDepth: number;
};

function DivesFilter({ onChange, defaultSort, defaultMaxDepth }: DivesFilterProps) {
  const [sortBy, setSortBy] = useState<SortBy>(defaultSort);
  const [maxDepth, setMaxDepth] = useState<number>(defaultMaxDepth);

  useEffect(() => {
    onChange?.({ sortBy, maxDepth });
  }, [sortBy, maxDepth, onChange]);

  const sortId = useId();
  const depthId = useId();

  const styles = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    marginTop: '16px',
  };

  const handleReset = () => {
    setSortBy(DIVE_FILTER_DEFAULTS.sortBy);
    setMaxDepth(DIVE_FILTER_DEFAULTS.maxDepth);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} style={styles}>
      <div>
        <label htmlFor={sortId}>Sort by</label>
        <select id={sortId} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
          <option value="date">Date (Newest)</option>
          <option value="depth">Depth (Deepest)</option>
          <option value="duration">Duration (longest)</option>
        </select>
      </div>

      <div>
        <label htmlFor={depthId}>Max depth: {maxDepth} m</label>
        <input
          id={depthId}
          type="range"
          min={0}
          max={150}
          step={1}
          value={maxDepth}
          onChange={(e) => setMaxDepth(Number(e.target.value))}
        />
      </div>

      <button
        type="button"
        onClick={handleReset}
        disabled={
          sortBy === DIVE_FILTER_DEFAULTS.sortBy && maxDepth === DIVE_FILTER_DEFAULTS.maxDepth
        }
      >
        Reset filters
      </button>
    </form>
  );
}

export default DivesFilter;
