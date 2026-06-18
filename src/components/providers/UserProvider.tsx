'use client';

import { createContext, useContext } from 'react';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RESIDENT';
  plotNumber?: string | null;
  emailVerified: Date | string | null;
}

const UserContext = createContext<AppUser | null>(null);

export default function UserProvider({
  user,
  children,
}: {
  user: AppUser;  // ← Non-null now
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

/**
 * Returns user. Guaranteed non-null inside (authenticated) tree.
 * Throws if used in public routes.
 */
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

/**
 * For components shared between public and authed pages.
 */
export function useUserOptional(): AppUser | null {
  return useContext(UserContext);
}

export function useIsAdmin(): boolean {
  const user = useContext(UserContext);
  return user?.role === 'ADMIN';
}