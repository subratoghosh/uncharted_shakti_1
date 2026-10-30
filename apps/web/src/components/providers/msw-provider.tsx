'use client';

import { useEffect } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    void import('../../mocks/browser').then(({ worker }) => {
      void worker.start({ onUnhandledRequest: 'bypass' });
    });
  }, []);

  return <>{children}</>;
}

