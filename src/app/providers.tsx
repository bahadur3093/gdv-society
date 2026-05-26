'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const Provider = SessionProvider as any;
  return (
    <Provider session={null} refetchInterval={0}>
      {children}
    </Provider>
  );
}