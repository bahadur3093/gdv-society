import type { RequestType, RequestStatus } from "@prisma/client";

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  PLOT_SIZE_UPDATE: "Plot Size Update",
  PAYMENT_ISSUE: "Payment Issue",
  EXPENSE_SHEET_MONTHLY: "Monthly Expense Sheet",
  EXPENSE_SHEET_YEARLY: "Yearly Expense Sheet",
  ADD_FAMILY_MEMBER: "Add Family Member",
  PASSWORD_RESET: "Password Reset",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
  REOPENED: "Reopened",
};

export const REQUEST_STATUS_TONES: Record<
  RequestStatus,
  "warning" | "info" | "success" | "danger" | "muted"
> = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  REJECTED: "danger",
  REOPENED: "warning",
};

// Which types show which extra fields on the form
export const REQUEST_TYPE_FIELDS: Record<
  RequestType,
  {
    needsPlotSize?: boolean;
    needsFamilyMember?: boolean;
    descriptionLabel?: string;
    descriptionPlaceholder?: string;
  }
> = {
  PLOT_SIZE_UPDATE: {
    needsPlotSize: true,
    descriptionLabel: "Why do you need this update?",
    descriptionPlaceholder: "Explain the reason for the plot size change...",
  },
  PAYMENT_ISSUE: {
    descriptionLabel: "Describe the payment issue",
    descriptionPlaceholder:
      "Include payment date, reference number, and what went wrong...",
  },
  EXPENSE_SHEET_MONTHLY: {
    descriptionLabel: "Which month?",
    descriptionPlaceholder: "e.g. March 2026",
  },
  EXPENSE_SHEET_YEARLY: {
    descriptionLabel: "Which year?",
    descriptionPlaceholder: "e.g. 2025",
  },
  ADD_FAMILY_MEMBER: {
    needsFamilyMember: true,
    descriptionLabel: "Additional notes",
    descriptionPlaceholder: "Any specific instructions...",
  },
  PASSWORD_RESET: {
    descriptionLabel: "Reason for reset",
    descriptionPlaceholder: "Explain why you need a password reset...",
  },
};

// Status transitions allowed by role
export const ADMIN_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> =
  {
    PENDING: ["IN_PROGRESS", "RESOLVED", "REJECTED"],
    IN_PROGRESS: ["RESOLVED", "REJECTED"],
    RESOLVED: [], // can only be reopened by resident
    REJECTED: ["IN_PROGRESS"],
    REOPENED: ["IN_PROGRESS", "RESOLVED", "REJECTED"],
  };
