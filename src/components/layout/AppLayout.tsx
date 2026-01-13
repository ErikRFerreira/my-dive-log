import { Outlet } from 'react-router';
import { AddDive } from '@/features/dives';
import Header from './Header';
import Sidebar from './Sidebar';

function AppLayout() {
  return (
    <div className="grid h-screen grid-rows-[auto_1fr] grid-cols-[300px_1fr]">
      <Header />
      <Sidebar />
      <main className="col-start-2 row-start-2 p-8 space-y-8">
        <Outlet />
      </main>
      <AddDive />
    </div>
  );
}

export default AppLayout;
