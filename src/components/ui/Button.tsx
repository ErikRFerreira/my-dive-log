type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

// TODO: multiple button variants (primary, secondary, etc.)

function Button({ children, type = 'button', ...rest }: ButtonProps) {
  const styles = {
    padding: '8px 16px',
    backgroundColor: '#c5fffb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  return (
    <button type={type} style={styles} {...rest}>
      {children}
    </button>
  );
}

export default Button;
