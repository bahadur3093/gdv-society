'use client';

import { useState, useMemo, useEffect } from 'react';
import { formatCurrency, formatArea } from '@/utils';
import { Table, CheckSquare, Square, Edit2, Save, X, ArrowUpDown, Loader2 } from 'lucide-react';
import { DEFAULT_EXPENSES, TOTAL_VILLAS } from '@/utils/constants';
import type { ApiResponse } from '@/types';

interface MasterVillaLedgerProps {
  perSqFtRate: number;
}

interface EditingCell {
  villaNo: number;
  field: 'ownerName' | 'areaInSqFt' | 'remarks';
}

interface VillaData {
  villaNo: number;
  type: string;
  areaInSqM: number;
  ownerName: string;
  areaInSqFt: number;
  remarks?: string;
  fixedAmount: number;
  variableAmount: number;
  hybridTotal: number;
  flatRate: number;
}

export default function MasterVillaLedger({ perSqFtRate }: MasterVillaLedgerProps) {
  // State management
  const [showHybrid, setShowHybrid] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const [plotData, setPlotData] = useState<VillaData[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Common expenses selection state
  const [selectedExpenses, setSelectedExpenses] = useState({
    security: true,
    electricity: true,
    garbage: false,
    cleaning: false,
    misc: false,
    gym: false,
    stpMaintenance: false,
    emergencyFund: false,
  });

  // Fetch villa data from API
  useEffect(() => {
    const fetchVillaData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/villas');
        const result: ApiResponse = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch villa data');
        }
        
        setPlotData(result.data as VillaData[]);
      } catch (err: unknown) {
        console.error('Error fetching villa data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load villa data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVillaData();
  }, []);

  // Calculate total common expenses based on selection
  const totalCommonExpenses = useMemo(() => {
    let total = 0;
    if (selectedExpenses.security) total += DEFAULT_EXPENSES.security;
    if (selectedExpenses.electricity) total += DEFAULT_EXPENSES.electricity;
    if (selectedExpenses.garbage) total += DEFAULT_EXPENSES.garbage;
    if (selectedExpenses.cleaning) total += DEFAULT_EXPENSES.cleaning;
    if (selectedExpenses.misc) total += DEFAULT_EXPENSES.misc;
    if (selectedExpenses.gym) total += DEFAULT_EXPENSES.gym;
    if (selectedExpenses.stpMaintenance) total += DEFAULT_EXPENSES.stpMaintenance;
    if (selectedExpenses.emergencyFund) total += DEFAULT_EXPENSES.emergencyFund;
    return total;
  }, [selectedExpenses]);

  // Calculate fixed amount per villa
  const calculatedFixedAmount = useMemo(() => {
    return totalCommonExpenses / TOTAL_VILLAS;
  }, [totalCommonExpenses]);

  // Sorting functionality
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort plot data based on sortConfig
  const sortedPlotData = useMemo(() => {
    if (!sortConfig) return plotData;

    const sorted = [...plotData].sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortConfig.key) {
        case 'area':
          aValue = a.areaInSqFt;
          bValue = b.areaInSqFt;
          break;
        case 'hybrid':
          aValue = a.hybridTotal;
          bValue = b.hybridTotal;
          break;
        case 'flat':
          aValue = a.flatRate;
          bValue = b.flatRate;
          break;
        case 'variable':
          aValue = a.variableAmount;
          bValue = b.variableAmount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [plotData, sortConfig]);

  // Filter out unoccupied plots for display
  const occupiedPlots = sortedPlotData.filter(
    (plot) => plot.ownerName !== 'Not Occupied' && plot.ownerName !== '(No name)'
  );

  // Handle cell edit
  const handleEditCell = (villaNo: number, field: 'ownerName' | 'areaInSqFt' | 'remarks', currentValue: string | number) => {
    setEditingCell({ villaNo, field });
    setEditValue(String(currentValue));
  };

  // Handle save cell
  const handleSaveCell = () => {
    if (!editingCell) return;
    
    setPlotData(prevData =>
      prevData.map(plot => {
        if (plot.villaNo === editingCell.villaNo) {
          const updatedPlot = { ...plot };
          
          if (editingCell.field === 'areaInSqFt') {
            const newArea = parseFloat(editValue) || plot.areaInSqFt;
            updatedPlot.areaInSqFt = newArea;
            // Recalculate variable amount and totals
            updatedPlot.variableAmount = newArea * perSqFtRate;
            updatedPlot.hybridTotal = calculatedFixedAmount + updatedPlot.variableAmount;
            updatedPlot.flatRate = newArea * perSqFtRate;
          } else {
            updatedPlot[editingCell.field] = editValue;
          }
          
          return updatedPlot;
        }
        return plot;
      })
    );
    
    setEditingCell(null);
    setEditValue('');
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Toggle expense selection
  const toggleExpense = (expense: keyof typeof selectedExpenses) => {
    setSelectedExpenses(prev => ({
      ...prev,
      [expense]: !prev[expense]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Table className="w-8 h-8 text-indigo-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Master Villa Ledger</h1>
          <p className="text-slate-400">Complete registry of all villa plots and maintenance calculations</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <span className="ml-3 text-slate-300">Loading villa data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Main Content - Only show when not loading */}
      {!isLoading && !error && (
      <>
      {/* Common Expenses Selection Panel */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-violet-900/20 border border-indigo-800/40 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-slate-100 mb-3">Select Common Expenses for Fixed Amount Calculation</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(DEFAULT_EXPENSES).map(([key, amount]) => {
            const isSelected = selectedExpenses[key as keyof typeof selectedExpenses];
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            return (
              <button
                key={key}
                onClick={() => toggleExpense(key as keyof typeof selectedExpenses)}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-indigo-900/40 border-indigo-600/60 text-slate-100'
                    : 'bg-slate-900/20 border-slate-800/40 text-slate-400 hover:bg-slate-800/30'
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <div className="flex-1 text-left">
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-xs font-mono text-slate-400">{formatCurrency(amount)}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between bg-slate-900/40 rounded-lg p-4 border border-slate-800/40">
          <span className="text-sm text-slate-300">Total Common Expenses (Monthly)</span>
          <span className="text-lg font-bold font-mono text-indigo-400">{formatCurrency(totalCommonExpenses)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between bg-indigo-900/30 rounded-lg p-4 border border-indigo-700/40">
          <span className="text-sm text-slate-300">Fixed Amount per Villa ({TOTAL_VILLAS} villas)</span>
          <span className="text-lg font-bold font-mono text-violet-400">{formatCurrency(calculatedFixedAmount)}</span>
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">Plot Type Legends</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-violet-600/30 border border-violet-500"></div>
            <span className="text-sm text-slate-300">Odd Site / Corner / Irregular (Non-Standard)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-800/50 border border-slate-700"></div>
            <span className="text-sm text-slate-300">Standard Plot (9.14m × 12.19m)</span>
          </div>
        </div>
      </div>

      {/* Rate Display Toggle */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Display Rate Type</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHybrid(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showHybrid
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Hybrid Rate
            </button>
            <button
              onClick={() => setShowHybrid(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !showHybrid
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Flat Rate
            </button>
          </div>
        </div>
      </div>

      {/* Data Table - Editable */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg overflow-hidden">
        <div className="overflow-x-auto scroller-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr className="border-b border-slate-800/40">
                <th className="sticky left-0 bg-slate-950 z-10 text-left py-3 px-4 text-sm font-semibold text-slate-300">
                  Plot
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                  Owner
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300 whitespace-nowrap">
                  <button
                    onClick={() => handleSort('area')}
                    className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                  >
                    Area (Sq.ft)
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                {showHybrid && (
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300 whitespace-nowrap">
                    <button
                      onClick={() => handleSort('variable')}
                      className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                    >
                      Variable
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                )}
                <th className={`text-left py-3 px-4 text-sm font-semibold whitespace-nowrap ${
                  showHybrid ? 'text-violet-400' : 'text-cyan-400'
                }`}>
                  <button
                    onClick={() => handleSort(showHybrid ? 'hybrid' : 'flat')}
                    className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                  >
                    {showHybrid ? 'Hybrid Total' : 'Flat Rate'}
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
        {sortedPlotData.map((plot) => {
          const isEditingOwner = editingCell?.villaNo === plot.villaNo && editingCell?.field === 'ownerName';
          const isEditingArea = editingCell?.villaNo === plot.villaNo && editingCell?.field === 'areaInSqFt';
          const isEditingRemarks = editingCell?.villaNo === plot.villaNo && editingCell?.field === 'remarks';
                
                // Determine if plot is odd/irregular based on type or remarks
                const isOddPlot = plot.type?.toLowerCase().includes('odd') || 
                                  plot.type?.toLowerCase().includes('common') ||
                                  plot.remarks?.toLowerCase().includes('corner') ||
                                  plot.remarks?.toLowerCase().includes('irregular');
                
                const rowColorClass = isOddPlot 
                  ? 'bg-violet-900/10 hover:bg-violet-800/20 border-violet-800/20' 
                  : 'hover:bg-slate-800/30';
                
                const stickyBgClass = isOddPlot
                  ? 'bg-violet-900/10'
                  : 'bg-slate-950';
                
            return (
              <tr
                key={plot.villaNo}
                className={`border-b border-slate-800/20 transition-colors ${rowColorClass}`}
              >
                <td className={`sticky left-0 ${stickyBgClass} z-10 py-3 px-4 text-sm font-semibold text-indigo-400`}>
                  #{plot.villaNo}
                </td>
                    
                    {/* Editable Owner */}
                    <td className="py-3 px-4 text-sm text-slate-300">
                      {isEditingOwner ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-slate-800 border border-indigo-600 rounded px-2 py-1 text-sm text-slate-100 w-full"
                          autoFocus
                        />
                  ) : (
                    <span
                      onClick={() => handleEditCell(plot.villaNo, 'ownerName', plot.ownerName)}
                      className="cursor-pointer hover:text-indigo-400 transition-colors"
                    >
                      {plot.ownerName}
                        </span>
                      )}
                    </td>
                    
                    {/* Editable Area */}
                    <td className="py-3 px-4 text-sm text-left font-mono text-slate-300 whitespace-nowrap">
                      {isEditingArea ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-slate-800 border border-indigo-600 rounded px-2 py-1 text-sm text-slate-100 w-24 text-right"
                          autoFocus
                        />
                  ) : (
                    <span
                      onClick={() => handleEditCell(plot.villaNo, 'areaInSqFt', plot.areaInSqFt)}
                      className="cursor-pointer hover:text-indigo-400 transition-colors"
                    >
                      {formatArea(plot.areaInSqFt)}
                        </span>
                      )}
                    </td>
                    
                    {/* Variable Amount (Auto-calculated) - Only show when Hybrid is selected */}
                    {showHybrid && (
                      <td className="py-3 px-4 text-sm text-left font-mono text-slate-300 whitespace-nowrap">
                        {formatCurrency(plot.variableAmount)}
                      </td>
                    )}
                    
                    {/* Hybrid or Flat Rate (Based on Toggle) */}
                    <td className={`py-3 px-4 text-sm text-left font-mono font-semibold whitespace-nowrap ${
                      showHybrid ? 'text-violet-400' : 'text-cyan-400'
                    }`}>
                      {formatCurrency(showHybrid ? plot.hybridTotal : plot.flatRate)}
                    </td>
                    
                {/* Action Buttons */}
                <td className="py-3 px-4 text-center">
                  {editingCell?.villaNo === plot.villaNo ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={handleSaveCell}
                            className="p-1 rounded bg-green-600 hover:bg-green-700 transition-colors"
                            title="Save"
                          >
                            <Save className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 rounded bg-red-600 hover:bg-red-700 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                  ) : (
                    <button
                      onClick={() => handleEditCell(plot.villaNo, 'ownerName', plot.ownerName)}
                      className="p-1 rounded bg-slate-800 hover:bg-indigo-600 transition-colors"
                      title="Edit Row"
                    >
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
