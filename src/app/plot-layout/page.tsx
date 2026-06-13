'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlotLayoutMap from '@/components/templates/PlotLayoutMap';
import { Loader2 } from 'lucide-react';

export default function PlotLayoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if user is verified (for residents)
    if (session.user.role === 'RESIDENT' && !session.user.emailVerified) {
      router.push('/auth/verification-pending');
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
          <p className="text-slate-400">Loading plot layout...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = session.user.role === 'ADMIN' ? 'admin' : 'resident';

  const handleEditPlot = (plotNumber: string) => {
    if (userRole === 'admin') {
      // Navigate to admin dashboard with plot editing
      router.push(`/dashboard?screen=master-ledger&editPlot=${plotNumber}`);
    }
  };

  return (
    <PlotLayoutMap 
      userRole={userRole} 
      onEditPlot={handleEditPlot}
    />
  );
}