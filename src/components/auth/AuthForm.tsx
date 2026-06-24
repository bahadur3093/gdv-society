import { cn } from "@/lib/utils/utils";
import { type ReactNode } from "react";

interface AuthFormProps {
  icon?: ReactNode;
  headline: string;
  subheading?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthForm({
  icon,
  headline,
  subheading,
  children,
  footer,
}: AuthFormProps) {
  return (
    <div className="w-full space-y-8">
      {/* Headline block */}
      <div className="space-y-3">
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl",
              "bg-(image:--gradient-brand)",
              "flex items-center justify-center",
              "shadow-md",
              "mb-6",
            )}
          >
            <span className="text-white">{icon}</span>
          </div>
        )}
        <h1 className="text-[32px] leading-tight font-bold text-text-primary tracking-tight">
          {headline}
        </h1>
        {subheading && (
          <p className="text-body text-text-muted">{subheading}</p>
        )}
      </div>

      {/* Form content */}
      <div>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="text-center text-body-sm text-text-muted pt-2">
          {footer}
        </div>
      )}
    </div>
  );
}
