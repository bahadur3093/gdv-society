'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils';
import { Settings, Save, DollarSign } from 'lucide-react';
import PageLoader from '@/components/atoms/PageLoader';
import Toast from '@/components/atoms/Toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSocietySettings, updateSocietySettings, selectSocietySettings, selectSocietySettingsLoading } from '@/store/slices/societySettingsSlice';

interface SocietyFinancialSettingsProps {
  // Props are now optional since we're using Redux store
  perSqFtRate?: number;
  sinkingFundPercentage?: number;
  totalVillas?: number;
  onUpdatePerSqFtRate?: (rate: number) => void;
  onUpdateSinkingFund?: (percentage: number) => void;
  onUpdateTotalVillas?: (total: number) => void;
}

export default function SocietyFinancialSettings({
  perSqFtRate: propPerSqFtRate,
  sinkingFundPercentage: propSinkingFundPercentage,
  totalVillas: propTotalVillas,
  onUpdatePerSqFtRate,
  onUpdateSinkingFund,
  onUpdateTotalVillas,
}: SocietyFinancialSettingsProps = {}) {
  // Redux hooks
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSocietySettings);
  const isLoadingSettings = useAppSelector(selectSocietySettingsLoading);
  
  // Use Redux state or fallback to props for display
  const perSqFtRate = settings?.perSqFtRate ?? propPerSqFtRate ?? 0;
  const sinkingFundPercentage = settings?.sinkingFundPercentage ?? propSinkingFundPercentage ?? 0;
  const totalVillas = settings?.totalVillas ?? propTotalVillas ?? 0;
  
  // State management - initialize with derived values
  const [localPerSqFtRate, setLocalPerSqFtRate] = useState(perSqFtRate.toString());
  const [localSinkingFund, setLocalSinkingFund] = useState(sinkingFundPercentage.toString());
  const [localTotalVillas, setLocalTotalVillas] = useState(totalVillas.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: 'success' | 'error';
    isVisible: boolean;
  }>({ message: '', variant: 'success', isVisible: false });
  
  // Fetch society settings from Redux store on mount
  useEffect(() => {
    dispatch(fetchSocietySettings());
  }, [dispatch]);

  const handleSaveSettings = async () => {
    const newRate = parseFloat(localPerSqFtRate);
    const newPercentage = parseFloat(localSinkingFund);
    const newTotalVillas = parseInt(localTotalVillas, 10);

    // Validation
    if (isNaN(newRate) || newRate <= 0) {
      setToast({
        message: 'Please enter a valid Per Sq.Ft Rate greater than 0',
        variant: 'error',
        isVisible: true,
      });
      return;
    }

    if (isNaN(newPercentage) || newPercentage < 0 || newPercentage > 100) {
      setToast({
        message: 'Please enter a valid Sinking Fund Percentage between 0 and 100',
        variant: 'error',
        isVisible: true,
      });
      return;
    }

    if (isNaN(newTotalVillas) || newTotalVillas <= 0) {
      setToast({
        message: 'Please enter a valid Total Villas number greater than 0',
        variant: 'error',
        isVisible: true,
      });
      return;
    }

    // Show loader
    setIsSaving(true);

    try {
      // Dispatch Redux action to update society settings
      await dispatch(updateSocietySettings({
        perSqFtRate: newRate,
        sinkingFundPercentage: newPercentage,
        totalVillas: newTotalVillas,
      })).unwrap();
      
      // Call optional callback handlers if provided
      if (onUpdatePerSqFtRate) await onUpdatePerSqFtRate(newRate);
      if (onUpdateSinkingFund) await onUpdateSinkingFund(newPercentage);
      if (onUpdateTotalVillas) await onUpdateTotalVillas(newTotalVillas);

      // Show success toast
      setToast({
        message: 'Financial settings updated successfully!',
        variant: 'success',
        isVisible: true,
      });
    } catch (error) {
      // Show error toast
      setToast({
        message: error instanceof Error ? error.message : 'Failed to update financial settings',
        variant: 'error',
        isVisible: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingSettings || isSaving;
  
  return (
    <>
      {/* Page Loader */}
      {isLoading && <PageLoader fullScreen message={isSaving ? "Saving financial settings..." : "Loading settings..."} />}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        variant={toast.variant}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Society Financial Settings</h1>
            <p className="text-slate-400">Configure maintenance rate and sinking fund allocation</p>
          </div>
        </div>

      {/* Financial Settings Form */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-violet-400" />
          Financial Configuration
        </h2>
        
        <div className="space-y-6">
          {/* Per Sq.Ft Rate */}
          <div>
            <label htmlFor="per-sqft-rate" className="block text-sm font-medium text-slate-300 mb-2">
              Per Sq.Ft Rate (₹)
            </label>
            <input
              id="per-sqft-rate"
              type="number"
              step="0.01"
              min="0"
              value={localPerSqFtRate}
              onChange={(e) => setLocalPerSqFtRate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
              placeholder="2.15"
            />
            <p className="text-xs text-slate-500 mt-1">
              Current: {formatCurrency(perSqFtRate, true)}/Sq.ft
            </p>
            <p className="text-xs text-slate-400 mt-2">
              This rate is used to calculate maintenance fees based on villa square footage.
            </p>
          </div>

          {/* Sinking Fund Percentage */}
          <div>
            <label htmlFor="sinking-fund" className="block text-sm font-medium text-slate-300 mb-2">
              Sinking Fund Allocation (%)
            </label>
            <input
              id="sinking-fund"
              type="number"
              step="1"
              min="0"
              max="100"
              value={localSinkingFund}
              onChange={(e) => setLocalSinkingFund(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              placeholder="20"
            />
            <p className="text-xs text-slate-500 mt-1">
              Current: {sinkingFundPercentage}%
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Percentage of maintenance fees allocated to the sinking fund (reserves for major repairs and improvements).
            </p>
          </div>

          {/* Total Villas */}
          <div>
            <label htmlFor="total-villas" className="block text-sm font-medium text-slate-300 mb-2">
              Total Number of Villas
            </label>
            <input
              id="total-villas"
              type="number"
              step="1"
              min="1"
              value={localTotalVillas}
              onChange={(e) => setLocalTotalVillas(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
              placeholder="47"
            />
            <p className="text-xs text-slate-500 mt-1">
              Current: {totalVillas} villas
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Total number of villas in the society (used for expense calculations).
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
