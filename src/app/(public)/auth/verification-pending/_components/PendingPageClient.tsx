"use client";

import { useState, useTransition } from "react";
import { Hourglass, Info, LogOut, MessageCircle } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { pingAdminAction, signOutFromPendingAction } from "../actions";
import { toast } from "@/components/atoms/Toast";
import { cn } from "@/lib/utils/utils";

interface Props {
  userEmail: string;
  userName: string;
}

export default function PendingPageClient({ userEmail, userName }: Props) {
  const [isSigningOut, startSignOutTransition] = useTransition();

  const [isPinging, startPing] = useTransition();
  const [lastPinged, setLastPinged] = useState<number | null>(null);

  const handlePing = () => {
    // Rate limit: 5 min between pings
    if (lastPinged && Date.now() - lastPinged < 10 * 1000) {
      toast.warning("Please wait a few minutes before notifying again");
      return;
    }

    startPing(async () => {
      const result = await pingAdminAction();
      if (result.success) {
        toast.success(result.message);
        setLastPinged(Date.now());
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleSignOut = () => {
    startSignOutTransition(async () => {
      try {
        await signOutFromPendingAction();
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("NEXT_REDIRECT")) {
          throw e;
        }

        toast.error("Failed to sign out", {
          description: e instanceof Error ? e.message : "Please try again",
        });
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
        <div
          className={cn(
            "flex items-start gap-3 p-4 rounded-md",
            "bg-info-muted border border-info-border",
          )}
        >
          <MessageCircle className="w-5 h-5 text-info shrink-0 mt-0.5" />
          <p className="text-body-sm text-info">
            Our admin has been notified. You'll be able to sign in as soon as
            your account is approved.
          </p>
        </div>
        <div className="space-y-4">
          <button
            type="button"
            onClick={handlePing}
            disabled={isPinging}
            className={cn(
              "inline-flex items-center justify-center gap-2",
              "h-12 px-6 rounded-full",
              "bg-(image:--gradient-brand)",
              "text-white font-semibold",
              "shadow-lg shadow-brand-primary/20",
              "transition-all duration-(--duration-fast)",
              "hover:opacity-95 active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <MessageCircle className="w-4 h-4" />
            <span>
              {isPinging ? "Notifying admin..." : "Notify admin again"}
            </span>
          </button>

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
        </div>
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
