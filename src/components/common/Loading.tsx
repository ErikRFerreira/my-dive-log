function Loading() {
  const size = 32;
  const color = '#3b82f6';
  const strokeWidth = 4;
  const viewBoxSize = 50;
  const radius = 20;

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        aria-hidden="true"
      >
        <circle cx="25" cy="25" r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none" />
        <g>
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray="100 140"
            strokeDashoffset="0"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="0.9s"
            repeatCount="indefinite"
          />
        </g>
      </svg>
    </div>
  );
}

export default Loading;
