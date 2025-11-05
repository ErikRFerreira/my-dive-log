type DepthBadgeProps = {
  onClick: () => void;
};

function AddDiveButton({ onClick }: DepthBadgeProps) {
  const syles = {
    backgroundColor: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    padding: '10px 14px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <button type="button" aria-label="Add Dive" style={syles} onClick={onClick}>
      Add Dive +
    </button>
  );
}

export default AddDiveButton;
