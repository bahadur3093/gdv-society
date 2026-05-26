'use client';

import { ResidentUser } from '@/types';
import { formatCurrency, formatArea, getMaintenanceBreakdown } from '@/utils';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';

interface MaintenanceBreakdownProps {
  currentUser?: ResidentUser;
  perSqFtRate: number;
  fixedBaseAmount: number;
}

export default function MaintenanceBreakdown({
  currentUser,
  perSqFtRate,
  fixedBaseAmount,
}: MaintenanceBreakdownProps) {
  if (!currentUser || !currentUser.plotData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No user data available</p>
      </div>
    );
  }

  const { plotData } = currentUser;
  const breakdown = getMaintenanceBreakdown(
    plotData.areaInSqFt,
    fixedBaseAmount,
    perSqFtRate
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calculator className="w-8 h-8 text-violet-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Maintenance Breakdown</h1>
          <p className="text-slate-400">Your monthly maintenance fee calculation</p>
        </div>
      </div>

      {/* Plot Info */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Your Plot Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Villa Number</p>
              <p className="text-xl font-bold text-slate-100">#{plotData.villaNo}</p>
            </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Plot Size</p>
            <p className="text-xl font-bold font-mono text-slate-100">
              {formatArea(plotData.areaInSqFt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Plot Type</p>
            <p className="text-xl font-bold text-slate-100">{plotData.type}</p>
          </div>
        </div>
      </div>

      {/* Current Monthly Maintenance */}
      <div className="bg-slate-900/30 border border-violet-500/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-bold text-slate-100">Your Monthly Maintenance Fee</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-800/40">
            <div>
              <p className="text-sm text-slate-300">Fixed Base Amount</p>
              <p className="text-xs text-slate-500">Common expenses shared equally</p>
            </div>
            <p className="text-xl font-bold font-mono text-slate-100">
              {formatCurrency(breakdown.fixedBase)}
            </p>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-800/40">
            <div>
              <p className="text-sm text-slate-300">Variable Amount</p>
              <p className="text-xs text-slate-500">
                {formatArea(breakdown.plotSize)} × {formatCurrency(breakdown.variableRate, true)}/Sq.ft
              </p>
            </div>
            <p className="text-xl font-bold font-mono text-slate-100">
              {formatCurrency(breakdown.plotSize * breakdown.variableRate)}
            </p>
          </div>
          <div className="flex items-center justify-between py-4 bg-violet-600/20 rounded-lg px-4">
            <div>
              <p className="text-base font-semibold text-violet-300">Total Monthly Dues</p>
              <p className="text-xs text-slate-400">Fixed Base + Variable Amount</p>
            </div>
            <p className="text-3xl font-bold font-mono text-violet-400">
              {formatCurrency(breakdown.hybridTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Annual Summary */}
      <div className="bg-slate-900/30 border border-cyan-500/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100">Annual Summary</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-800/40">
            <div>
              <p className="text-sm text-slate-300">Monthly Maintenance</p>
              <p className="text-xs text-slate-500">Current rate</p>
            </div>
            <p className="text-xl font-bold font-mono text-slate-100">
              {formatCurrency(breakdown.hybridTotal)}
            </p>
          </div>
          <div className="flex items-center justify-between py-4 bg-cyan-600/20 rounded-lg px-4">
            <div>
              <p className="text-base font-semibold text-cyan-300">Annual Maintenance Cost</p>
              <p className="text-xs text-slate-400">Monthly × 12 months</p>
            </div>
            <p className="text-3xl font-bold font-mono text-cyan-400">
              {formatCurrency(breakdown.hybridTotal * 12)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Payment Information</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Monthly Dues</p>
            <p className="text-lg font-bold font-mono text-violet-400">
              {formatCurrency(breakdown.hybridTotal)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Quarterly Payment</p>
            <p className="text-lg font-bold font-mono text-cyan-400">
              {formatCurrency(breakdown.hybridTotal * 3)}
            </p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/40">
            <p className="text-sm font-semibold text-slate-200">Annual Payment</p>
            <p className="text-lg font-bold font-mono text-indigo-400">
              {formatCurrency(breakdown.hybridTotal * 12)}
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
          <p className="text-xs text-slate-400">
            <strong>Note:</strong> Your maintenance fee is calculated using the society's hybrid model, 
            which combines a fixed base amount (common expenses) with a variable component based on your plot size. 
            For questions about the calculation method, please contact the management committee.
          </p>
        </div>
      </div>
    </div>
  );
}
