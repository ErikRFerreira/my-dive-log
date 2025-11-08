import { Outlet } from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';

function AppLayout() {
  return (
    <div className="grid h-screen grid-rows-[auto_1fr] grid-cols-[200px_1fr]">
      <Header />
      <Sidebar />
      <main className="col-start-2 row-start-2 p-8 space-y-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
