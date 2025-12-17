import Loading from '@/components/common/Loading';
import { useUser } from '@/features/authentication';
import { CarrerStatistics, DiveMilestones, ProfileInformation } from '@/features/profile';
import Certification from '@/features/profile/components/Certification';

function Profile() {
  const { user, isLoading, isError } = useUser();

  if (isLoading) return <Loading />;
  if (isError || !user) return <div>Error loading user data.</div>;

  return (
    <>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Your diving profile and achievements</p>
        </div>
      </header>
      <section className="mt-8 max-w-7xl space-y-8">
        <CarrerStatistics />
        <DiveMilestones />
        <ProfileInformation user={user} />
        <Certification />
      </section>
    </>
  );
}

export default Profile;
