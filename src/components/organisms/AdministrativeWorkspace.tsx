'use client';

import { ScreenType, PendingRegistration } from '@/types';
import { Table, UserPlus, Settings, FileText, Menu, X, LogOut, Users, Map, Database } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { SCREENS } from '@/utils';

// Import screen components
import MasterVillaLedger from '@/components/templates/MasterVillaLedger';
import VillaOnboardingQueue from '@/components/templates/VillaOnboardingQueue';
import SocietyFinancialSettings from '@/components/templates/SocietyFinancialSettings';
import AdminRequestManagement from '@/components/templates/AdminRequestManagement';
import AdminUserManagement from '@/components/templates/AdminUserManagement';
import PlotLayoutMap from '@/components/templates/PlotLayoutMap';
import ConfigManagement from '@/components/templates/ConfigManagement';
import ExpenseManager from '@/components/templates/ExpenseManager';

interface AdministrativeWorkspaceProps {
  activeScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
  perSqFtRate: number;
  sinkingFundPercentage: number;
  totalVillas: number;
  onUpdatePerSqFtRate: (rate: number) => void;
  onUpdateSinkingFund: (percentage: number) => void;
  onUpdateTotalVillas: (total: number) => void;
  pendingRegistrations: PendingRegistration[];
  onApproveRegistration: (id: string) => void;
  onDeclineRegistration: (id: string) => void;
}

const navItems = [
  { id: SCREENS.MASTER_LEDGER, label: 'Villa Ledger', icon: Table },
  { id: SCREENS.ONBOARDING, label: 'Villa Onboarding', icon: UserPlus },
  { id: SCREENS.USER_MANAGEMENT, label: 'User Management', icon: Users },
  { id: SCREENS.SETTINGS, label: 'Settings', icon: Settings },
  { id: SCREENS.ADMIN_REQUESTS, label: 'Requests', icon: FileText },
  { id: SCREENS.CONFIG_MANAGEMENT, label: 'Config Management', icon: Database },
  { id: SCREENS.EXPENSE_MANAGER, label: 'Expense Manager', icon: Database },
  { id: SCREENS.PLOT_LAYOUT, label: 'Plot Layout Map', icon: Map },
];

export default function AdministrativeWorkspace({
  activeScreen,
  onScreenChange,
  perSqFtRate,
  sinkingFundPercentage,
  totalVillas,
  onUpdatePerSqFtRate,
  onUpdateSinkingFund,
  onUpdateTotalVillas,
  pendingRegistrations,
  onApproveRegistration,
  onDeclineRegistration,
}: AdministrativeWorkspaceProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeScreen) {
      case SCREENS.MASTER_LEDGER:
        return (
          <MasterVillaLedger
            perSqFtRate={perSqFtRate}
          />
        );
      case SCREENS.ONBOARDING:
        return (
          <VillaOnboardingQueue
            pendingRegistrations={pendingRegistrations}
            onApprove={onApproveRegistration}
            onDecline={onDeclineRegistration}
          />
        );
      case SCREENS.USER_MANAGEMENT:
        return (
          <AdminUserManagement />
        );
      case SCREENS.SETTINGS:
        return (
          <SocietyFinancialSettings
            perSqFtRate={perSqFtRate}
            sinkingFundPercentage={sinkingFundPercentage}
            totalVillas={totalVillas}
            onUpdatePerSqFtRate={onUpdatePerSqFtRate}
            onUpdateSinkingFund={onUpdateSinkingFund}
            onUpdateTotalVillas={onUpdateTotalVillas}
          />
        );
      case SCREENS.ADMIN_REQUESTS:
        return <AdminRequestManagement />;
      case SCREENS.CONFIG_MANAGEMENT:
        return <ConfigManagement />;
      case SCREENS.EXPENSE_MANAGER:
        return <ExpenseManager isAdmin={true} />;
      case SCREENS.PLOT_LAYOUT:
        return <PlotLayoutMap userRole="admin" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-slate-900/50 border-b border-slate-800/40">
        <h1 className="text-lg font-bold text-slate-100">Admin Portal</h1>
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
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } lg:block lg:w-64 bg-slate-900/30 border-r border-slate-800/40 lg:min-h-screen transition-all duration-300 ease-in-out`}
      >
        <div className="p-6 sticky top-0">
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-slate-100 mb-1">Admin Portal</h1>
            <p className="text-sm text-slate-400">Management Dashboard</p>
          </div>

          {/* Admin Badge */}
          <div className="mb-6 p-4 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
            <p className="text-sm font-medium text-indigo-400">Administrator Access</p>
            <p className="text-xs text-slate-400 mt-1">Full system privileges</p>
          </div>

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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg'
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
