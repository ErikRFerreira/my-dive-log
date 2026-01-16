import Loading from '@/components/common/Loading';
import { useUser } from '@/features/authentication';
import { useGetDives } from '@/features/dives';
import DepthChart from '@/features/dashboard/components/DepthChart';
import DurationChart from '@/features/dashboard/components/DurationChart';
import { CarrerStatistics, ProfileInformation } from '@/features/profile';
import Certification from '@/features/profile/components/Certification';
import { useGetProfile } from '@/features/profile/hooks/useGetProfile';
import { useUpsertProfile } from '@/features/profile/hooks/useUpsertProfile';

function Profile() {
  const { user, isLoading, isError } = useUser();
  const { profile, isLoading: isProfileLoading } = useGetProfile(user?.id);
  const { isPending: isUpdatingProfile, mutateUpsert } = useUpsertProfile(user?.id);
  const {
    dives,
    isLoading: isDivesLoading,
    isError: isDivesError,
  } = useGetDives({ sortBy: 'date' });

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
      <section className="mt-8 space-y-8">
        {/* Career Statistics Section */}
        <CarrerStatistics />

        {isDivesLoading ? (
          <Loading />
        ) : isDivesError ? (
          <div className="text-sm text-muted-foreground">Failed to load dive charts.</div>
        ) : dives && dives.length > 1 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepthChart dives={dives} />
            <DurationChart dives={dives} />
          </div>
        ) : null}

        {/* Profile Information and Certification Sections */}
        <ProfileInformation
          user={user}
          profile={profile}
          isLoading={isProfileLoading}
          isSaving={isUpdatingProfile}
          onUpsert={mutateUpsert}
        />

        {/* Certification Section */}
        <Certification
          profile={profile}
          isLoading={isProfileLoading}
          isSaving={isUpdatingProfile}
          onUpsert={mutateUpsert}
        />
      </section>
    </>
  );
}

export default Profile;
