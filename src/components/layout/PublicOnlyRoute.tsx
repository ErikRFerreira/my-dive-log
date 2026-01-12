import { useUser } from '@/features/authentication';
import { Navigate } from 'react-router';
import Loading from '@/components/common/Loading';

type PublicOnlyRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

function PublicOnlyRoute({ children, redirectTo = '/dashboard' }: PublicOnlyRouteProps) {
  const { user, isLoading } = useUser();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (user) return <Navigate to={redirectTo} replace />;

  return children;
}

export default PublicOnlyRoute;

