import Link from "next/link";
import { AlertTriangle, ArrowLeft, Mail, Clock } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface Props {
  reason: "not_found" | "expired" | "used" | "no_user";
}

const CONFIG = {
  not_found: {
    icon: AlertTriangle,
    title: "Invalid reset link",
    description:
      "This password reset link isn't valid. It may have been mistyped or already replaced by a newer request.",
    iconColor: "text-warning",
    iconBg: "bg-warning/15",
    iconBorder: "border-warning/30",
  },
  expired: {
    icon: Clock,
    title: "Link expired",
    description:
      "This reset link has expired. For security, links are only valid for 24 hours. You can request a new one to continue.",
    iconColor: "text-warning",
    iconBg: "bg-warning/15",
    iconBorder: "border-warning/30",
  },
  used: {
    icon: AlertTriangle,
    title: "Link already used",
    description:
      "This reset link has already been used. If you need to reset your password again, please request a new link.",
    iconColor: "text-info",
    iconBg: "bg-info/15",
    iconBorder: "border-info/30",
  },
  no_user: {
    icon: AlertTriangle,
    title: "Account not found",
    description:
      "The account associated with this reset link no longer exists. Please contact the society admin if you believe this is an error.",
    iconColor: "text-danger",
    iconBg: "bg-danger/15",
    iconBorder: "border-danger/30",
  },
};

export default function InvalidTokenView({ reason }: Props) {
  const config = CONFIG[reason];
  const Icon = config.icon;

  return (
    <div className="w-full space-y-8 text-center lg:text-left">
      {/* Icon */}
      <div className="flex justify-center lg:justify-start">
        <div
          className={cn(
            "w-20 h-20 rounded-full border",
            config.iconBg,
            config.iconBorder,
            "flex items-center justify-center",
          )}
        >
          <Icon className={cn("w-10 h-10", config.iconColor)} />
        </div>
      </div>

      {/* Title + description */}
      <div className="space-y-3">
        <h1 className="text-[32px] leading-tight font-bold text-text-primary tracking-tight">
          {config.title}
        </h1>
        <p className="text-body-lg text-text-secondary">{config.description}</p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {reason !== "no_user" && (
          <Link
            href={"/auth/forgot-password"}
            className={cn(
              "inline-flex items-center justify-center gap-2 w-full",
              "h-12 rounded-full",
              "bg-(image:--gradient-brand)",
              "text-white font-semibold",
              "shadow-lg shadow-brand-primary/20",
              "hover:opacity-95 active:scale-[0.98]",
              "transition-all duration-(--duration-fast)",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
              "focus-visible:ring-offset-bg-base",
            )}
          >
            <Mail className="w-4 h-4" />
            <span>Request new link</span>
          </Link>
        )}

        <Link
          href={"/auth/signin"}
          className={cn(
            "inline-flex items-center justify-center gap-2 w-full",
            "h-12 rounded-full",
            "bg-bg-elevated border border-border-default",
            "text-text-primary font-medium",
            "hover:bg-bg-sunken",
            "transition-colors duration-(--duration-fast)",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
            "focus-visible:ring-offset-bg-base",
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
}
