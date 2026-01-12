import { useUser } from '@/features/authentication';
import { Navigate } from 'react-router';
import AuthLoading from '@/components/layout/AuthLoading';

type PublicOnlyRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

function PublicOnlyRoute({ children, redirectTo = '/dashboard' }: PublicOnlyRouteProps) {
  const { user, isLoading } = useUser();
  if (isLoading) {
    return <AuthLoading />;
  }

  if (user) return <Navigate to={redirectTo} replace />;

  return children;
}

export default PublicOnlyRoute;

