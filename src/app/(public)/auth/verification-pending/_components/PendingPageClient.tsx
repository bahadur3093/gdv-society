"use client";

import { useTransition } from "react";
import {
  Hourglass,
  Info,
  ArrowRight,
  LogOut,
  MessageCircle,
} from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { signOutFromPendingAction } from "../actions";
import { toast } from "@/components/atoms/Toast";
import { cn } from "@/lib/utils/utils";

interface Props {
  userEmail: string;
  userName: string;
}

export default function PendingPageClient({ userEmail, userName }: Props) {
  const [isSigningOut, startSignOutTransition] = useTransition();

  const handleSignOut = () => {
    startSignOutTransition(async () => {
      try {
        await signOutFromPendingAction();
      } catch {
        toast.error("Failed to sign out. Please try again.");
      }
    });
  };

  return (
    <AuthLayout
      tagline="We can't wait to have you on board"
      brandVariant="time"
    >
      <div className="w-full space-y-8">
        {/* Header with floating icon */}
        <div className="text-center lg:text-left space-y-6">
          <div
            className={cn(
              "w-20 h-20 mx-auto lg:mx-0",
              "rounded-full",
              "bg-brand-primary/15 border border-brand-primary/30",
              "flex items-center justify-center",
              "animate-[float_4s_ease-in-out_infinite]",
            )}
          >
            <Hourglass
              className={cn(
                "w-10 h-10 text-brand-primary",
                "animate-[hourglass-flip_3s_cubic-bezier(0.77,0,0.175,1)_infinite]",
              )}
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-[32px] leading-tight font-bold text-text-primary tracking-tight">
              Almost ready!
            </h1>
            <p className="text-body-lg text-text-secondary">
              Your account is awaiting society admin approval
            </p>
          </div>
        </div>

        {/* Info card with numbered steps */}
        <div
          className={cn(
            "rounded-xl p-6 space-y-5",
            "bg-bg-sunken border border-border-subtle",
          )}
        >
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-brand-primary shrink-0" />
            <h3 className="text-h4 font-semibold text-text-primary">
              What happens next
            </h3>
          </div>

          <ul className="space-y-4">
            <Step
              number={1}
              title="Admin review"
              description="A community administrator will verify your details and society membership."
            />
            <Step
              number={2}
              title="Email confirmation"
              description="You'll receive a notification email once your access is granted."
            />
            <Step
              number={3}
              title="Sign in"
              description="Use this same email to sign in and start managing your account."
            />
          </ul>
        </div>

        {/* Current account info */}
        <div
          className={cn(
            "rounded-lg p-4",
            "bg-bg-elevated border border-border-subtle",
          )}
        >
          <p className="text-micro uppercase tracking-wider text-text-muted mb-1">
            Pending account
          </p>
          <p className="text-body text-text-primary font-medium truncate">
            {userName}
          </p>
          <p className="text-body-sm text-text-muted truncate">{userEmail}</p>
        </div>

        {/* Action links */}
        {/* <div className="space-y-4">
          <a
            href={`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(
              `Hi! I just signed up for GDV Society Hub.\n\nMy account (${userEmail}) is pending approval.\n\nName: ${userName}\n\nCould you please review and activate it? Thanks!`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2",
              "text-body font-medium text-brand-primary",
              "hover:text-brand-primary-hover hover:underline",
              "focus-visible:outline-none focus-visible:underline",
              "transition-colors duration-(--duration-fast)",
            )}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Message admin on WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={cn(
                "inline-flex items-center gap-2",
                "text-body-sm text-text-muted",
                "hover:text-text-primary",
                "focus-visible:outline-none focus-visible:text-text-primary",
                "transition-colors duration-(--duration-fast)",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <LogOut className="w-4 h-4" />
              <span>{isSigningOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </div> */}
      </div>
    </AuthLayout>
  );
}

// ─────────────────────────────────────────────────────────────
//  Step component (numbered list item)
// ─────────────────────────────────────────────────────────────

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-4">
      <span
        className={cn(
          "shrink-0 w-6 h-6 rounded-full",
          "bg-brand-primary/15 border border-brand-primary/30",
          "flex items-center justify-center",
          "font-mono text-body-sm font-semibold text-brand-primary",
        )}
      >
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-text-primary">{title}</p>
        <p className="text-body-sm text-text-secondary mt-0.5">{description}</p>
      </div>
    </li>
  );
}
