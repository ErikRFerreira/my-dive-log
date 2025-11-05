import { AddDiveButton } from '@features/dives';
import DashboardLists from './DashboardLists';

function DashboardLayout() {
  return (
    <div>
      <header>
        <h1>Dashboard</h1>
        <AddDiveButton onClick={() => alert('Add dive (wire up in Week 7)')} />
      </header>
      <DashboardLists />
    </div>
  );
}

export default DashboardLayout;
