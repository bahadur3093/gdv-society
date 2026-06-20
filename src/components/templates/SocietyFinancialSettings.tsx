"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils";
import { Settings, Save, DollarSign } from "lucide-react";
import PageLoader from "@/components/atoms/PageLoader";
import Toast from "@/components/atoms/Toast";
import useSWR from "swr";
import { api_get } from "@/lib/services/api";
import Alert from "../atoms/Alert";

interface SocietySettings {
  perSqFtRate: number;
  sinkingFundPercentage: number;
  totalVillas: number;
}

export default function SocietyFinancialSettings() {
  const { data: societySettings, error, isLoading, mutate } =
    useSWR<SocietySettings>(`api/society-settings`, api_get, {
      revalidateOnFocus: false,
      keepPreviousData: true,
    });

  const [formData, setFormData] = useState<Partial<SocietySettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
    isVisible: boolean;
  }>({ message: "", variant: "success", isVisible: false });

  const displayValues = {
    perSqFtRate: formData.perSqFtRate ?? societySettings?.perSqFtRate ?? 0,
    sinkingFundPercentage:
      formData.sinkingFundPercentage ?? societySettings?.sinkingFundPercentage ?? 0,
    totalVillas: formData.totalVillas ?? societySettings?.totalVillas ?? 0,
  };

  const handleSaveSettings = async () => {
    const newRate = parseFloat(displayValues.perSqFtRate.toString());
    const newPercentage = parseFloat(displayValues.sinkingFundPercentage.toString());
    const newTotalVillas = parseInt(displayValues.totalVillas.toString(), 10);

    if (isNaN(newRate) || newRate <= 0) {
      setToast({
        message: "Please enter a valid Per Sq.Ft Rate greater than 0",
        variant: "error",
        isVisible: true,
      });
      return;
    }

    if (isNaN(newPercentage) || newPercentage < 0 || newPercentage > 100) {
      setToast({
        message:
          "Please enter a valid Sinking Fund Percentage between 0 and 100",
        variant: "error",
        isVisible: true,
      });
      return;
    }

    if (isNaN(newTotalVillas) || newTotalVillas <= 0) {
      setToast({
        message: "Please enter a valid Total Villas number greater than 0",
        variant: "error",
        isVisible: true,
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/society-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          perSqFtRate: newRate,
          sinkingFundPercentage: newPercentage,
          totalVillas: newTotalVillas,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update settings");
      }

      setToast({
        message: "Financial settings updated successfully!",
        variant: "success",
        isVisible: true,
      });

      await mutate(result.data);
    } catch (error) {
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to update financial settings",
        variant: "error",
        isVisible: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {(isLoading || isSaving) && (
        <PageLoader
          fullScreen
          message={
            isSaving ? "Saving financial settings..." : "Loading settings..."
          }
        />
      )}

      {error && (
        <Alert
          type="error"
          message="Failed to load society settings. Please try again later."
        />
      )}

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
            <h1 className="text-3xl font-bold text-slate-100">
              Society Financial Settings
            </h1>
            <p className="text-slate-400">
              Configure maintenance rate and sinking fund allocation
            </p>
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
              <label
                htmlFor="per-sqft-rate"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Per Sq.Ft Rate (₹)
              </label>
              <input
                id="per-sqft-rate"
                type="number"
                step="0.01"
                min="0"
                disabled={isLoading || isSaving}
                value={displayValues.perSqFtRate}
                onChange={(e) =>
                  setFormData({ ...formData, perSqFtRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="2.15"
              />
              <p className="text-xs text-slate-500 mt-1">
                Current: {formatCurrency(displayValues.perSqFtRate, true)}/Sq.ft
              </p>
              <p className="text-xs text-slate-400 mt-2">
                This rate is used to calculate maintenance fees based on villa
                square footage.
              </p>
            </div>

            {/* Sinking Fund Percentage */}
            <div>
              <label
                htmlFor="sinking-fund"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Sinking Fund Allocation (%)
              </label>
              <input
                id="sinking-fund"
                type="number"
                step="1"
                min="0"
                max="100"
                disabled={isLoading || isSaving}
                value={displayValues.sinkingFundPercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sinkingFundPercentage: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="20"
              />
              <p className="text-xs text-slate-500 mt-1">
                Current: {displayValues.sinkingFundPercentage}%
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Percentage of maintenance fees allocated to the sinking fund
                (reserves for major repairs and improvements).
              </p>
            </div>

            {/* Total Villas */}
            <div>
              <label
                htmlFor="total-villas"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Total Number of Villas
              </label>
              <input
                id="total-villas"
                type="number"
                step="1"
                min="1"
                disabled={isLoading || isSaving}
                value={displayValues.totalVillas}
                onChange={(e) =>
                  setFormData({ ...formData, totalVillas: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="47"
              />
              <p className="text-xs text-slate-500 mt-1">
                Current: {displayValues.totalVillas} villas
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Total number of villas in the society (used for expense
                calculations).
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={isLoading || isSaving}
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
