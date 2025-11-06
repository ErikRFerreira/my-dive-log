type ErrorProps = {
  children: React.ReactNode;
};

function ErrorMessage({ children }: ErrorProps) {
  return (
    <div role="status">
      <h2>{children}</h2>
    </div>
  );
}

export default ErrorMessage;
