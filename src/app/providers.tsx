"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import StoreProvider from "@/store/StoreProvider";
import { Session } from "next-auth";
import ThemeProvider from "@/components/providers/ThemeProvider";

interface ProvidersProps {
  children: ReactNode;
  session: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <ThemeProvider>
      <StoreProvider>
        <SessionProvider
          session={session}
          refetchInterval={0}
          refetchOnWindowFocus={false}
        >
          {children}
        </SessionProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
