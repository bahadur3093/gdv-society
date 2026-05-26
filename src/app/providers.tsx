'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    // @ts-expect-error SessionProvider type incompatibility with React 19
    <SessionProvider>{children}</SessionProvider>
  );
}