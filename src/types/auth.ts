// src/types/auth.ts

export type UserRole = "RESIDENT" | "ADMIN";

export type ResetStatus =
  | "PENDING"
  | "APPROVED"
  | "COMPLETED"
  | "EXPIRED"
  | "DENIED";

// ─────────────────────────────────────────────────────────
// Domain types — your DB representations
// ─────────────────────────────────────────────────────────

/**
 * App-level user representation (for API responses, UI display, etc.)
 * NOT the NextAuth Session user — for that, use `Session["user"]` from next-auth.
 */
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plotNumber?: string;
  emailVerified?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppUserWithPassword extends AppUser {
  password: string;
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
  user?: Pick<AppUser, "id" | "email" | "name">;
  approver?: Pick<AppUser, "id" | "email" | "name">;
}

// ─────────────────────────────────────────────────────────
// Request/Response DTOs for your auth API routes
// ─────────────────────────────────────────────────────────

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