'use client';

import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  className?: string;
}

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  isAdmin,
  className = '',
}: ExpenseListProps) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (expenses.length === 0) {
    return (
      <div className={`bg-slate-900/30 border border-slate-800/40 rounded-lg p-4 ${className}`}>
        <p className="text-center text-slate-400 text-sm">No expenses recorded for this month</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900/30 border border-slate-800/40 rounded-lg overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-slate-800/40">
        <h3 className="text-base font-bold text-slate-100">Expense Breakdown</h3>
      </div>
      
      {/* Compact Table Layout */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/30">
            <tr className="text-xs text-slate-400 uppercase tracking-wider">
              <th className="px-4 py-2 text-left font-semibold">Category</th>
              <th className="px-4 py-2 text-left font-semibold">Description</th>
              <th className="px-4 py-2 text-right font-semibold">Amount</th>
              {isAdmin && <th className="px-4 py-2 text-center font-semibold w-24">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/20">
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="hover:bg-slate-800/20 transition-colors group"
              >
                <td className="px-4 py-2">
                  <p className="text-sm text-slate-300 capitalize font-medium">
                    {expense.category}
                  </p>
                </td>
                <td className="px-4 py-2">
                  <p className="text-xs text-slate-500 truncate max-w-xs">
                    {expense.description || '-'}
                  </p>
                </td>
                <td className="px-4 py-2 text-right">
                  <p className="text-sm font-mono font-semibold text-slate-100">
                    {formatCurrency(expense.amount)}
                  </p>
                </td>
                {isAdmin && (
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 bg-violet-600/80 hover:bg-violet-500 text-white rounded transition-all duration-200"
                        title="Edit Expense"
                        aria-label={`Edit ${expense.category} expense`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="p-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded transition-all duration-200"
                        title="Delete Expense"
                        aria-label={`Delete ${expense.category} expense`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-800/30 border-t-2 border-slate-700">
            <tr>
              <td colSpan={isAdmin ? 2 : 1} className="px-4 py-3">
                <p className="text-sm font-bold text-slate-100">Total Monthly Expenses</p>
              </td>
              <td className="px-4 py-3 text-right" colSpan={isAdmin ? 2 : 2}>
                <p className="text-lg font-bold font-mono text-indigo-400">
                  {formatCurrency(totalExpenses)}
                </p>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}