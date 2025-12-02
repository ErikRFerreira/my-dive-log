import Loading from '@/components/common/Loading';
import { useUser } from '@/features/authentication';
import { Profile } from '@/features/profile';
import Certification from '@/features/profile/components/Certification';

function Account() {
  const { user, isLoading, isError } = useUser();

  if (isLoading) return <Loading />;
  if (isError || !user) return <div>Error loading user data.</div>;

  return (
    <>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Account Setting</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information and preferences
          </p>
        </div>
      </header>
      <section className="mt-8 max-w-2xl space-y-8">
        <Profile user={user} />
        <Certification />
      </section>
    </>
  );
}

export default Account;
