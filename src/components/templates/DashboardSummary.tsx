"use client";

import AnnouncementsWrapper from "@/app/announcements/announcements-wrapper";
import { api_get } from "@/lib/services/api";
import { Announcement } from "@/types/announcements";
import {
  formatCurrency,
  formatArea,
} from "@/utils";
import { AlertCircle, ScrollText } from "lucide-react";
import useSWR from "swr";
import { PageLoader } from "../atoms";
import Alert from "../atoms/Alert";
import { useUser } from "../providers/UserProvider";

export default function DashboardSummary() {
  const user = useUser();
  console.log({ user });
  const {
    data: announcements,
    error,
    isLoading,
    mutate: refetchAnnouncements,
  } = useSWR<Announcement[]>("api/announcement", api_get, {
    fallbackData: [],
    revalidateOnFocus: false,
  });

  if (!user || !user.plotData) {
    console.warn("[DashboardSummary] Missing user or plot data:", {
      user,
      plotData: user?.plotData,
    });
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No user data available</p>
        <p className="text-xs text-slate-500 mt-2">
          Please contact support if this persists
        </p>
      </div>
    );
  }

  const { plotNumber } = user;
  const outstandingDues = 4000.0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          Dashboard Summary
        </h1>
        <p className="text-slate-400">
          Welcome back, {user.name}.{" "}
          {announcements?.length && (
            <span className="text-sm text-slate-400">
              You have{" "}
              <span className="text-red-500 font-bold">
                {announcements.length}
              </span>{" "}
              pending announcements
            </span>
          )}
        </p>
      </div>

      {/* High-Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outstanding Dues */}
        <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-lg text-slate-400 mb-1">
                Current Outstanding Dues
              </p>
              <p className="text-sm text-slate-500">As of today</p>
            </div>
            <AlertCircle className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-slate-100">
            {formatCurrency(outstandingDues)}
          </p>
          <p className="text-sm text-red-400 mt-2">
            Payment due by end of month
          </p>
          <div className="flex gap-2 mt-4">
            <button className="grow px-2 py-2 bg-cyan-500 text-slate-900 rounded-lg hover:bg-cyan-600 transition-all duration-300">Pay Now</button>
            <button className="p-2 text-white border-2 border-slate-500 rounded-lg hover:bg-cyan-600 transition-all duration-300">
              <ScrollText />
            </button>
          </div>
        </div>

        {/* Plot Information */}
        <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-lg text-slate-400 mb-1">Your Plot Details</p>
              <p className="text-xl text-white font-bold">Villa #{plotNumber}</p>
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100 mb-2">
            {formatArea(1200)}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-slate-500">
              <span className="text-slate-400">Type:</span> {"Normal"}
            </p>
            <p className="text-xs text-slate-500">
              <span className="text-slate-400">Villa:</span> #{plotNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Community Announcements */}
      <div className="">
        {isLoading && <PageLoader message="Geting new announcements.." />}
        {error && <Alert message="No announcements found!!!" type="error" />}
        {!isLoading && !error && announcements && (
          <AnnouncementsWrapper
            announcements={announcements}
            refresh={() => refetchAnnouncements()}
          />
        )}
      </div>
    </div>
  );
}
