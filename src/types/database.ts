// Database model types (matching Prisma schema)

import { UserRole, ResetStatus } from './auth';
import { RequestType, RequestStatus } from './index';

export interface DbUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  emailVerified: Date | null;
  plotNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbSession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbPasswordResetRequest {
  id: string;
  userId: string;
  status: ResetStatus;
  requestedAt: Date;
  approvedAt: Date | null;
  approvedBy: string | null;
  expiresAt: Date;
  token: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbResidentRequest {
  id: string;
  userId: string;
  plotNumber: string;
  requestType: RequestType;
  status: RequestStatus;
  description: string;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  newPlotSize: number | null;
  familyMemberName: string | null;
  familyMemberRelation: string | null;
  familyMemberContact: string | null;
}

export interface DbFamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  contact: string;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbLedgerEntry {
  id: string;
  userId: string | null;
  date: Date;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category: 'CORE_OPERATIONS' | 'SINKING_FUND';
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbSocietySettings {
  id: string;
  perSqFtRate: number;
  fixedBaseAmount: number;
  sinkingFundPercentage: number;
  securityExpense: number;
  electricityExpense: number;
  miscExpense: number;
  cleaningExpense: number;
  garbageExpense: number;
  gymExpense: number;
  stpMaintenanceExpense: number;
  emergencyFundExpense: number;
  createdAt: Date;
  updatedAt: Date;
}