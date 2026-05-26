// Authentication and Authorization Types

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plotNumber?: string;
  emailVerified?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: string;
  user?: User;
}

export interface PasswordResetRequest {
  id: string;
  userId: string;
  status: ResetStatus;
  requestedAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  expiresAt: string;
  token?: string | null;
  user?: Pick<User, 'id' | 'email' | 'name'>;
  approver?: Pick<User, 'id' | 'email' | 'name'>;
}

export type ResetStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'EXPIRED' | 'DENIED';

// Authentication request/response types
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  plotNumber?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ApproveResetRequest {
  requestId: string;
  adminId: string;
}

export interface DenyResetRequest {
  requestId: string;
  adminId: string;
}

// NextAuth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plotNumber?: string;
  emailVerified?: Date | null;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}