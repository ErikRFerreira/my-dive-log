type ChipProps = {
  type: 'info' | 'warning' | 'error';
  children: React.ReactNode;
};

function Chip({ type, children }: ChipProps) {
  const styles = {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block',
    backgroundColor:
      type === 'info'
        ? '#d1ecf1'
        : type === 'warning'
          ? '#fff3cd'
          : type === 'error'
            ? '#f8d7da'
            : 'transparent',
    color:
      type === 'info'
        ? '#0c5460'
        : type === 'warning'
          ? '#856404'
          : type === 'error'
            ? '#721c24'
            : 'inherit',
  };

  return <span style={styles}>{children}</span>;
}

export default Chip;
