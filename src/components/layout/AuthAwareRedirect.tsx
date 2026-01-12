import { useUser } from '@/features/authentication';
import { Navigate } from 'react-router';
import Loading from '@/components/common/Loading';

type AuthAwareRedirectProps = {
  authenticatedTo: string;
  unauthenticatedTo: string;
};

function AuthAwareRedirect({ authenticatedTo, unauthenticatedTo }: AuthAwareRedirectProps) {
  const { user, isLoading } = useUser();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return <Navigate to={user ? authenticatedTo : unauthenticatedTo} replace />;
}

export default AuthAwareRedirect;

