'use client';

import { PendingRegistration } from '@/types';
import { getPlotByNumber } from '@/data/plots';
import { formatArea, formatDateTime } from '@/utils';
import { UserPlus, Check, X, Clock } from 'lucide-react';

interface VillaOnboardingQueueProps {
  pendingRegistrations: PendingRegistration[];
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
}

export default function VillaOnboardingQueue({
  pendingRegistrations,
  onApprove,
  onDecline,
}: VillaOnboardingQueueProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <UserPlus className="w-8 h-8 text-indigo-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Villa Onboarding</h1>
          <p className="text-slate-400">Review and approve pending registration requests</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <p className="text-sm text-slate-300">
            <span className="font-bold text-cyan-400">{pendingRegistrations.length}</span> pending
            registration{pendingRegistrations.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
      </div>

      {/* Pending Registrations */}
      {pendingRegistrations.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-12 text-center">
          <UserPlus className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">No Pending Registrations</h3>
          <p className="text-sm text-slate-500">
            All registration requests have been processed. New requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRegistrations.map((registration) => {
            const plotData = getPlotByNumber(registration.plotNumber);
            return (
              <div
                key={registration.id}
                className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Registration Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-100 mb-1">
                          {registration.fullName}
                        </h3>
                        <p className="text-sm text-slate-400">{registration.email}</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded">
                        PENDING
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Requested Plot</p>
                        <p className="text-sm font-semibold text-indigo-400">
                          Plot #{registration.plotNumber}
                        </p>
                      </div>
                      {plotData && (
                        <>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Plot Size (Auto-Assigned)</p>
                            <p className="text-sm font-semibold font-mono text-slate-300">
                              {formatArea(plotData.areaInSqFt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Plot Type</p>
                            <p className="text-sm font-semibold text-slate-300">
                              {plotData.type}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Villa Number</p>
                            <p className="text-sm font-semibold text-slate-300">
                              Villa #{plotData.villaNo}
                            </p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Requested At</p>
                        <p className="text-sm text-slate-400">
                          {formatDateTime(registration.requestedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex lg:flex-col gap-3">
                    <button
                      onClick={() => onApprove(registration.id)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                    >
                      <Check className="w-4 h-4" />
                      Confirm Approval
                    </button>
                    <button
                      onClick={() => onDecline(registration.id)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
