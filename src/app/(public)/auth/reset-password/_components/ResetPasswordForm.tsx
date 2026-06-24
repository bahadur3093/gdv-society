"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import AuthForm from "@/components/auth/AuthForm";
import { resetPasswordAction, type ResetPasswordState } from "../actions";
import { cn } from "@/lib/utils/utils";

const initialState: ResetPasswordState = { status: "idle" };

interface Props {
  token: string;
  userEmail: string;
  userName: string;
}

export default function ResetPasswordForm({
  token,
  userEmail,
  userName,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(resetPasswordAction, initialState);
  const [isPending, startTransition] = useTransition();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect to signin after success
  useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(() => {
        router.push("/auth/signin?reset=success");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  // Success state replaces form
  if (state.status === "success") {
    return <SuccessState userEmail={userEmail} />;
  }

  const handleSubmit = () => {
    const formData = new FormData();
    formData.set("token", token);
    formData.set("password", password);
    formData.set("confirmPassword", confirmPassword);
    startTransition(() => formAction(formData));
  };

  // Password strength checks
  const checks = {
    length: password.length >= 8,
    number: /\d/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };

  const isValid = checks.length && checks.number && checks.match;

  return (
    <AuthForm
      icon={<GIcon />}
      headline="Set new password"
      subheading={
        <>
          Resetting password for{" "}
          <span className="text-text-primary font-medium">{userEmail}</span>
        </>
      }
      footer={
        <>
          Changed your mind?{" "}
          <Link
            href={"/auth/signin"}
            className="text-brand-primary font-medium hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-5"
        noValidate
      >
        {/* Form-level error */}
        {state.status === "error" && state.message && (
          <div
            role="alert"
            className={cn(
              "flex items-start gap-3 p-4 rounded-md",
              "bg-danger-muted border border-danger-border",
            )}
          >
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-body-sm text-danger">{state.message}</p>
          </div>
        )}

        {/* New password field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-body-sm font-medium text-text-secondary"
          >
            New password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
              required
              placeholder="••••••••"
              aria-invalid={!!state.errors?.password}
              className={cn(
                "w-full h-12 pl-12 pr-12",
                "bg-bg-sunken border border-border-default rounded-xl",
                "text-body text-text-primary placeholder:text-text-muted",
                "transition-all duration-[var(--duration-fast)]",
                "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
                "focus:border-brand-primary",
                state.errors?.password && "border-danger",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2",
                "text-text-muted hover:text-text-primary",
                "transition-colors duration-[var(--duration-fast)]",
                "focus-visible:outline-none focus-visible:text-brand-primary",
              )}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {state.errors?.password && (
            <p className="text-body-sm text-danger" role="alert">
              {state.errors.password}
            </p>
          )}

          {/* Password strength hints */}
          {password.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-1 px-1">
              <Check met={checks.length} label="8+ characters" />
              <Check met={checks.number} label="Contains a number" />
            </div>
          )}
        </div>

        {/* Confirm password field */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-body-sm font-medium text-text-secondary"
          >
            Confirm new password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              aria-invalid={!!state.errors?.confirmPassword}
              className={cn(
                "w-full h-12 pl-12 pr-4",
                "bg-bg-sunken border border-border-default rounded-xl",
                "text-body text-text-primary placeholder:text-text-muted",
                "transition-all duration-[var(--duration-fast)]",
                "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
                "focus:border-brand-primary",
                state.errors?.confirmPassword && "border-danger",
              )}
            />
          </div>
          {state.errors?.confirmPassword && (
            <p className="text-body-sm text-danger" role="alert">
              {state.errors.confirmPassword}
            </p>
          )}

          {/* Match indicator */}
          {confirmPassword.length > 0 && (
            <div className="pt-1 px-1">
              <Check met={checks.match} label="Passwords match" />
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isValid || isPending}
          className={cn(
            "w-full h-12 rounded-full",
            "bg-[image:var(--gradient-brand)]",
            "text-white font-semibold",
            "shadow-lg shadow-brand-primary/20",
            "transition-all duration-[var(--duration-fast)]",
            "hover:opacity-95 active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
            "focus-visible:ring-offset-bg-base",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-2",
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating password…</span>
            </>
          ) : (
            <>
              <span>Set new password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthForm>
  );
}

// ─────────────────────────────────────────────────────────────
//  Success State
// ─────────────────────────────────────────────────────────────

function SuccessState({ userEmail }: { userEmail: string }) {
  return (
    <div className="w-full space-y-8 text-center lg:text-left">
      <div className="flex justify-center lg:justify-start">
        <div
          className={cn(
            "w-20 h-20 rounded-full",
            "bg-success/15 border border-success/30",
            "flex items-center justify-center",
            "animate-[scaleUp_0.5s_cubic-bezier(0.34,1.56,0.64,1)]",
          )}
        >
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-[32px] leading-tight font-bold text-text-primary tracking-tight">
          Password updated!
        </h1>
        <p className="text-body-lg text-text-secondary">
          You can now sign in to{" "}
          <span className="text-text-primary font-medium">{userEmail}</span>{" "}
          with your new password.
        </p>
      </div>

      <div
        className={cn(
          "rounded-lg p-4 flex items-center gap-3 justify-center lg:justify-start",
          "bg-bg-sunken border border-border-subtle",
        )}
      >
        <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
        <p className="text-body-sm text-text-muted">Redirecting to sign in…</p>
      </div>

      <div className="text-center lg:text-left">
        <Link
          href={"/auth/signin?reset=success"}
          className={cn(
            "inline-flex items-center gap-2",
            "text-body font-medium text-brand-primary",
            "hover:underline focus-visible:outline-none focus-visible:underline",
          )}
        >
          <span>Sign in now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Check indicator
// ─────────────────────────────────────────────────────────────

function Check({ met, label }: { met: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-micro",
        met ? "text-success" : "text-text-muted",
      )}
    >
      <CheckCircle2
        className={cn("w-3 h-3", met ? "opacity-100" : "opacity-40")}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  GDV "G" icon
// ─────────────────────────────────────────────────────────────

function GIcon() {
  return <span className="text-xl font-black select-none">G</span>;
}
