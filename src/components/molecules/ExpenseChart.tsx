'use client';

import { useMemo, useState } from 'react';

interface ExpenseData {
  category: string;
  amount: number;
}

interface ExpenseChartProps {
  expenses: ExpenseData[];
  totalExpenses: number;
  className?: string;
}

const chartColors = [
  ['#7c3aed', '#38bdf8', '#c4b5fd'],
  ['#06b6d4', '#22d3ee', '#67e8f9'],
  ['#4f46e5', '#93c5fd', '#a5b4fc'],
  ['#3b82f6', '#60a5fa', '#93c5fd'],
  ['#8b5cf6', '#c4b5fd', '#d8b4fe'],
  ['#ec4899', '#fb7185', '#f9a8d4'],
  ['#fb7185', '#fca5a5', '#fecaca'],
  ['#d946ef', '#f472b6', '#f5d0fe'],
];

const getPieSegmentPath = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const startRad = (Math.PI / 180) * startAngle;
  const endRad = (Math.PI / 180) * endAngle;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [`M ${cx} ${cy}`, `L ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, 'Z'].join(' ');
};

export default function ExpenseChart({
  expenses,
  totalExpenses,
  className = '',
}: ExpenseChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  const chartData = useMemo(() => {
    if (totalExpenses === 0) return [];

    return expenses.map((expense) => ({
      ...expense,
      percentage: (expense.amount / totalExpenses) * 100,
    }));
  }, [expenses, totalExpenses]);

  const pieSegments = useMemo(() => {
    let startAngle = -90;

    return chartData.map((item, index) => {
      const sweep = (item.percentage / 100) * 360;
      const endAngle = startAngle + sweep;
      const path = getPieSegmentPath(80, 80, 70, startAngle, endAngle);
      const segment = {
        category: item.category,
        path,
        color: chartColors[index % chartColors.length][0],
      };
      startAngle = endAngle;
      return segment;
    });
  }, [chartData]);

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
      
      {/* Mobile Pie Chart */}
      <div className="block md:hidden mb-6">
        <div className="mx-auto w-full max-w-[260px]">
          <svg viewBox="0 0 160 160" className="w-full h-auto">
            {pieSegments.map((segment) => (
              <path key={segment.category} d={segment.path} fill={segment.color} />
            ))}
            <circle cx="80" cy="80" r="44" fill="rgba(15, 23, 42, 0.95)" />
            <text x="80" y="72" textAnchor="middle" className="text-[10px] font-semibold fill-slate-200">
              Total
            </text>
            <text x="80" y="92" textAnchor="middle" className="text-sm font-semibold fill-slate-100">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </text>
          </svg>
        </div>
      </div>

      {/* Desktop Horizontal Stacked Bar */}
      <div className="hidden md:block mb-6">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-slate-300">All expenses</span>
          <span className="text-slate-400 font-mono">₹{totalExpenses.toLocaleString('en-IN')}</span>
        </div>
        <div className="relative">
          <div className="w-full bg-slate-800/40 rounded-full h-6 overflow-visible flex">
            {chartData.map((item, index) => (
              <div
                key={item.category}
                className="h-full transition-all duration-500 ease-out cursor-pointer hover:opacity-80 relative group"
                style={{
                  width: `${item.percentage}%`,
                  minWidth: item.percentage > 0 ? `${item.percentage}%` : '0.4%',
                  background: chartColors[index % chartColors.length][0],
                }}
                onMouseEnter={() => setHoveredCategory(item.category)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Custom Tooltip */}
                {hoveredCategory === item.category && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                    <div className="text-xs font-semibold text-slate-100 capitalize">{item.category}</div>
                    <div className="text-xs text-slate-300">₹{item.amount.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-slate-400">{item.percentage.toFixed(1)}%</div>
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-800/40">
        {chartData.map((item, index) => (
          <div key={item.category} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: chartColors[index % chartColors.length][0] }} />
            <span className="text-xs text-slate-400 capitalize truncate">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}