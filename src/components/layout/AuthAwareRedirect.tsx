import { useUser } from '@/features/authentication';
import { Navigate } from 'react-router';
import AuthLoading from '@/components/layout/AuthLoading';

type AuthAwareRedirectProps = {
  authenticatedTo: string;
  unauthenticatedTo: string;
};

function AuthAwareRedirect({ authenticatedTo, unauthenticatedTo }: AuthAwareRedirectProps) {
  const { user, isLoading } = useUser();
  if (isLoading) {
    return <AuthLoading />;
  }

  return <Navigate to={user ? authenticatedTo : unauthenticatedTo} replace />;
}

export default AuthAwareRedirect;

