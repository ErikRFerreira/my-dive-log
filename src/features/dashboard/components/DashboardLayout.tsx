import { AddDive } from '@features/dives';
import DashboardLists from './DashboardLists';

function DashboardLayout() {
  return (
    <div>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your diving adventures</p>
        </div>
        <AddDive />
      </header>

      <DashboardLists />
    </div>
  );
}

export default DashboardLayout;
