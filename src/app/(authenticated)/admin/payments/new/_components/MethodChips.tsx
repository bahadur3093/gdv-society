"use client";

import {
  Smartphone,
  Banknote,
  Building2,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { PaymentMethod } from "@prisma/client";
import { cn } from "@/lib/utils/utils";

interface Props {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const METHODS: Array<{
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    value: PaymentMethod.UPI,
    label: "UPI",
    icon: <Smartphone className="w-4 h-4" />,
  },
  {
    value: PaymentMethod.CASH,
    label: "Cash",
    icon: <Banknote className="w-4 h-4" />,
  },
  {
    value: PaymentMethod.BANK_TRANSFER,
    label: "Bank Transfer",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    value: PaymentMethod.CHEQUE,
    label: "Cheque",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    value: PaymentMethod.OTHER,
    label: "Other",
    icon: <MoreHorizontal className="w-4 h-4" />,
  },
];

export default function MethodChips({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Hidden input to bind value to form */}
      <input type="hidden" name="method" value={value} required />

      {METHODS.map((m) => {
        const isActive = value === m.value;
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className={cn(
              "inline-flex items-center gap-2",
              "px-4 h-10 rounded-full",
              "text-body-sm font-medium",
              "border",
              "transition-all duration-(--duration-fast)",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-primary/30 focus-visible:ring-offset-1",
              "focus-visible:ring-offset-bg-base",
              isActive
                ? "bg-brand-primary text-brand-primary-fg border-brand-primary shadow-sm"
                : "bg-transparent text-text-secondary border-border-default hover:bg-bg-sunken hover:text-text-primary",
            )}
            aria-pressed={isActive}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
