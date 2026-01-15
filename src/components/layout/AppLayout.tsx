import { Outlet } from 'react-router';
import { AddDive } from '@/features/dives';
import Header from './Header';
import Sidebar from './Sidebar';

function AppLayout() {
  return (
    <div className="grid h-screen grid-rows-[auto_1fr] grid-cols-[300px_1fr]">
      <Header />
      <Sidebar />
      <main className="col-start-2 row-start-2 p-8 space-y-8 bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <Outlet />
      </main>
      <AddDive />
    </div>
  );
}

export default AppLayout;
