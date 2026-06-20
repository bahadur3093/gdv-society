'use client';

import { PlotData } from '@/types';
import { createContext, useContext } from 'react';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RESIDENT';
  plotNumber?: string | null;
  emailVerified: Date | string | null;
  plotData?: PlotData | null;
}

const UserContext = createContext<AppUser | null>(null);

export default function UserProvider({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): AppUser {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error(
      'useUser() called outside (authenticated) tree. ' +
      'Move component inside /resident/* or /admin/*.'
    );
  }
  return user;
}

export function useUserOptional(): AppUser | null {
  return useContext(UserContext);
}

export function useIsAdmin(): boolean {
  const user = useContext(UserContext);
  return user?.role === 'ADMIN';
}

export function usePlotData(): PlotData | null {
  const user = useContext(UserContext);
  return user?.plotData ?? null;
}