import { useUser } from '@/features/authentication';
import { Navigate } from 'react-router';
import Loading from '@/components/common/Loading';

type ProtectedRoutesProps = {
  children: React.ReactNode;
};

function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { user, isLoading } = useUser();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoutes;

