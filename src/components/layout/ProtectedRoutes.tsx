import { useUser } from '@/features/authentication';
import { Navigate } from 'react-router';

type ProtectedRoutesProps = {
  children: React.ReactNode;
};

function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { user, isLoading } = useUser();

  // TODO: Add a better loading state UI
  if (isLoading) {
    return <> </>;
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoutes;
