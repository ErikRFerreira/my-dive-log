import Loading from '@/components/common/Loading';
import QueryErrorFallback from '@/components/common/QueryErrorFallback';
import InlineError from '@/components/common/InlineError';
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
  const { dives, isLoading: isDivesLoading, error: divesError } = useGetDives({ sortBy: 'date' });

  const isDivesError = !!divesError;

  if (isLoading) return <Loading />;
  if (isError || !user)
    return (
      <QueryErrorFallback
        error={new Error('Failed to load user data')}
        title="Failed to load profile"
        description="We couldn't load your profile. Please try logging out and back in."
      />
    );
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
          <InlineError message="Failed to load dive charts. Some statistics may be unavailable." />
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
