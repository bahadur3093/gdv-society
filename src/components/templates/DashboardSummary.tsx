'use client';

import { ResidentUser } from '@/types';
import { formatCurrency, formatArea, calculateAnnualMaintenance, MOCK_ANNOUNCEMENTS } from '@/utils';
import { TrendingUp, AlertCircle, Bell } from 'lucide-react';

interface DashboardSummaryProps {
  currentUser?: ResidentUser;
  perSqFtRate: number;
  fixedBaseAmount: number;
}

export default function DashboardSummary({ currentUser, perSqFtRate, fixedBaseAmount }: DashboardSummaryProps) {
  if (!currentUser || !currentUser.plotData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No user data available</p>
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
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Dashboard Summary</h1>
        <p className="text-slate-400">Welcome back, {currentUser.fullName}</p>
      </div>

      {/* High-Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Annual Maintenance */}
        <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 hover:border-violet-500/30 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Annual Maintenance Cost</p>
              <p className="text-xs text-slate-500">For {formatArea(plotData.areaInSqFt)}</p>
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
              <p className="text-sm text-slate-400 mb-1">Current Outstanding Dues</p>
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
                <p className="text-xs text-slate-500">Villa #{plotData.villaNo}</p>
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
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl font-bold text-slate-100">Community Announcements</h2>
        </div>
        <div className="space-y-4">
          {MOCK_ANNOUNCEMENTS.map((announcement) => (
            <div
              key={announcement.id}
              className="border-l-2 border-violet-500/50 pl-4 py-2"
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-sm font-semibold text-slate-200">
                  {announcement.title}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    announcement.priority === 'high'
                      ? 'bg-red-500/20 text-red-400'
                      : announcement.priority === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {announcement.priority}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-2">{announcement.message}</p>
              <p className="text-xs text-slate-500">
                Posted on {new Date(announcement.date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
