import {
  Ruler,
  CreditCard,
  FileText,
  Users,
  KeyRound,
  Calendar,
} from "lucide-react";
import type { RequestType } from "@prisma/client";

const ICONS: Record<
  RequestType,
  React.ComponentType<{ className?: string }>
> = {
  PLOT_SIZE_UPDATE: Ruler,
  PAYMENT_ISSUE: CreditCard,
  EXPENSE_SHEET_MONTHLY: FileText,
  EXPENSE_SHEET_YEARLY: Calendar,
  ADD_FAMILY_MEMBER: Users,
  PASSWORD_RESET: KeyRound,
};

export default function RequestTypeIcon({
  type,
  className,
}: {
  type: RequestType;
  className?: string;
}) {
  const Icon = ICONS[type];
  return <Icon className={className ?? "w-4 h-4"} />;
}
