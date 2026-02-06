import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import AddDive from '@/features/dives/components/AddDive';
import Header from './Header';
import Sidebar from './Sidebar';

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname, location.search, location.hash]);

  return (
    <div className="relative grid h-screen grid-rows-[auto_1fr] grid-cols-1 min-[992px]:grid-cols-[300px_1fr]">
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 min-[992px]:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <main className="col-start-1 row-start-2 min-[992px]:col-start-2 p-8 max-[991px]:p-4 space-y-8 bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <Outlet />
      </main>
      <AddDive />
    </div>
  );
}

export default AppLayout;
