export type PaymentRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type BillStatus = 'PENDING' | 'PARTIAL' | 'PAID';

export type PaymentMethod =
  | 'UPI'
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'OTHER';

export type AdjustmentType =
  | 'LATE_FEE'
  | 'WAIVER'
  | 'CORRECTION'
  | 'WRITE_OFF'
  | 'DISCOUNT'
  | 'CREDIT_NOTE';

export type UserRole = 'RESIDENT' | 'ADMIN';
export type TransactionType = 'DEBIT' | 'CREDIT';
export type LedgerCategory = 'CORE_OPERATIONS' | 'SINKING_FUND';

export type RequestType =
  | 'PLOT_SIZE_UPDATE'
  | 'PAYMENT_ISSUE'
  | 'EXPENSE_SHEET_MONTHLY'
  | 'EXPENSE_SHEET_YEARLY'
  | 'ADD_FAMILY_MEMBER'
  | 'PASSWORD_RESET';

export type RequestStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'REOPENED';

export type ResetStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'DENIED';