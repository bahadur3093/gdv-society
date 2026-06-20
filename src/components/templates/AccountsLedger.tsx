'use client';

import { formatCurrency, formatDate, MOCK_LEDGER_ENTRIES } from '@/utils';
import { Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import { useUser } from '../providers/UserProvider';


export default function AccountsLedger() {
  const user = useUser();
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No user data available</p>
      </div>
    );
  }

  // Separate entries by category
  const coreOperationsEntries = MOCK_LEDGER_ENTRIES.filter(
    (entry) => entry.category === 'core-operations'
  );

  const renderLedgerTable = (entries: typeof MOCK_LEDGER_ENTRIES, title: string, color: string) => (
    <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-4">{title}</h3>
      <div className="overflow-x-auto scroller-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/40">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Description</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Debit</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Credit</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-slate-800/20 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-slate-400">
                  {formatDate(entry.date)}
                </td>
                <td className="py-3 px-4 text-sm text-slate-300">
                  {entry.description}
                </td>
                <td className="py-3 px-4 text-sm text-right font-mono">
                  {entry.type === 'debit' ? (
                    <span className="text-red-400 flex items-center justify-end gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {formatCurrency(entry.amount)}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-right font-mono">
                  {entry.type === 'credit' ? (
                    <span className="text-green-400 flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {formatCurrency(entry.amount)}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className={`py-3 px-4 text-sm text-right font-mono font-semibold ${color}`}>
                  {formatCurrency(entry.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Receipt className="w-8 h-8 text-violet-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Accounts Ledger</h1>
          <p className="text-slate-400">Transaction history and balance tracking</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
          <p className="text-sm text-slate-400 mb-2">Core Operations Balance</p>
          <p className="text-2xl font-bold font-mono text-violet-400">
            {formatCurrency(coreOperationsEntries[0]?.balance || 0)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {coreOperationsEntries.length} transactions
          </p>
        </div>
      </div>

      {/* Core Operations Ledger */}
      {renderLedgerTable(coreOperationsEntries, 'Core Operations', 'text-violet-400')}
    </div>
  );
}
