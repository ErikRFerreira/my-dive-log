import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router';

import PageErrorBoundary from '@/components/common/PageErrorBoundary';
import router from './routes/routes';
import { queryClient } from './lib/queryClient';
import MissingEnvScreen from './components/layout/MissingEnvScreen';

function App() {
  const missing: string[] = [];
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    return (
      <QueryClientProvider client={queryClient}>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        <MissingEnvScreen missing={missing} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      <PageErrorBoundary>
        <RouterProvider router={router} />
      </PageErrorBoundary>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
