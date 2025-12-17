import ProtectedRoutes from '@/components/layout/ProtectedRoutes';
import Dive from '@/pages/Dive';
import Error from '@/pages/Error';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { createBrowserRouter, Navigate } from 'react-router';

import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import Dives from '../pages/Dives';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';

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
        path: '/profile',
        element: <Profile />,
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
