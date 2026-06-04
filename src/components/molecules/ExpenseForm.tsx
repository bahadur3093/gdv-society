'use client';

import { useState } from 'react';
import { Plus, X, Check, Trash2 } from 'lucide-react';

interface ExpenseFormData {
  category: string;
  amount: string;
  description: string;
}

interface ExpenseFormProps {
  onSubmit: (data: { category: string; amount: number; description?: string } | { category: string; amount: number; description?: string }[]) => void;
  onCancel: () => void;
  initialData?: { category: string; amount: number; description?: string };
  isEdit?: boolean;
  allowMultiple?: boolean;
}

export default function ExpenseForm({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
  allowMultiple = false,
}: ExpenseFormProps) {
  const [expenses, setExpenses] = useState<ExpenseFormData[]>([
    {
      category: initialData?.category || '',
      amount: initialData?.amount?.toString() || '',
      description: initialData?.description || '',
    },
  ]);

  const [errors, setErrors] = useState<Record<number, Partial<ExpenseFormData>>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<number, Partial<ExpenseFormData>> = {};
    let isValid = true;

    expenses.forEach((expense, index) => {
      const expenseErrors: Partial<ExpenseFormData> = {};

      if (!expense.category.trim()) {
        expenseErrors.category = 'Category is required';
        isValid = false;
      }

      const amount = parseFloat(expense.amount);
      if (!expense.amount || isNaN(amount) || amount < 0) {
        expenseErrors.amount = 'Valid amount is required';
        isValid = false;
      }

      if (Object.keys(expenseErrors).length > 0) {
        newErrors[index] = expenseErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const addExpense = () => {
    setExpenses([...expenses, { category: '', amount: '', description: '' }]);
  };

  const removeExpense = (index: number) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((_, i) => i !== index));
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const updateExpense = (index: number, field: keyof ExpenseFormData, value: string) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setExpenses(updatedExpenses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (allowMultiple && expenses.length > 1) {
      const formattedExpenses = expenses.map(expense => ({
        category: expense.category.trim(),
        amount: parseFloat(expense.amount),
        description: expense.description.trim() || undefined,
      }));
      onSubmit(formattedExpenses);
    } else {
      onSubmit({
        category: expenses[0].category.trim(),
        amount: parseFloat(expenses[0].amount),
        description: expenses[0].description.trim() || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 py-4">
      {/* Compact Table Layout for Multiple Expenses */}
      {allowMultiple ? (
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-700/50 rounded-lg overflow-hidden">
            <thead className="bg-slate-800/50">
              <tr className="text-xs text-slate-300 uppercase">
                <th className="px-3 py-2 text-left font-semibold">#</th>
                <th className="px-3 py-2 text-left font-semibold">Category *</th>
                <th className="px-3 py-2 text-left font-semibold">Amount (₹) *</th>
                <th className="px-3 py-2 text-left font-semibold">Description</th>
                <th className="px-3 py-2 text-center font-semibold w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {expenses.map((expense, index) => (
                <tr key={index} className="hover:bg-slate-800/20">
                  <td className="px-3 py-2 text-sm text-slate-400">{index + 1}</td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={expense.category}
                      onChange={(e) => updateExpense(index, 'category', e.target.value)}
                      className={`w-full px-2 py-1.5 text-sm bg-slate-900/50 border rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 ${
                        errors[index]?.category
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-700 focus:ring-violet-500'
                      }`}
                      placeholder="Category"
                    />
                    {errors[index]?.category && (
                      <p className="text-xs text-red-400 mt-0.5">{errors[index].category}</p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={expense.amount}
                      onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                      className={`w-full px-2 py-1.5 text-sm bg-slate-900/50 border rounded text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-1 ${
                        errors[index]?.amount
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-700 focus:ring-violet-500'
                      }`}
                      placeholder="0.00"
                    />
                    {errors[index]?.amount && (
                      <p className="text-xs text-red-400 mt-0.5">{errors[index].amount}</p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={expense.description}
                      onChange={(e) => updateExpense(index, 'description', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm bg-slate-900/50 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder="Optional notes"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeExpense(index)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                      title="Remove expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {allowMultiple && (
        <button
          type="button"
          onClick={addExpense}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-500/30 font-medium rounded-lg transition-all w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Another Expense
        </button>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <Check className="w-4 h-4" />
          {isEdit ? 'Update' : allowMultiple && expenses.length > 1 ? `Add ${expenses.length} Expenses` : 'Add Expense'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}