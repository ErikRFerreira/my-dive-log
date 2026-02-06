import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router';

import PageErrorBoundary from '@/components/common/PageErrorBoundary';
import router from './routes/routes';
import { queryClient } from './lib/queryClient';

function App() {
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
