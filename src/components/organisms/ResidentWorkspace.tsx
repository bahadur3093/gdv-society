'use client';

import { ScreenType, ResidentUser } from '@/types';
import { LayoutDashboard, Receipt, Calculator, FileText, Menu, X, LogOut, Map, Database } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { SCREENS } from '@/utils';

// Import screen components
import DashboardSummary from '@/components/templates/DashboardSummary';
import AccountsLedger from '@/components/templates/AccountsLedger';
import MaintenanceBreakdown from '@/components/templates/MaintenanceBreakdown';
import ResidentRequests from '@/components/templates/ResidentRequests';
import PlotLayoutMap from '@/components/templates/PlotLayoutMap';
import ExpenseManager from '@/components/templates/ExpenseManager';

interface ResidentWorkspaceProps {
  activeScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
  currentUser?: ResidentUser;
  perSqFtRate: number;
}

const navItems = [
  { id: SCREENS.DASHBOARD, label: 'Summary', icon: LayoutDashboard },
  { id: SCREENS.LEDGER, label: 'Ledger', icon: Receipt },
  { id: SCREENS.BREAKDOWN, label: 'Maintenance', icon: Calculator },
  { id: SCREENS.REQUESTS, label: 'Requests', icon: FileText },
  { id: SCREENS.PLOT_LAYOUT, label: 'Layout', icon: Map },
  { id: SCREENS.EXPENSE_MANAGER, label: 'Expense', icon: Database },
];

export default function ResidentWorkspace({
  activeScreen,
  onScreenChange,
  currentUser,
  perSqFtRate,
}: ResidentWorkspaceProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeScreen) {
      case SCREENS.DASHBOARD:
        return (
          <DashboardSummary
            currentUser={currentUser}
          />
        );
      case SCREENS.LEDGER:
        return <AccountsLedger currentUser={currentUser} />;
      case SCREENS.BREAKDOWN:
        return (
          <MaintenanceBreakdown
            currentUser={currentUser}
            perSqFtRate={perSqFtRate}
          />
        );
      case SCREENS.REQUESTS:
        return (
          <ResidentRequests
            currentUser={currentUser}
          />
        );
      case SCREENS.PLOT_LAYOUT:
        return <PlotLayoutMap userRole="resident" />;
      case SCREENS.EXPENSE_MANAGER:
        return <ExpenseManager isAdmin={false} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-slate-900/50 border-b border-slate-800/40">
        <h1 className="text-lg font-bold text-slate-100">GDV Resident Hub</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${mobileMenuOpen ? 'block' : 'hidden'
          } lg:block lg:w-64 bg-slate-900/30 border-r border-slate-800/40 lg:min-h-screen transition-all duration-300 ease-in-out`}
      >
        <div className="p-6 sticky top-0">
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-slate-100 mb-1">GDV Resident Hub</h1>
            <p className="text-sm text-slate-400">Resident Portal</p>
          </div>

          {/* User Info */}
          {currentUser && (
            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800/40">
              <p className="text-sm font-medium text-slate-300 mb-1">{currentUser.fullName}</p>
              <p className="text-xs text-slate-500">Plot #{currentUser.plotNumber}</p>
              {currentUser.plotData && (
                <p className="text-xs text-cyan-400 mt-1 font-mono">
                  {currentUser.plotData.areaInSqFt.toFixed(2)} Sq.ft
                </p>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onScreenChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${isActive
                      ? 'bg-violet-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="mt-6 pt-6 border-t border-slate-800/40">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300 ease-in-out"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 transition-all duration-300 ease-in-out">
        {renderContent()}
      </main>
    </div>
  );
}
