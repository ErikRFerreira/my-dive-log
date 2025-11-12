type DepthBadgeProps = {
  depth: number;
};

function DepthBadge({ depth }: DepthBadgeProps) {
  const label = `${depth} m`;

  const getDepthStyles = (depth: number): string => {
    if (depth <= 18) {
      return 'bg-green-600 text-white';
    } else if (depth <= 40) {
      return 'bg-yellow-500 text-black';
    } else {
      return 'bg-red-600 text-white';
    }
  };

  return (
    <span
      aria-label={`Depth: ${label}`}
      className={`px-2 py-1 rounded-full text-sm font-semibold ${getDepthStyles(depth)}`}
    >
      {label}
    </span>
  );
}

export default DepthBadge;
