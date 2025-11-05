import { createBrowserRouter, Navigate } from 'react-router';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import Settings from '../pages/Settings';
import Dives from '../pages/Dives';
import Account from '../pages/Account';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/dives',
        element: <Dives />,
      },
      {
        path: 'account',
        element: <Account />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
]);

export default router;
