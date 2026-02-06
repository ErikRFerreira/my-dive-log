import QueryErrorFallback from '@/components/common/QueryErrorFallback';
import { useUser } from '@/features/authentication';
import { DangerZone, ProfileSettings, Units } from '@/features/settings';

function Settings() {
  const { user, isLoading: isUserLoading, isError: isUserError, error } = useUser();

  if (isUserError) {
    return (
      <QueryErrorFallback
        error={error as Error}
        title="Failed to Load Settings"
        description="We couldn't load your settings. Please try again."
      />
    );
  }

  return (
    <>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your application preferences</p>
        </div>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5x">
        <ProfileSettings isUserLoading={isUserLoading} user={user === undefined ? null : user} />
        <Units />
        <DangerZone />
      </section>
    </>
  );
}

export default Settings;
