'use client';

import { useMemo } from 'react';

interface ExpenseData {
  category: string;
  amount: number;
}

interface ExpenseChartProps {
  expenses: ExpenseData[];
  totalExpenses: number;
  className?: string;
}

export default function ExpenseChart({
  expenses,
  totalExpenses,
  className = '',
}: ExpenseChartProps) {
  const chartData = useMemo(() => {
    if (totalExpenses === 0) return [];
    
    return expenses.map((expense) => ({
      ...expense,
      percentage: (expense.amount / totalExpenses) * 100,
    }));
  }, [expenses, totalExpenses]);

  const colors = [
    'bg-violet-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-fuchsia-500',
  ];

  if (expenses.length === 0) {
    return (
      <div className={`bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 ${className}`}>
        <p className="text-center text-slate-400">No expense data available for this month</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-bold text-slate-100 mb-4">Expense Distribution</h3>
      
      {/* Horizontal Bar Chart */}
      <div className="space-y-4 mb-6">
        {chartData.map((item, index) => (
          <div key={item.category} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300 capitalize">{item.category}</span>
              <span className="text-slate-400 font-mono">
                ₹{item.amount.toLocaleString('en-IN')} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-800/40 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${colors[index % colors.length]} transition-all duration-500 ease-out`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t border-slate-800/40">
        {chartData.map((item, index) => (
          <div key={item.category} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
            <span className="text-xs text-slate-400 capitalize truncate">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}