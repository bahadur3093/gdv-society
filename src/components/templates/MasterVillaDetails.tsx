'use client';

import { useState, useMemo, useEffect } from 'react';
import { formatCurrency, formatArea } from '@/utils';
import { Table, Edit2, Save, X, ArrowUpDown, Loader2 } from 'lucide-react';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import Toast from '@/components/atoms/Toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchVillas, updateVilla, selectAllVillas, selectVillasLoading, selectVillasError } from '@/store/slices/villasSlice';

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
  maintenanceAmount: number;
  perSqFtRate: number;
  sinkingFundAmount: number;
  totalAmount: number;
}

export default function MasterVillaDetails() {
  // Redux hooks
  const dispatch = useAppDispatch();
  const plotData = useAppSelector(selectAllVillas) as VillaData[];
  const isLoading = useAppSelector(selectVillasLoading);
  const error = useAppSelector(selectVillasError);
  
  // State management
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ villaNo: number; data: Partial<VillaData> } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' | 'info' | 'warning'; isVisible: boolean }>({ 
    message: '', 
    variant: 'info', 
    isVisible: false 
  });

  // Fetch villa data from Redux store
  useEffect(() => {
    dispatch(fetchVillas());
  }, [dispatch]);



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
        case 'maintenance':
          aValue = a.maintenanceAmount;
          bValue = b.maintenanceAmount;
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

  // Handle cell edit
  const handleEditCell = (villaNo: number, field: 'ownerName' | 'areaInSqFt' | 'remarks', currentValue: string | number) => {
    setEditingCell({ villaNo, field });
    setEditValue(String(currentValue));
  };

  // Handle save cell - prepare update and show confirmation
  const handleSaveCell = () => {
    if (!editingCell) return;
    
    const plot = plotData.find(p => p.villaNo === editingCell.villaNo);
    if (!plot) return;
    
    // Prepare the update data
    const updateData: Partial<VillaData> = {};
    
    if (editingCell.field === 'areaInSqFt') {
      const newArea = parseFloat(editValue);
      if (isNaN(newArea) || newArea <= 0) {
        setToast({ 
          message: 'Please enter a valid area value', 
          variant: 'error', 
          isVisible: true 
        });
        return;
      }
      updateData.areaInSqFt = newArea;
      // Calculate areaInSqM (1 sqft = 0.092903 sqm)
      updateData.areaInSqM = newArea * 0.092903;
    } else if (editingCell.field === 'ownerName') {
      if (!editValue.trim()) {
        setToast({ 
          message: 'Owner name cannot be empty', 
          variant: 'error', 
          isVisible: true 
        });
        return;
      }
      updateData.ownerName = editValue.trim();
    } else if (editingCell.field === 'remarks') {
      updateData.remarks = editValue.trim();
    }
    
    // Store pending update and show confirmation dialog
    setPendingUpdate({ villaNo: plot.villaNo, data: updateData });
    setShowConfirmDialog(true);
    // Set saving state to show loader in confirmation dialog
    setIsSaving(false); // Reset to false initially, will be set to true on confirm
  };
  
  // Confirm and execute the update
  const handleConfirmUpdate = async () => {
    if (!pendingUpdate) return;
    
    setIsSaving(true);
    
    try {
      // Dispatch Redux action to update villa
      const result = await dispatch(updateVilla({
        villaNo: pendingUpdate.villaNo,
        data: pendingUpdate.data
      })).unwrap();
      
      // Refresh all villas data to ensure store is fully synced with latest API data
      await dispatch(fetchVillas()).unwrap();
      
      // Show success toast
      setToast({ 
        message: `Villa #${pendingUpdate.villaNo} updated successfully`, 
        variant: 'success', 
        isVisible: true 
      });
      
      // Clear editing state
      setEditingCell(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating villa:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to update villa', 
        variant: 'error', 
        isVisible: true 
      });
    } finally {
      setIsSaving(false);
      setShowConfirmDialog(false);
      setPendingUpdate(null);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };



  return (
    <>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-cyan-400 whitespace-nowrap">
                  <button
                    onClick={() => handleSort('maintenance')}
                    className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                  >
                    Maintenance Amount
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
                
                // Determine if plot is odd/irregular based on type or remarks
                const isOddPlot = plot.type?.toLowerCase().includes('odd') || 
                                  plot.type?.toLowerCase().includes('common') ||
                                  plot.remarks?.toLowerCase().includes('corner') ||
                                  plot.remarks?.toLowerCase().includes('irregular');
                const notOccupiedPlots = plot.ownerName === 'Not Occupied';  
                
                const rowColorClass = isOddPlot 
                  ? 'bg-violet-900/10 hover:bg-violet-800/20 border-violet-800/20' 
                  : 'hover:bg-slate-800/30';

                const notOccupiedClass = notOccupiedPlots 
                  ? 'text-red-900'
                  : '';

                const stickyBgClass = isOddPlot
                  ? 'bg-violet-900/10'
                  : 'bg-slate-950';
                
            return (
              <tr
                key={plot.villaNo}
                className={`border-b border-slate-800/20 transition-colors ${rowColorClass}`}
              >
                <td className={`sticky left-0 ${stickyBgClass} z-10 py-3 px-4 text-sm font-semibold ${notOccupiedClass} text-indigo-400`}>
                  #{plot.villaNo}
                </td>
                    
                    {/* Editable Owner */}
                    <td className="py-3 px-4 text-sm text-slate-300">
                      {isEditingOwner ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className={`bg-slate-800 border border-indigo-600 rounded px-2 py-1 text-sm text-slate-100 w-full`}
                          autoFocus
                        />
                  ) : (
                    <span
                      onClick={() => handleEditCell(plot.villaNo, 'ownerName', plot.ownerName)}
                      className={`cursor-pointer hover:text-indigo-400 transition-colors ${notOccupiedClass}`}
                    >
                      {plot.ownerName}
                        </span>
                      )}
                    </td>
                    
                    {/* Editable Area */}
                    <td className={`py-3 px-4 text-sm text-left font-mono ${notOccupiedClass} text-slate-300 whitespace-nowrap `}>
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
                      className={`cursor-pointer hover:text-indigo-400 transition-colors ${notOccupiedClass}`}
                    >
                      {formatArea(plot.areaInSqFt)}
                        </span>
                      )}
                    </td>
                    
                    {/* Maintenance Amount */}
                    <td className={`py-3 px-4 text-sm text-left font-mono font-semibold ${notOccupiedClass} text-cyan-400 whitespace-nowrap`}>
                      {formatCurrency(plot.maintenanceAmount)}
                    </td>
                    
                {/* Action Buttons */}
                <td className="py-3 px-4 text-center">
                  {editingCell?.villaNo === plot.villaNo ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={handleSaveCell}
                            disabled={isSaving}
                            className="p-1 rounded bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Save"
                          >
                            {isSaving && showConfirmDialog ? (
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="p-1 rounded bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                  ) : (
                    <button
                      onClick={() => handleEditCell(plot.villaNo, 'ownerName', plot.ownerName)}
                      disabled={isSaving}
                      className="p-1 rounded bg-slate-800 hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          if (!isSaving) {
            setShowConfirmDialog(false);
            setPendingUpdate(null);
          }
        }}
        onConfirm={handleConfirmUpdate}
        title="Confirm Villa Update"
        message={`Are you sure you want to update Villa #${pendingUpdate?.villaNo}? This will save the changes to the database.`}
        confirmText="Update Villa"
        cancelText="Cancel"
        variant="info"
        loading={isSaving}
      />
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        variant={toast.variant}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        duration={3000}
      />
    </div>
    </>
  );
}
