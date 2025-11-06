import { AddDive } from '@features/dives';
import DashboardLists from './DashboardLists';

function DashboardLayout() {
  return (
    <div>
      <header>
        <h1>Dashboard</h1>
        <AddDive />
      </header>
      <DashboardLists />
    </div>
  );
}

export default DashboardLayout;
