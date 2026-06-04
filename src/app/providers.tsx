'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';
import StoreProvider from '@/store/StoreProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StoreProvider>
      <SessionProvider 
        refetchInterval={0} 
        refetchOnWindowFocus={false}
      >
        {children}
      </SessionProvider>
    </StoreProvider>
  );
}