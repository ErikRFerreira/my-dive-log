import { useUser } from '@/features/authentication';
import { Navigate } from 'react-router';

type AuthAwareRedirectProps = {
  authenticatedTo: string;
  unauthenticatedTo: string;
};

function AuthAwareRedirect({ authenticatedTo, unauthenticatedTo }: AuthAwareRedirectProps) {
  const { user, isLoading } = useUser();

  if (isLoading) return <> </>;

  return <Navigate to={user ? authenticatedTo : unauthenticatedTo} replace />;
}

export default AuthAwareRedirect;

