'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/atoms/Card';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Typography } from '@/components/atoms/Typography';
import {
  calculateMaintenanceCostPerSqFt,
  calculateFixedExpensePerVilla,
  calculateFlatRateMaintenance,
} from '@/lib/utils/calculations';
import type { PlotData } from '@/types';
import { Menu, X } from 'lucide-react';
import { PageLoader } from '@/components';

interface ExpenseItem {
  id: string;
  name: string;
  value: number;
}

interface VillaCalculation {
  villaNo: number;
  ownerName: string;
  areaInSqFt: number;
  fixedExpense: number;
  variableAmount: number;
  hybridExpense: number;
  flatRate: number;
}

export default function MaintenanceCalculatorPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: '1', name: 'Security', value: 63000 },
    { id: '2', name: 'Electricity', value: 25000 },
    { id: '3', name: 'Garbage', value: 3000 },
    { id: '4', name: 'Cleaning', value: 5000 },
    { id: '5', name: 'Misc', value: 9000 },
    { id: '6', name: 'Emergency fund', value: 21000 },
  ]);
  
  const [fixedExpenseIds, setFixedExpenseIds] = useState<Set<string>>(new Set(['1', '2']));
  
  const [villas, setVillas] = useState<PlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  useEffect(() => {
    const fetchVillas = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/villas');
        
        if (!response.ok) {
          throw new Error('Failed to fetch villa data');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setVillas(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching villas:', err);
        setError(err instanceof Error ? err.message : 'Failed to load villa data');
      } finally {
        setLoading(false);
      }
    };

    fetchVillas();
  }, []);

  const calculations = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
    
    const fixedExpenses = expenses
      .filter(exp => fixedExpenseIds.has(exp.id))
      .reduce((sum, exp) => sum + exp.value, 0);
    
    const hybridExpenses = expenses
      .filter(exp => !fixedExpenseIds.has(exp.id))
      .reduce((sum, exp) => sum + exp.value, 0);
    
    const totalSquareFootage = villas
      .filter(villa => villa.villaNo !== 1 && villa.ownerName !== 'Not Occupied')
      .reduce((sum, villa) => sum + villa.areaInSqFt, 0);
    
    const maintenanceCostPerSqFt = calculateMaintenanceCostPerSqFt(
      totalExpenses,
      totalSquareFootage
    );
    
    const hybridCostPerSqFt = calculateMaintenanceCostPerSqFt(
      hybridExpenses,
      totalSquareFootage
    );
    
    const fixedExpensePerVilla = calculateFixedExpensePerVilla(
      fixedExpenses,
      villas.length
    );
    const villaCalculations: VillaCalculation[] = villas.map(villa => {
      const variableAmount = calculateFlatRateMaintenance(
        villa.areaInSqFt,
        hybridCostPerSqFt
      );
      
      const hybridExpense = fixedExpensePerVilla + variableAmount;
      
      const flatRate = calculateFlatRateMaintenance(
        villa.areaInSqFt,
        maintenanceCostPerSqFt
      );
      
      return {
        villaNo: villa.villaNo,
        ownerName: villa.ownerName,
        areaInSqFt: villa.areaInSqFt,
        fixedExpense: fixedExpensePerVilla,
        variableAmount,
        hybridExpense,
        flatRate,
      };
    });
    
    return {
      totalExpenses,
      fixedExpenses,
      hybridExpenses,
      totalSquareFootage,
      maintenanceCostPerSqFt,
      hybridCostPerSqFt,
      fixedExpensePerVilla,
      villaCalculations,
    };
  }, [expenses, fixedExpenseIds, villas]);

  const handleAddExpense = () => {
    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      name: '',
      value: 0,
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleExpenseNameChange = (id: string, name: string) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? { ...exp, name } : exp
    ));
  };

  const handleExpenseValueChange = (id: string, value: number) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? { ...exp, value } : exp
    ));
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
    setFixedExpenseIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleToggleFixedExpense = (id: string) => {
    setFixedExpenseIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out p-6 flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out p-6 flex items-center justify-center">
        <Card variant="basic" elevation="medium" padding="lg" className="max-w-md">
          <Typography variant="h3" className="text-red-500 mb-4">
            Error
          </Typography>
          <Typography variant="body" className="text-text-muted">
            {error}
          </Typography>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out">
      <button
        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-brand-primary text-white p-3 rounded-full shadow-lg hover:bg-brand-primary/90 transition-colors"
        aria-label="Toggle configuration panel"
      >
        {isSidePanelOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isSidePanelOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidePanelOpen(false)}
        />
      )}

      <div
        className={`
          fixed md:static top-0 left-0 h-full md:h-auto
          w-[85%] max-w-md md:max-w-none md:w-auto
          bg-background md:bg-transparent
          z-40 md:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto md:overflow-visible
          shadow-2xl md:shadow-none
        `}
      >
        <div className="p-4 md:p-1 md:max-w-7xl md:mx-auto">
          <div className="md:hidden mb-6 pt-12">
            <Typography variant="h2" className="mb-2 text-xl">
              Configuration
            </Typography>
            <Typography variant="small" className="text-text-muted text-sm">
              Set up your expenses
            </Typography>
          </div>

          <Card variant="basic" elevation="medium" padding="lg">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <Typography variant="h3" className="text-lg sm:text-xl md:text-2xl">Expense Configuration</Typography>
              <Button
                variant="primary"
                size="md"
                onClick={handleAddExpense}
                className="w-full sm:w-auto"
              >
                Add Expense
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4 items-start p-3 sm:p-4 bg-surface rounded-lg border border-border"
                >
                  <div className="sm:col-span-2 md:col-span-5">
                    <Input
                      placeholder="Expense Name"
                      value={expense.name}
                      onChange={(e) => handleExpenseNameChange(expense.id, e.target.value)}
                      size="md"
                      className="w-full"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={expense.value || ''}
                      onChange={(e) => handleExpenseValueChange(expense.id, parseFloat(e.target.value) || 0)}
                      size="md"
                      className="w-full"
                    />
                  </div>
                  <div className="sm:col-span-1 md:col-span-3 flex items-center">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fixedExpenseIds.has(expense.id)}
                        onChange={() => handleToggleFixedExpense(expense.id)}
                        className="w-4 h-4 text-brand-primary border-border rounded focus:ring-brand-primary"
                      />
                      <Typography variant="small" className="text-xs sm:text-sm">Fixed Expense</Typography>
                    </label>
                  </div>
                  <div className="sm:col-span-1 md:col-span-1 flex items-center justify-start sm:justify-end">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveExpense(expense.id)}
                      className="w-full sm:w-auto"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div className="hidden md:block text-center mb-4 sm:mb-6 md:mb-8">
            <Typography variant="h1" className="mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              Maintenance Calculator
            </Typography>
            <Typography variant="body" className="text-text-muted text-sm sm:text-base">
              Configure expenses and calculate maintenance costs for all villas
            </Typography>
          </div>

          <div className="md:hidden text-center mb-4 pt-16">
            <Typography variant="h1" className="mb-2 text-2xl">
              Maintenance Calculator
            </Typography>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="statistics" elevation="medium" padding="lg" className="p-4 sm:p-6">
            <Typography variant="small" className="text-text-muted mb-2 text-xs sm:text-sm">
              Total Expenses
            </Typography>
            <Typography variant="h4" className="text-brand-primary text-lg sm:text-xl md:text-2xl wrap-break-word">
              {formatCurrency(calculations.totalExpenses)}
            </Typography>
          </Card>
          
          <Card variant="statistics" elevation="medium" padding="lg" className="p-4 sm:p-6">
            <Typography variant="small" className="text-text-muted mb-2 text-xs sm:text-sm">
              Fixed Expenses
            </Typography>
            <Typography variant="h4" className="text-brand-secondary text-lg sm:text-xl md:text-2xl wrap-break-word">
              {formatCurrency(calculations.fixedExpenses)}
            </Typography>
          </Card>
          
          <Card variant="statistics" elevation="medium" padding="lg" className="p-4 sm:p-6">
            <Typography variant="small" className="text-text-muted mb-2 text-xs sm:text-sm">
              Hybrid Expenses
            </Typography>
            <Typography variant="h4" className="text-green-600 text-lg sm:text-xl md:text-2xl wrap-break-word">
              {formatCurrency(calculations.hybridExpenses)}
            </Typography>
          </Card>
          
          <Card variant="statistics" elevation="medium" padding="lg" className="p-4 sm:p-6">
            <Typography variant="small" className="text-text-muted mb-2 text-xs sm:text-sm">
              Total Residential Area
            </Typography>
            <Typography variant="h4" className="text-blue-600 text-lg sm:text-xl md:text-2xl wrap-break-word">
              {calculations.totalSquareFootage.toLocaleString()} sq. ft.
            </Typography>
          </Card>
          
          <Card variant="statistics" elevation="medium" padding="lg" className="p-4 sm:p-6">
            <Typography variant="small" className="text-text-muted mb-2 text-xs sm:text-sm">
              Cost per Sq. Ft.
            </Typography>
            <Typography variant="h4" className="text-purple-600 text-lg sm:text-xl md:text-2xl wrap-break-word">
              {formatCurrency(calculations.maintenanceCostPerSqFt)}
            </Typography>
          </Card>
          
          <Card variant="statistics" elevation="medium" padding="lg" className="p-4 sm:p-6">
            <Typography variant="small" className="text-text-muted mb-2 text-xs sm:text-sm">
              Hybrid Cost per Sq. Ft.
            </Typography>
            <Typography variant="h4" className="text-orange-600 text-lg sm:text-xl md:text-2xl wrap-break-word">
              {formatCurrency(calculations.hybridCostPerSqFt)}
            </Typography>
          </Card>
        </div>

        <Card variant="basic" elevation="medium" padding="lg" className="p-3 sm:p-4 md:p-6">
          <Typography variant="h3" className="mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl">
            Villa-wise Maintenance Breakdown
          </Typography>
          
          <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-muted font-medium text-xs sm:text-sm whitespace-nowrap">
                        Villa No.
                      </th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-text-muted font-medium text-xs sm:text-sm whitespace-nowrap">
                        Owner
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-text-muted font-medium text-xs sm:text-sm whitespace-nowrap">
                        Area (Sq. Ft.)
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-text-muted font-medium text-xs sm:text-sm whitespace-nowrap">
                        Fixed Expense
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-text-muted font-medium text-xs sm:text-sm whitespace-nowrap">
                        Variable Amount
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-text-muted font-medium text-xs sm:text-sm whitespace-nowrap">
                        Hybrid Total
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-text-muted font-medium text-xs sm:text-sm whitespace-nowrap">
                        Flat Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {calculations.villaCalculations.map((villa) => (
                      <tr
                        key={villa.villaNo}
                        className="border-b border-border hover:bg-surface/50 transition-colors"
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {villa.villaNo}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm max-w-25 sm:max-w-none truncate">
                          {villa.ownerName}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm whitespace-nowrap">
                          {villa.areaInSqFt.toLocaleString()}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-medium text-brand-secondary text-xs sm:text-sm whitespace-nowrap">
                          {formatCurrency(villa.fixedExpense)}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-medium text-blue-600 text-xs sm:text-sm whitespace-nowrap">
                          {formatCurrency(villa.variableAmount)}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-medium text-green-600 text-xs sm:text-sm whitespace-nowrap">
                          {formatCurrency(villa.hybridExpense)}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-medium text-purple-600 text-xs sm:text-sm whitespace-nowrap">
                          {formatCurrency(villa.flatRate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-surface/80 font-bold">
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm" colSpan={2}>
                        <Typography variant="body" className="font-bold text-xs sm:text-sm">
                          Total
                        </Typography>
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-right font-bold text-sm sm:text-base md:text-lg whitespace-nowrap">
                        {calculations.villaCalculations.reduce((sum, villa) => sum + villa.areaInSqFt, 0).toLocaleString()}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-right"></td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-right font-bold text-sm sm:text-base md:text-lg text-blue-600 whitespace-nowrap">
                        {formatCurrency(calculations.villaCalculations.reduce((sum, villa) => sum + villa.variableAmount, 0))}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-right font-bold text-sm sm:text-base md:text-lg text-green-600 whitespace-nowrap">
                        {formatCurrency(calculations.villaCalculations.reduce((sum, villa) => sum + villa.hybridExpense, 0))}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-right font-bold text-sm sm:text-base md:text-lg text-purple-600 whitespace-nowrap">
                        {formatCurrency(calculations.villaCalculations.reduce((sum, villa) => sum + villa.flatRate, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </Card>

        <Card variant="basic" elevation="low" padding="lg" className="bg-surface/50 p-3 sm:p-4 md:p-6">
          <Typography variant="h4" className="mb-3 sm:mb-4 text-base sm:text-lg md:text-xl">
            Calculation Formulas
          </Typography>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-text-muted">
            <div className="wrap-break-word">
              <strong className="block sm:inline">Maintenance Cost per Sq. Ft.</strong> <span className="hidden sm:inline">=</span><span className="block sm:inline mt-1 sm:mt-0">Total Expenses / Total Square Footage</span>
            </div>
            <div className="wrap-break-word">
              <strong className="block sm:inline">Hybrid Cost per Sq. Ft.</strong> <span className="hidden sm:inline">=</span><span className="block sm:inline mt-1 sm:mt-0">Hybrid Expenses / Total Square Footage</span>
            </div>
            <div className="wrap-break-word">
              <strong className="block sm:inline">Fixed Expense per Villa</strong> <span className="hidden sm:inline">=</span><span className="block sm:inline mt-1 sm:mt-0">Total Fixed Expenses / Total Villas</span>
            </div>
            <div className="wrap-break-word">
              <strong className="block sm:inline">Variable Amount</strong> <span className="hidden sm:inline">=</span><span className="block sm:inline mt-1 sm:mt-0">Villa Area × Hybrid Cost per Sq. Ft.</span>
            </div>
            <div className="wrap-break-word">
              <strong className="block sm:inline">Hybrid Total</strong> <span className="hidden sm:inline">=</span><span className="block sm:inline mt-1 sm:mt-0">Fixed Expense + Variable Amount</span>
            </div>
            <div className="wrap-break-word">
              <strong className="block sm:inline">Flat Rate</strong> <span className="hidden sm:inline">=</span><span className="block sm:inline mt-1 sm:mt-0">Villa Area × Maintenance Cost per Sq. Ft.</span>
            </div>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}