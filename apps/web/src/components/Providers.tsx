'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { PageCacheProvider } from './common/PageCache';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: 1,
            staleTime: 1000 * 60 * 10, // 10 minutes: fast instantaneous navigation
            gcTime: 1000 * 60 * 60,    // 1 hour memory persistence for already loaded views
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <PageCacheProvider>{children}</PageCacheProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
