import DashboardLists from '@/features/dashboard/components/DashboardLists';
import { AddDive } from '@/features/dives';

function Dashboard() {
  return (
    <>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your diving activities</p>
        </div>
        <AddDive />
      </header>

      <DashboardLists />
    </>
  );
}

export default Dashboard;
