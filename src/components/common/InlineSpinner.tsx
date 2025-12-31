type InlineSpinnerProps = React.ComponentProps<'span'> & { size?: number };

function InlineSpinner({ size = 14, style, ...rest }: InlineSpinnerProps) {
  return (
    <span
      {...rest}
      role="status"
      aria-live="polite"
      style={{ display: 'inline-flex', marginLeft: 8, ...style }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="3"
        />
        <path d="M22 12a10 10 0 0 0-10-10" fill="none" stroke="currentColor" strokeWidth="3">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="0.6s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          border: 0,
        }}
      >
        Updating
      </span>
    </span>
  );
}

export default InlineSpinner;
