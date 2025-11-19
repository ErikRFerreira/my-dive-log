import Dive from '@/pages/Dive';
import Account from '../pages/Account';
import Dashboard from '../pages/Dashboard';
import Dives from '../pages/Dives';
import Settings from '../pages/Settings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Error from '@/pages/Error';

import ProtectedRoutes from '@/components/ui/ProtectedRoutes';

import { createBrowserRouter, Navigate } from 'react-router';
import AppLayout from '../components/layout/AppLayout';

const router = createBrowserRouter([
  {
    element: (
      <ProtectedRoutes>
        <AppLayout />
      </ProtectedRoutes>
    ),
    errorElement: <Error />,
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
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
