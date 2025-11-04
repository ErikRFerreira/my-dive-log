import type { Dive } from "../types/Dive"
import DepthBadge from "./DepthBadge"

type DiveCardProps = {
  dive: Dive;
}

function DiveCard({dive} : DiveCardProps) {
  const styles = {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 16,
    display: 'grid',
    gap: 8,
  }

  
  return (
    <article
      role="listitem"
      aria-label={`Dive at ${dive.location} on ${dive.date}`}
      style={styles}
      >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{dive.location}</h3>
        <DepthBadge depth={dive.depth} />
      </header>
      <p style={{ margin: 0, color: '#6b7280' }}>{new Date(dive.date).toDateString()}</p>
      <p style={{ margin: '4px 0' }}>Duration: <strong>{dive.duration} min</strong></p>
      {dive.notes && (
        <p style={{ margin: 0, color: '#374151' }}>
          <em>{dive.notes}</em>
        </p>
      )
      }
  </article>
  )
}

export default DiveCard