"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ScreenType, ResidentUser } from "@/types";
import { DEFAULT_PER_SQFT_RATE, SCREENS } from "@/utils";
import { getPlotByNumber } from "@/data/plots";
import ResidentWorkspace from "@/components/organisms/ResidentWorkspace";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSocietySettings,
  selectSocietySettings,
} from "@/store/slices/societySettingsSlice";
import ToastModal, {
  ToastState,
  closedToast,
} from "@/components/molecules/ToastModal";

export default function ResidentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redux hooks
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSocietySettings);

  // Global Application State
  const [activeScreen, setActiveScreen] = useState<ScreenType>(
    SCREENS.DASHBOARD,
  );
  const [currentUser, setCurrentUser] = useState<ResidentUser | undefined>(
    undefined,
  );
  const [toast, setToast] = useState<ToastState>(closedToast());

  // Get society settings from Redux store with fallback to defaults
  const perSqFtRate = settings?.perSqFtRate ?? DEFAULT_PER_SQFT_RATE;

  // Fetch society settings from Redux store on mount
  useEffect(() => {
    dispatch(fetchSocietySettings());
  }, [dispatch]);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Initialize user data from session
  useEffect(() => {
    if (!session?.user) {
      console.warn("[Dashboard] No session.user found");
      return;
    }

    console.log("[Dashboard] Initializing user from session:", {
      userId: session.user.id,
      role: session.user.role,
      plotNumber: session.user.plotNumber,
    });

    const plotData = session.user.plotNumber
      ? getPlotByNumber(session.user.plotNumber)
      : undefined;

    console.log("[Dashboard] Plot data lookup result:", {
      plotNumber: session.user.plotNumber,
      foundPlotData: !!plotData,
      plotData: plotData
        ? { villaNo: plotData.villaNo, areaInSqFt: plotData.areaInSqFt }
        : null,
    });

    const userData = {
      id: session.user.id,
      fullName: session.user.name,
      email: session.user.email,
      plotNumber: session.user.plotNumber || "",
      plotData,
    };

    const initialScreen =
      session.user.role === "ADMIN" ? SCREENS.MASTER_LEDGER : SCREENS.DASHBOARD;

    // Use startTransition to avoid cascading renders warning
    Promise.resolve().then(() => {
      setCurrentUser(userData);
      setActiveScreen(initialScreen);
    });
  }, [session]);

  // Loading state
  if (status === "loading") {
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
          <p className="text-slate-400 mb-4">
            Session not found. Redirecting...
          </p>
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out">
      <ResidentWorkspace
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
        currentUser={currentUser}
        perSqFtRate={perSqFtRate}
      />
      {/* Toast notifications */}
      <ToastModal {...toast} onClose={() => setToast(closedToast())} />
    </main>
  );
}
