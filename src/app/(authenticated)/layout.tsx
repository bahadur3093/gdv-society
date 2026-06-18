// app/(authenticated)/layout.tsx — SERVER COMPONENT

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import UserProvider, { type AppUser } from '@/components/providers/UserProvider';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // 🔑 If somehow middleware missed this, redirect now
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  // 🔑 Normalize session → AppUser once, here
  const user: AppUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    plotNumber: session.user.plotNumber,
    emailVerified: session.user.emailVerified || null,
  };

  return <UserProvider user={user}>{children}</UserProvider>;
}