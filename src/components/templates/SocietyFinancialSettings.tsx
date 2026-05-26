'use client';

import { useState } from 'react';
import { formatCurrency, DEFAULT_EXPENSES } from '@/utils';
import { Settings, Save, DollarSign, Edit2, Trash2, Plus, X, Check, Info } from 'lucide-react';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';

interface SocietyFinancialSettingsProps {
  perSqFtRate: number;
  fixedBaseAmount: number;
  sinkingFundPercentage: number;
  onUpdatePerSqFtRate: (rate: number) => void;
  onUpdateFixedBase: (amount: number) => void;
  onUpdateSinkingFund: (percentage: number) => void;
}

interface ExpenseItem {
  id: string;
  label: string;
  amount: number;
  isCustom: boolean;
}

export default function SocietyFinancialSettings({
  perSqFtRate,
  fixedBaseAmount,
  sinkingFundPercentage,
  onUpdatePerSqFtRate,
  onUpdateFixedBase,
  onUpdateSinkingFund,
}: SocietyFinancialSettingsProps) {
  const [localPerSqFtRate, setLocalPerSqFtRate] = useState(perSqFtRate.toString());
  const [localFixedBase, setLocalFixedBase] = useState(fixedBaseAmount.toString());
  const [localSinkingFund, setLocalSinkingFund] = useState(sinkingFundPercentage.toString());
  const [isEditingSinkingFund, setIsEditingSinkingFund] = useState(false);
  
  // Initialize expenses from DEFAULT_EXPENSES
  const initialExpenses: ExpenseItem[] = Object.entries(DEFAULT_EXPENSES).map(([key, value]) => ({
    id: key,
    label: key.replace(/([A-Z])/g, ' $1').trim(),
    amount: value,
    isCustom: false,
  }));
  
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>('');
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  
  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info',
  });

  const handleSaveRates = () => {
    const newRate = parseFloat(localPerSqFtRate);
    const newBase = parseFloat(localFixedBase);

    if (!isNaN(newRate) && newRate > 0) {
      onUpdatePerSqFtRate(newRate);
    }
    if (!isNaN(newBase) && newBase > 0) {
      onUpdateFixedBase(newBase);
    }

    alert('Financial settings updated successfully!');
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleStartEdit = (expenseId: string, currentAmount: number) => {
    setEditingExpenseId(expenseId);
    setEditingAmount(currentAmount.toString());
  };

  const handleSaveEdit = (expenseId: string) => {
    const newAmount = parseFloat(editingAmount);
    if (!isNaN(newAmount) && newAmount >= 0) {
      setExpenses(expenses.map(exp => 
        exp.id === expenseId ? { ...exp, amount: newAmount } : exp
      ));
    }
    setEditingExpenseId(null);
    setEditingAmount('');
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setEditingAmount('');
  };

  const handleDeleteExpense = (expenseId: string) => {
    const expense = expenses.find(exp => exp.id === expenseId);
    if (!expense) return;
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Expense Category',
      message: `Are you sure you want to delete the "${expense.label}" expense category? This will remove it from the financial calculations and cannot be undone.`,
      variant: 'danger',
      confirmText: 'Delete Category',
      onConfirm: () => {
        setExpenses(expenses.filter(exp => exp.id !== expenseId));
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const handleAddExpense = () => {
    const amount = parseFloat(newExpenseAmount);
    if (!newExpenseName.trim() || isNaN(amount) || amount < 0) {
      alert('Please enter a valid expense name and amount.');
      return;
    }

    const newExpense: ExpenseItem = {
      id: `custom_${Date.now()}`,
      label: newExpenseName.trim(),
      amount: amount,
      isCustom: true,
    };

    setExpenses([...expenses, newExpense]);
    setNewExpenseName('');
    setNewExpenseAmount('');
    setIsAddingExpense(false);
  };

  const handleCancelAdd = () => {
    setNewExpenseName('');
    setNewExpenseAmount('');
    setIsAddingExpense(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-indigo-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Society Financial Settings</h1>
          <p className="text-slate-400">Configure global maintenance rates and expense allocations</p>
        </div>
      </div>

      {/* Maintenance Rate Configuration */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-violet-400" />
          Maintenance Rate Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
          <div>
            <label htmlFor="fixed-base" className="block text-sm font-medium text-slate-300 mb-2">
              Fixed Base Amount (₹)
            </label>
            <input
              id="fixed-base"
              type="number"
              step="1"
              min="0"
              value={localFixedBase}
              onChange={(e) => setLocalFixedBase(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
              placeholder="1873.00"
            />
            <p className="text-xs text-slate-500 mt-1">
              Current: {formatCurrency(fixedBaseAmount)}
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveRates}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          <Save className="w-4 h-4" />
          Save Rate Changes
        </button>
      </div>

      {/* Sinking Fund Configuration */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">Sinking Fund Allocation</h2>
          {!isEditingSinkingFund && (
            <button
              onClick={() => setIsEditingSinkingFund(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
            >
              <Edit2 className="w-4 h-4" />
              Edit Percentage
            </button>
          )}
        </div>
        
        {isEditingSinkingFund ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="sinking-fund" className="block text-sm font-medium text-slate-300 mb-2">
                Sinking Fund Percentage (%)
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
                Current: {sinkingFundPercentage}% • Portion of maintenance allocated to reserves
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const newPercentage = parseFloat(localSinkingFund);
                  if (!isNaN(newPercentage) && newPercentage >= 0 && newPercentage <= 100) {
                    onUpdateSinkingFund(newPercentage);
                    setIsEditingSinkingFund(false);
                    alert('Sinking fund percentage updated successfully!');
                  } else {
                    alert('Please enter a valid percentage between 0 and 100');
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setLocalSinkingFund(sinkingFundPercentage.toString());
                  setIsEditingSinkingFund(false);
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-300 ease-in-out"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-cyan-600/20 rounded-lg">
            <div>
              <p className="text-sm text-slate-300 mb-1">Sinking Fund Percentage</p>
              <p className="text-xs text-slate-500">Portion of maintenance allocated to reserves</p>
            </div>
            <p className="text-3xl font-bold text-cyan-400">{sinkingFundPercentage}%</p>
          </div>
        )}
      </div>

      {/* Community Expenses Breakdown */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">Monthly Community Expenses</h2>
          <button
            onClick={() => setIsAddingExpense(true)}
            disabled={isAddingExpense}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
        
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between py-3 border-b border-slate-800/20 last:border-0 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-300 capitalize">
                    {expense.label}
                  </p>
                  {expense.isCustom && (
                    <span className="px-2 py-0.5 text-xs bg-cyan-600/20 text-cyan-400 rounded-full">
                      Custom
                    </span>
                  )}
                </div>
              </div>
              
              {editingExpenseId === expense.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={editingAmount}
                    onChange={(e) => setEditingAmount(e.target.value)}
                    className="w-32 px-3 py-1.5 bg-slate-900/50 border border-slate-800/40 rounded text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(expense.id)}
                    className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded transition-all duration-200"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition-all duration-200"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-sm font-mono font-semibold text-slate-100">
                    {formatCurrency(expense.amount)}
                  </p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleStartEdit(expense.id, expense.amount)}
                      className="p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded transition-all duration-200"
                      title="Edit Amount"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {expense.isCustom && (
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded transition-all duration-200"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Add New Expense Form */}
          {isAddingExpense && (
            <div className="py-3 border-b border-slate-800/20">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Expense name"
                  value={newExpenseName}
                  onChange={(e) => setNewExpenseName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-800/40 rounded text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Amount"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  className="w-32 px-3 py-2 bg-slate-900/50 border border-slate-800/40 rounded text-slate-100 font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleAddExpense}
                  className="p-2 bg-green-600 hover:bg-green-500 text-white rounded transition-all duration-200"
                  title="Add"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelAdd}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-all duration-200"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t-2 border-slate-700">
            <p className="text-base font-bold text-slate-100">Total Monthly Expenses</p>
            <p className="text-xl font-bold font-mono text-indigo-400">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      {/* Rate Calculation Methods - Comprehensive Guide */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-violet-900/20 border border-indigo-800/40 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-6 h-6 text-indigo-400 mt-1" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-100 mb-2">Rate Calculation Methods</h2>
            <p className="text-sm text-slate-400 mb-6">
              Configure how maintenance fees are calculated for residents. The society uses two calculation models:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Hybrid Calculation */}
              <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-800/40">
                <h4 className="text-sm font-semibold text-violet-400 mb-2">Hybrid Rate Formula (Recommended)</h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <p className="font-mono">Fixed Amount + Variable Amount = Hybrid Total</p>
                  <div className="pl-4 space-y-1 text-xs text-slate-400">
                    <p>• Fixed: Common expenses ÷ Total villas</p>
                    <p>• Variable: Plot area × Per Sq.ft rate</p>
                    <p className="font-mono text-indigo-400 mt-2">
                      {formatCurrency(parseFloat(localFixedBase || '0'))} + (Area × {formatCurrency(parseFloat(localPerSqFtRate || '0'), true)})
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400"><strong>Fixed Base:</strong> Common expenses (security, electricity, etc.) divided equally among all villas</p>
                    <p className="text-xs text-slate-400 mt-1"><strong>Variable Rate:</strong> Size-dependent costs calculated per square foot</p>
                  </div>
                </div>
              </div>
              
              {/* Flat Rate Calculation */}
              <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-800/40">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Flat Rate Formula (Alternative)</h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <p className="font-mono">Plot Area × Per Sq.ft Rate = Flat Total</p>
                  <div className="pl-4 space-y-1 text-xs text-slate-400">
                    <p>• Simple area-based calculation</p>
                    <p>• No fixed component</p>
                    <p className="font-mono text-cyan-400 mt-2">
                      Area × {formatCurrency(parseFloat(localPerSqFtRate || '0'), true)}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400"><strong>Flat Rate:</strong> Total monthly expenses divided by total occupied square footage across all villas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculation Examples */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-4">Live Calculation Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400">1,200 Sq.ft Villa</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Hybrid Model:</span>
                      <span className="text-sm font-mono font-bold text-violet-400">
                        {formatCurrency(parseFloat(localFixedBase || '0') + (1200 * parseFloat(localPerSqFtRate || '0')))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Flat Rate Model:</span>
                      <span className="text-sm font-mono font-bold text-cyan-400">
                        {formatCurrency(1200 * 2.15)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400">1,456 Sq.ft Villa</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Hybrid Model:</span>
                      <span className="text-sm font-mono font-bold text-violet-400">
                        {formatCurrency(parseFloat(localFixedBase || '0') + (1456 * parseFloat(localPerSqFtRate || '0')))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Flat Rate Model:</span>
                      <span className="text-sm font-mono font-bold text-cyan-400">
                        {formatCurrency(1456 * 2.15)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="bg-slate-900/30 border border-indigo-500/30 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Rate Change Impact</h2>
        <p className="text-sm text-slate-400 mb-4">
          Adjusting the per sq.ft rate or fixed base amount will immediately affect all villa maintenance
          calculations across the entire society. Changes will be reflected in resident dashboards and
          ledger entries.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Current Hybrid Rate Impact</p>
            <p className="text-sm text-slate-300">
              Small villas benefit from shared fixed costs while larger villas pay proportionally more.
            </p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Flat Rate Alternative</p>
            <p className="text-sm text-slate-300">
              Purely proportional distribution based on square footage only.
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
      />
    </div>
  );
}
