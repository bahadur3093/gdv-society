'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticationPortal from '@/components/organisms/AuthenticationPortal';

export default function HomePage() {
  const router = useRouter();

  // Redirect to signin page
  useEffect(() => {
    router.push('/auth/signin');
  }, [router]);

  // Render authentication portal as fallback
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <AuthenticationPortal />
    </main>
  );
}
