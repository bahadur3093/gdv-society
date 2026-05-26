'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ScreenType, ResidentUser, PendingRegistration, ResidentRequest } from '@/types';
import { DEFAULT_PER_SQFT_RATE, DEFAULT_FIXED_BASE_AMOUNT, DEFAULT_SINKING_FUND_PERCENTAGE, SCREENS } from '@/utils';
import { getPlotByNumber } from '@/data/plots';
import ResidentWorkspace from '@/components/organisms/ResidentWorkspace';
import AdministrativeWorkspace from '@/components/organisms/AdministrativeWorkspace';
import DevSwitch from '@/components/molecules/DevSwitch';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Global Application State
  const [activeScreen, setActiveScreen] = useState<ScreenType>(SCREENS.DASHBOARD);
  const [perSqFtRate, setPerSqFtRate] = useState<number>(DEFAULT_PER_SQFT_RATE);
  const [fixedBaseAmount, setFixedBaseAmount] = useState<number>(DEFAULT_FIXED_BASE_AMOUNT);
  const [sinkingFundPercentage, setSinkingFundPercentage] = useState<number>(DEFAULT_SINKING_FUND_PERCENTAGE);
  const [currentUser, setCurrentUser] = useState<ResidentUser | undefined>(undefined);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [residentRequests, setResidentRequests] = useState<ResidentRequest[]>([]);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Initialize user data from session
  useEffect(() => {
    if (session?.user) {
      const plotData = session.user.plotNumber ? getPlotByNumber(session.user.plotNumber) : undefined;
      setCurrentUser({
        id: session.user.id,
        fullName: session.user.name,
        email: session.user.email,
        plotNumber: session.user.plotNumber || '',
        plotData,
      });

      // Set initial screen based on role
      if (session.user.role === 'ADMIN') {
        setActiveScreen(SCREENS.MASTER_LEDGER);
      } else {
        setActiveScreen(SCREENS.DASHBOARD);
      }
    }
  }, [session]);

  // Approve Registration Handler (Admin)
  const handleApproveRegistration = useCallback((registrationId: string) => {
    setPendingRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
  }, []);

  // Decline Registration Handler (Admin)
  const handleDeclineRegistration = useCallback((registrationId: string) => {
    setPendingRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
  }, []);

  // Submit Request Handler (Resident)
  const handleSubmitRequest = useCallback((requestData: Omit<ResidentRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: ResidentRequest = {
      ...requestData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'PENDING',
    };
    setResidentRequests(prev => [...prev, newRequest]);
    alert('Request submitted successfully! The admin will review it shortly.');
  }, []);

  // Approve Request Handler (Admin)
  const handleApproveRequest = useCallback((requestId: string, adminNotes?: string) => {
    setResidentRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'APPROVED' as const, adminNotes, updatedAt: new Date().toISOString() }
        : req
    ));
  }, []);

  // Reject Request Handler (Admin)
  const handleRejectRequest = useCallback((requestId: string, adminNotes?: string) => {
    setResidentRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'REJECTED' as const, adminNotes, updatedAt: new Date().toISOString() }
        : req
    ));
  }, []);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  const isAdmin = session.user.role === 'ADMIN';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out">
      {isAdmin ? (
        <AdministrativeWorkspace
          activeScreen={activeScreen}
          onScreenChange={setActiveScreen}
          perSqFtRate={perSqFtRate}
          fixedBaseAmount={fixedBaseAmount}
          sinkingFundPercentage={sinkingFundPercentage}
          onUpdatePerSqFtRate={setPerSqFtRate}
          onUpdateFixedBase={setFixedBaseAmount}
          onUpdateSinkingFund={setSinkingFundPercentage}
          pendingRegistrations={pendingRegistrations}
          onApproveRegistration={handleApproveRegistration}
          onDeclineRegistration={handleDeclineRegistration}
          requests={residentRequests}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
        />
      ) : (
        <ResidentWorkspace
          activeScreen={activeScreen}
          onScreenChange={setActiveScreen}
          currentUser={currentUser}
          perSqFtRate={perSqFtRate}
          fixedBaseAmount={fixedBaseAmount}
          requests={residentRequests}
          onSubmitRequest={handleSubmitRequest}
        />
      )}
    </main>
  );
}
