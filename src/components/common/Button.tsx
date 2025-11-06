type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

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
