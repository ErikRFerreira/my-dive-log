import AuthAwareRedirect from '@/components/layout/AuthAwareRedirect';
import ProtectedRoutes from '@/components/layout/ProtectedRoutes';
import PublicOnlyRoute from '@/components/layout/PublicOnlyRoute';
import AuthCallback from '@/pages/AuthCallback';
import Dive from '@/pages/Dive';
import Error from '@/pages/Error';
import ForgotPassword from '@/pages/ForgotPassword';
import Locations from '@/pages/Locations';
import LogDive from '@/pages/LogDive';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ResetPassword from '@/pages/ResetPassword';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';

import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import Dives from '../pages/Dives';
import Location from '../pages/Location';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';

const router = createBrowserRouter([
  /* Protected routes */
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
        path: '/locations',
        element: <Locations />,
      },
      {
        path: '/locations/:id',
        element: <Location />,
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
  /* Log Dive route (no AppLayout) */
  {
    path: '/log-dive',
    element: (
      <ProtectedRoutes>
        <LogDive />
      </ProtectedRoutes>
    ),
    errorElement: <Error />,
  },
  /* Public only routes */
  {
    element: (
      <PublicOnlyRoute>
        <Outlet />
      </PublicOnlyRoute>
    ),
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: '/auth/reset',
        element: <ResetPassword />,
      },
    ],
  },
  /* Auth callback route */
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  /* Fallback route */
  {
    path: '*',
    element: <AuthAwareRedirect authenticatedTo="/dashboard" unauthenticatedTo="/login" />,
  },
]);

export default router;
