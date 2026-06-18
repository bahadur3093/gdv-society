import { FinancialSettings } from '@/types';

// Default Financial Settings
export const DEFAULT_PER_SQFT_RATE = 2.15;
export const DEFAULT_SINKING_FUND_PERCENTAGE = 20;

// Total Villas in Society
export const TOTAL_VILLAS = 47;

// Application Screen Names
export const SCREENS = {
  AUTH: 'auth' as const,
  PENDING: 'pending' as const,
  DASHBOARD: 'dashboard' as const,
  LEDGER: 'ledger' as const,
  BREAKDOWN: 'breakdown' as const,
  MASTER_LEDGER: 'master-ledger' as const,
  ONBOARDING: 'onboarding' as const,
  SETTINGS: 'settings' as const,
  REQUESTS: 'requests' as const,
  ADMIN_REQUESTS: 'admin-requests' as const,
  USER_MANAGEMENT: 'user-management' as const,
  PLOT_LAYOUT: 'plot-layout' as const,
  CONFIG_MANAGEMENT: 'config-management' as const,
  EXPENSE_MANAGER: 'expense-manager' as const,
  ANNOUNCEMENTS: 'announcements' as const,
};

// Resident Navigation Items
export const RESIDENT_NAV_ITEMS = [
  { id: SCREENS.DASHBOARD, label: 'Dashboard Summary', icon: 'LayoutDashboard' },
  { id: SCREENS.LEDGER, label: 'Accounts Ledger', icon: 'Receipt' },
  { id: SCREENS.BREAKDOWN, label: 'Maintenance Breakdown', icon: 'Calculator' },
  { id: SCREENS.REQUESTS, label: 'My Requests', icon: 'FileText' },
  { id: SCREENS.PLOT_LAYOUT, label: 'Plot Layout Map', icon: 'Map' },
];

// Admin Navigation Items
export const ADMIN_NAV_ITEMS = [
  { id: SCREENS.MASTER_LEDGER, label: 'Villa Ledger', icon: 'Table' },
  { id: SCREENS.ONBOARDING, label: 'Villa Onboarding', icon: 'UserPlus' },
  { id: SCREENS.USER_MANAGEMENT, label: 'User Management', icon: 'Users' },
  { id: SCREENS.SETTINGS, label: 'Settings', icon: 'Settings' },
  { id: SCREENS.ADMIN_REQUESTS, label: 'Requests', icon: 'FileText' },
  { id: SCREENS.CONFIG_MANAGEMENT, label: 'Config Management', icon: 'Cog' },
  { id: SCREENS.EXPENSE_MANAGER, label: 'Expense Manager', icon: 'Database' },
  { id: SCREENS.PLOT_LAYOUT, label: 'Plot Layout Map', icon: 'Map' },
  { id: SCREENS.ANNOUNCEMENTS, label: 'Announcements', icon: 'Bell' },
];

// Mock Ledger Entries for Demonstration
export const MOCK_LEDGER_ENTRIES = [
  {
    id: '1',
    date: '2026-05-01',
    description: 'Monthly Maintenance - May 2026',
    amount: 2652.0,
    type: 'debit' as const,
    category: 'core-operations' as const,
    balance: 2652.0,
  },
  {
    id: '2',
    date: '2026-04-01',
    description: 'Monthly Maintenance - April 2026',
    amount: 2652.0,
    type: 'debit' as const,
    category: 'core-operations' as const,
    balance: 5304.0,
  },
  {
    id: '3',
    date: '2026-03-15',
    description: 'Payment Received',
    amount: 2652.0,
    type: 'credit' as const,
    category: 'core-operations' as const,
    balance: 2652.0,
  },
  {
    id: '4',
    date: '2026-03-01',
    description: 'Monthly Maintenance - March 2026',
    amount: 2652.0,
    type: 'debit' as const,
    category: 'core-operations' as const,
    balance: 5304.0,
  },
  {
    id: '5',
    date: '2026-02-15',
    description: 'Payment Received',
    amount: 2652.0,
    type: 'credit' as const,
    category: 'core-operations' as const,
    balance: 2652.0,
  },
  {
    id: '6',
    date: '2026-02-01',
    description: 'Sinking Fund Contribution',
    amount: 530.4,
    type: 'debit' as const,
    category: 'sinking-fund' as const,
    balance: 530.4,
  },
];

// Community Announcements
export const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Water Supply Maintenance',
    content: 'Water supply will be temporarily interrupted on Sunday, May 26th from 10 AM to 2 PM for routine maintenance.',
    publishDate: '2026-05-20',
    priority: 'high' as const,
  },
  {
    id: '2',
    title: 'Community Meeting',
    content: 'Monthly community meeting scheduled for June 1st at 6 PM in the community hall. All residents are encouraged to attend.',
    publishDate: '2026-05-18',
    priority: 'medium' as const,
  },
  {
    id: '3',
    title: 'Gym Equipment Upgrade',
    content: 'New cardio equipment has been installed in the community gym. Please follow the usage guidelines posted on-site.',
    publishDate: '2026-05-15',
    priority: 'low' as const,
  },
];
