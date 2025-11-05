type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
};

function StatCard({ title, value, subtitle }: StatCardProps) {
  const styles = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
  };

  return (
    <article style={styles}>
      <h2>{title}</h2>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</p>
      {subtitle && <p style={{ color: '#666' }}>{subtitle}</p>}
    </article>
  );
}

export default StatCard;
