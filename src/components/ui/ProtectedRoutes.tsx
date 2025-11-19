import { useUser } from '@/features/authentication';
import { Navigate } from 'react-router';
import Loading from '../common/Loading';

type ProtectedRoutesProps = {
  children: React.ReactNode;
};

function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { user, isLoading } = useUser();

  console.log('Authenticated user:', user);

  if (isLoading) {
    return <Loading />;
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoutes;
