// Re-export authentication types
import type { UserRole as AuthUserRole } from './auth';
export type { User, Session, PasswordResetRequest, ResetStatus, AuthUser, AuthSession, SignUpRequest, SignInRequest, ForgotPasswordRequest, ResetPasswordRequest } from './auth';
export type UserRole = AuthUserRole;

// Re-export API types
export type { ApiResponse, PaginatedResponse, ValidationError, ApiError, PaginationParams, FilterParams } from './api';
export { HttpStatus } from './api';

// Re-export database types
export type { DbUser, DbSession, DbPasswordResetRequest, DbResidentRequest, DbFamilyMember, DbLedgerEntry, DbSocietySettings } from './database';

// Application State Types
export type AccountStatus = 'pending' | 'approved';
export type ScreenType = 'auth' | 'pending' | 'dashboard' | 'ledger' | 'breakdown' | 'master-ledger' | 'onboarding' | 'settings' | 'requests' | 'admin-requests' | 'user-management' | 'plot-layout' | 'config-management' | 'expense-manager';

// Request Types
export type RequestType = 'PLOT_SIZE_UPDATE' | 'PAYMENT_ISSUE' | 'EXPENSE_SHEET_MONTHLY' | 'EXPENSE_SHEET_YEARLY' | 'ADD_FAMILY_MEMBER' | 'PASSWORD_RESET';
export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'REOPENED';

export interface ResidentRequest {
  id: string;
  residentId: string;
  residentName: string;
  plotNumber: string;
  requestType: RequestType;
  status: RequestStatus;
  description: string;
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  lastResidentReplyAt?: string;
  reopenedAt?: string;
  reopenCount?: number;
  // Type-specific fields
  newPlotSize?: number;
  familyMemberDetails?: {
    name: string;
    relationship: string;
    contact: string;
  };
}

// Request Comment Types
export interface RequestComment {
  id: string;
  requestId: string;
  authorId: string;
  authorName: string;
  authorRole: 'RESIDENT' | 'ADMIN';
  content: string;
  isAdminComment: boolean;
  createdAt: string;
  updatedAt: string;
}

// Application State Interface
export interface AppState {
  userRole: UserRole;
  accountStatus: AccountStatus;
  activeScreen: ScreenType;
  perSqFtRate: number;
  fixedBaseAmount: number;
  currentUser?: ResidentUser;
}

// Plot and Villa Data Types
export interface PlotData {
  villaNo: number;
  type: string;
  areaInSqM: number;
  remarks: string;
  ownerName: string;
  areaInSqFt: number;
  fixedAmount: number;
  variableAmount: number;
  hybridTotal: number;
  flatRate: number;
}

// User Types
export interface ResidentUser {
  id: string;
  fullName: string;
  email: string;
  plotNumber: string;
  plotData?: PlotData;
}

export interface PendingRegistration {
  id: string;
  fullName: string;
  email: string;
  plotNumber: string;
  requestedAt: string;
}

// Financial Calculation Types
export interface MaintenanceCalculation {
  fixedBase: number;
  variableRate: number;
  plotSize: number;
  hybridTotal: number;
  flatRate: number;
}

// Society Financial Settings
export interface SocietyExpenses {
  security: number;
  electricity: number;
  misc: number;
  cleaning: number;
  garbage: number;
  gym: number;
  stpMaintenance: number;
  emergencyFund: number;
}

export interface FinancialSettings {
  perSqFtRate: number;
  fixedBaseAmount: number;
  sinkingFundPercentage: number;
  expenses: SocietyExpenses;
}

// Ledger Entry Types
export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: 'core-operations' | 'sinking-fund';
  balance: number;
}

// Family Member Types
export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  contact: string;
  addedAt: string;
}

// App Configuration Types
export interface AppConfigItem {
  value: string;
  label: string;
  icon: string;
  description: string;
  enable: boolean;
}

export interface AppConfig {
  id: number;
  config_key: string;
  config_value: AppConfigItem[];
  updated_at: string;
}
