'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Plus, Calendar } from 'lucide-react';
import MonthSelector from '@/components/atoms/MonthSelector';
import PageLoader from '@/components/atoms/PageLoader';
import Toast from '@/components/atoms/Toast';
import ExpenseChart from '@/components/molecules/ExpenseChart';
import ExpenseList from '@/components/molecules/ExpenseList';
import ExpenseForm from '@/components/molecules/ExpenseForm';
import Modal from '@/components/molecules/Modal';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';

interface Expense {
  id: string;
  month: number;
  year: number;
  category: string;
  amount: number;
  description?: string;
}



interface ExpenseManagerProps {
  isAdmin: boolean;
}

export default function ExpenseManager({ isAdmin }: ExpenseManagerProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info',
  });

  // Toast notification state
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    variant: 'success' | 'error' | 'info' | 'warning';
  }>({
    isVisible: false,
    message: '',
    variant: 'success',
  });

  // Fetch expenses data
  useEffect(() => {
    let isMounted = true;

    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const expensesRes = await fetch(`/api/expenses?month=${selectedMonth}&year=${selectedYear}`);

        if (!expensesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const expensesData = await expensesRes.json();

        if (isMounted) {
          setExpenses(expensesData.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          console.error('Error fetching data:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchExpenses();

    return () => {
      isMounted = false;
    };
  }, [selectedMonth, selectedYear]);

  // Refetch function for manual refresh after mutations
  const refetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const expensesRes = await fetch(`/api/expenses?month=${selectedMonth}&year=${selectedYear}`);

      if (!expensesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const expensesData = await expensesRes.json();
      setExpenses(expensesData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Expense handlers
  const handleAddExpense = async (data: { category: string; amount: number; description?: string } | { category: string; amount: number; description?: string }[]) => {
    setIsSubmitting(true);
    try {
      let requestBody;
      
      // Check if data is an array (bulk submission)
      if (Array.isArray(data)) {
        requestBody = {
          month: selectedMonth,
          year: selectedYear,
          expenses: data,
        };
      } else {
        requestBody = {
          ...data,
          month: selectedMonth,
          year: selectedYear,
        };
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to add expense');
      }

      const result = await response.json();
      
      // Show success message via toast
      const count = Array.isArray(data) ? result.count : 1;
      setToast({
        isVisible: true,
        message: `Successfully added ${count} expense${count > 1 ? 's' : ''}!`,
        variant: 'success',
      });

      await refetchData();
      setIsExpenseModalOpen(false);
    } catch (err) {
      setToast({
        isVisible: true,
        message: err instanceof Error ? err.message : 'Failed to add expense',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExpense = async (data: { category: string; amount: number; description?: string } | { category: string; amount: number; description?: string }[]) => {
    if (!editingExpense) return;

    // Update should always be single expense, not array
    const singleData = Array.isArray(data) ? data[0] : data;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingExpense.id,
          ...singleData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update expense');
      }

      setToast({
        isVisible: true,
        message: 'Expense updated successfully!',
        variant: 'success',
      });

      await refetchData();
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
    } catch (err) {
      setToast({
        isVisible: true,
        message: err instanceof Error ? err.message : 'Failed to update expense',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Expense',
      message: `Are you sure you want to delete the "${expense.category}" expense? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setIsSubmitting(true);
        try {
          const response = await fetch(`/api/expenses?id=${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete expense');
          }

          await refetchData();
          
          // Show success toast instead of modal
          setToast({
            isVisible: true,
            message: 'Expense deleted successfully!',
            variant: 'success',
          });
        } catch (err) {
          // Show error toast instead of modal
          setToast({
            isVisible: true,
            message: err instanceof Error ? err.message : 'Failed to delete expense',
            variant: 'error',
          });
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleEditExpense = (expense: { id: string; category: string; amount: number; description?: string }) => {
    // Find the full expense with month and year from the state
    const fullExpense = expenses.find(e => e.id === expense.id);
    if (fullExpense) {
      setEditingExpense(fullExpense);
      setIsExpenseModalOpen(true);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-7 h-7 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Expense Manager</h1>
            <p className="text-sm text-slate-400">
              {isAdmin 
                ? 'Track monthly expenses' 
                : 'View monthly expenses (Read-only)'}
            </p>
          </div>
        </div>
        
        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
        />
      </div>

      {/* Action Buttons */}
      {isAdmin && (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      )}



      {/* Loading State */}
      {loading && <PageLoader message="Loading expense data..." />}

      {/* Full Screen Loader for Submissions */}
      {isSubmitting && <PageLoader message="Processing..." fullScreen />}

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Expense Chart */}
          <ExpenseChart
            expenses={expenses.map((e) => ({ category: e.category, amount: e.amount }))}
            totalExpenses={totalExpenses}
          />

          {/* Expense List */}
          <ExpenseList
            expenses={expenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            isAdmin={isAdmin}
          />
        </>
      )}

      {/* Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        size={editingExpense ? 'md' : 'lg'}
      >
        <ExpenseForm
          onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
          onCancel={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          initialData={editingExpense || undefined}
          isEdit={!!editingExpense}
          allowMultiple={!editingExpense}
        />
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        loading={isSubmitting}
      />

      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast({ ...toast, isVisible: false })}
        duration={3000}
      />
    </div>
  );
}