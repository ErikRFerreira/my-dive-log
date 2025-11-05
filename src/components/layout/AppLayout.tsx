import { Outlet } from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';

function AppLayout() {
  const layoutStyles = {
    display: 'grid',
    height: '100vh',
    gridTemplateRows: 'auto 1fr',
    gridTemplateColumns: '200px 1fr',
    gridTemplateAreas: `
      "sidebar header"
      "sidebar main"
    `,
  };

  const mainStyles = {
    gridArea: 'main',
    padding: '4rem 4.8rem 6.4rem',
    backgroundColor: '#f8f9fa',
  };

  return (
    <div style={layoutStyles}>
      <div style={{ gridArea: 'header', backgroundColor: '#e9ecef' }}>
        <Header />
      </div>
      <div style={{ gridArea: 'sidebar', backgroundColor: '#dee2e6' }}>
        <Sidebar />
      </div>
      <main style={mainStyles}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
