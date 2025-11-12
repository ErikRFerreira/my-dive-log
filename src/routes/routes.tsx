import Dive from '@/pages/Dive';
import { createBrowserRouter, Navigate } from 'react-router';

import AppLayout from '../components/layout/AppLayout';
import Account from '../pages/Account';
import Dashboard from '../pages/Dashboard';
import Dives from '../pages/Dives';
import Settings from '../pages/Settings';

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
        path: '/dives/:id',
        element: <Dive />,
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
