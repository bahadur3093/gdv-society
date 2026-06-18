"use client";

import AnnouncementsWrapper from "@/app/announcements/announcements-wrapper";
import { api_get } from "@/lib/services/api";
import { ResidentUser } from "@/types";
import { Announcement } from "@/types/announcements";
import {
  formatCurrency,
  formatArea,
  calculateAnnualMaintenance,
} from "@/utils";
import { TrendingUp, AlertCircle } from "lucide-react";
import useSWR from "swr";
import { PageLoader } from "../atoms";
import Alert from "../atoms/Alert";

interface DashboardSummaryProps {
  currentUser?: ResidentUser;
}

export default function DashboardSummary({
  currentUser
}: DashboardSummaryProps) {
  const {
    data: announcements,
    error,
    isLoading,
    mutate: refetchAnnouncements
  } = useSWR<Announcement[]>("api/announcement", api_get, {
    fallbackData: [],
    revalidateOnFocus: false,
  });

  if (!currentUser || !currentUser.plotData) {
    console.warn("[DashboardSummary] Missing user or plot data:", {
      currentUser,
      plotData: currentUser?.plotData,
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

  const { plotData } = currentUser;
  const monthlyMaintenance = plotData.hybridTotal;
  const annualMaintenance = calculateAnnualMaintenance(monthlyMaintenance);
  const outstandingDues = 4000.0; // Mock data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          Dashboard Summary
        </h1>
        <p className="text-slate-400">Welcome back, {currentUser.fullName}</p>
      </div>

      {/* High-Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Annual Maintenance */}
        <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 hover:border-violet-500/30 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">
                Annual Maintenance Cost
              </p>
              <p className="text-xs text-slate-500">
                For {formatArea(plotData.areaInSqFt)}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-slate-100">
            {formatCurrency(annualMaintenance)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {formatCurrency(monthlyMaintenance)} per month
          </p>
        </div>

        {/* Outstanding Dues */}
        <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">
                Current Outstanding Dues
              </p>
              <p className="text-xs text-slate-500">As of today</p>
            </div>
            <AlertCircle className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold font-mono text-slate-100">
            {formatCurrency(outstandingDues)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Payment due by end of month
          </p>
        </div>

        {/* Plot Information */}
        <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Your Plot Details</p>
              <p className="text-xs text-slate-500">
                Villa #{plotData.villaNo}
              </p>
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100 mb-2">
            {formatArea(plotData.areaInSqFt)}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-slate-500">
              <span className="text-slate-400">Type:</span> {plotData.type}
            </p>
            <p className="text-xs text-slate-500">
              <span className="text-slate-400">Villa:</span> #{plotData.villaNo}
            </p>
          </div>
        </div>
      </div>

      {/* Community Announcements */}
      <div className="">
        {isLoading && <PageLoader message="Geting new announcements.." />}
        {error && <Alert message="No announcements found!!!" type="error" />}
        {!isLoading && !error && announcements && (
          <AnnouncementsWrapper announcements={announcements} refresh={() => refetchAnnouncements()} />
        )}
      </div>
    </div>
  );
}
