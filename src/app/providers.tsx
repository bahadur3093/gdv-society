'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // @ts-expect-error - SessionProvider from next-auth v4 has type incompatibility with React 19
  return <SessionProvider>{children}</SessionProvider>;
}