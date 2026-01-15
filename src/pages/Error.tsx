import { useRouteError } from 'react-router';

type RouteError = {
  status?: number;
  statusText?: string;
  message?: string;
};

function Error() {
  const error = useRouteError() as RouteError | undefined;
  const title = error?.status ? `Error ${error.status}` : 'Oops!';
  const details = error?.statusText || error?.message || 'Something went wrong.';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-3">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{details}</p>
        <p className="text-sm text-muted-foreground">
          Try refreshing the page, or return to the dashboard.
        </p>
      </div>
    </div>
  );
}

export default Error;
