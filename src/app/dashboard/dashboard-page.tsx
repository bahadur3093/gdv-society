'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ScreenType, ResidentUser, PendingRegistration, ResidentRequest, RequestStatus } from '@/types';
import { DEFAULT_PER_SQFT_RATE, DEFAULT_SINKING_FUND_PERCENTAGE, SCREENS } from '@/utils';
import { getPlotByNumber } from '@/data/plots';
import ResidentWorkspace from '@/components/organisms/ResidentWorkspace';
import AdministrativeWorkspace from '@/components/organisms/AdministrativeWorkspace';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSocietySettings, selectSocietySettings, selectSocietySettingsLoading } from '@/store/slices/societySettingsSlice';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redux hooks
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSocietySettings);
  const isLoadingSettings = useAppSelector(selectSocietySettingsLoading);

  // Global Application State
  const [activeScreen, setActiveScreen] = useState<ScreenType>(SCREENS.DASHBOARD);
  const [currentUser, setCurrentUser] = useState<ResidentUser | undefined>(undefined);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [residentRequests, setResidentRequests] = useState<ResidentRequest[]>([]);
  
  // Get society settings from Redux store with fallback to defaults
  const perSqFtRate = settings?.perSqFtRate ?? DEFAULT_PER_SQFT_RATE;
  const sinkingFundPercentage = settings?.sinkingFundPercentage ?? DEFAULT_SINKING_FUND_PERCENTAGE;
  const totalVillas = settings?.totalVillas ?? 47;

  // Fetch society settings from Redux store on mount
  useEffect(() => {
    dispatch(fetchSocietySettings());
  }, [dispatch]);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Initialize user data from session
  useEffect(() => {
    if (!session?.user) {
      console.warn('[Dashboard] No session.user found');
      return;
    }

    console.log('[Dashboard] Initializing user from session:', {
      userId: session.user.id,
      role: session.user.role,
      plotNumber: session.user.plotNumber,
    });
    
    const plotData = session.user.plotNumber ? getPlotByNumber(session.user.plotNumber) : undefined;
    
    console.log('[Dashboard] Plot data lookup result:', {
      plotNumber: session.user.plotNumber,
      foundPlotData: !!plotData,
      plotData: plotData ? { villaNo: plotData.villaNo, areaInSqFt: plotData.areaInSqFt } : null,
    });
    
    const userData = {
      id: session.user.id,
      fullName: session.user.name,
      email: session.user.email,
      plotNumber: session.user.plotNumber || '',
      plotData,
    };

    const initialScreen = session.user.role === 'ADMIN' ? SCREENS.MASTER_LEDGER : SCREENS.DASHBOARD;
    
    console.log(`[Dashboard] Setting ${session.user.role === 'ADMIN' ? 'admin' : 'resident'} screen:`, initialScreen);
    
    // Use startTransition to avoid cascading renders warning
    Promise.resolve().then(() => {
      setCurrentUser(userData);
      setActiveScreen(initialScreen);
    });
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
    setResidentRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'RESOLVED' as RequestStatus,
          adminNotes,
          updatedAt: new Date().toISOString(),
          resolvedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  }, []);

  // Reject Request Handler (Admin)
  const handleRejectRequest = useCallback((requestId: string, adminNotes?: string) => {
    setResidentRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'REJECTED' as RequestStatus,
          adminNotes,
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  }, []);

  // Update Society Settings Handler (Admin) - These are now no-op since SocietyFinancialSettings component handles updates via Redux
  const handleUpdatePerSqFtRate = useCallback(async (rate: number) => {
    // This is now handled by SocietyFinancialSettings component via Redux
    console.log('[Dashboard] Per sq.ft rate update delegated to SocietyFinancialSettings component');
  }, []);

  const handleUpdateSinkingFund = useCallback(async (percentage: number) => {
    // This is now handled by SocietyFinancialSettings component via Redux
    console.log('[Dashboard] Sinking fund percentage update delegated to SocietyFinancialSettings component');
  }, []);

  const handleUpdateTotalVillas = useCallback(async (total: number) => {
    // This is now handled by SocietyFinancialSettings component via Redux
    console.log('[Dashboard] Total villas update delegated to SocietyFinancialSettings component');
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
  if (!session || !session.user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Session not found. Redirecting...</p>
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const isAdmin = session.user.role === 'ADMIN';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out">
      {isAdmin ? (
        <AdministrativeWorkspace
          activeScreen={activeScreen}
          onScreenChange={setActiveScreen}
          perSqFtRate={perSqFtRate}
          sinkingFundPercentage={sinkingFundPercentage}
          totalVillas={totalVillas}
          onUpdatePerSqFtRate={handleUpdatePerSqFtRate}
          onUpdateSinkingFund={handleUpdateSinkingFund}
          onUpdateTotalVillas={handleUpdateTotalVillas}
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
          requests={residentRequests}
          onSubmitRequest={handleSubmitRequest}
        />
      )}
    </main>
  );
}
