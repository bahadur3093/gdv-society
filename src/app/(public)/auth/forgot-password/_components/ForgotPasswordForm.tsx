"use client";

import { useState, useTransition, useActionState } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  MailCheck,
  Loader2,
} from "lucide-react";
import AuthForm from "@/components/auth/AuthForm";
import { forgotPasswordAction, type ForgotPasswordState } from "../actions";
import { cn } from "@/lib/utils/utils";

const initialState: ForgotPasswordState = { status: "idle" };

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialState,
  );
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");

  // Success state takes over the entire form
  if (state.status === "success" && state.email) {
    return <SuccessState email={state.email} />;
  }

  const handleSubmit = () => {
    const formData = new FormData();
    formData.set("email", email);
    startTransition(() => formAction(formData));
  };

  const isValid = email.trim().length > 0;

  return (
    <AuthForm
      icon={<GIcon />}
      headline="Reset your password"
      subheading="Enter your email and we'll send you a reset link"
      footer={
        <>
          Remember it?{" "}
          <Link
            href={"/auth/signin"}
            className="text-brand-primary font-medium hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Sign in
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

        {/* Email field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-body-sm font-medium text-text-secondary"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
              placeholder="you@example.com"
              aria-invalid={!!state.errors?.email}
              className={cn(
                "w-full h-14 pl-12 pr-4",
                "bg-bg-sunken border border-border-default rounded-xl",
                "text-body text-text-primary placeholder:text-text-muted",
                "transition-all duration-(--duration-fast)",
                "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
                "focus:border-brand-primary",
                state.errors?.email && "border-danger",
              )}
            />
          </div>
          {state.errors?.email && (
            <p className="text-body-sm text-danger" role="alert">
              {state.errors.email}
            </p>
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
              <span>Sending…</span>
            </>
          ) : (
            <>
              <span>Send reset link</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Back to signin link */}
        <div className="pt-2 text-center">
          <Link
            href={"/auth/signin"}
            className={cn(
              "inline-flex items-center gap-2",
              "text-body-sm text-text-muted",
              "hover:text-text-primary",
              "focus-visible:outline-none focus-visible:text-text-primary",
              "transition-colors duration-(--duration-fast)",
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </form>
    </AuthForm>
  );
}

// ─────────────────────────────────────────────────────────────
//  Success State — replaces form after submission
// ─────────────────────────────────────────────────────────────

function SuccessState({ email }: { email: string }) {
  return (
    <div className="w-full space-y-8 text-center lg:text-left">
      {/* Success icon */}
      <div className="flex justify-center lg:justify-start">
        <div
          className={cn(
            "w-20 h-20 rounded-full",
            "bg-success/15 border border-success/30",
            "flex items-center justify-center",
            "animate-[scaleUp_0.5s_cubic-bezier(0.34,1.56,0.64,1)]",
          )}
        >
          <MailCheck className="w-10 h-10 text-success" />
        </div>
      </div>

      {/* Heading */}
      <div className="space-y-3">
        <h1 className="text-[32px] leading-tight font-bold text-text-primary tracking-tight">
          Check your inbox
        </h1>
        <p className="text-body-lg text-text-secondary">
          We&apos;ve sent password reset instructions to{" "}
          <span className="text-text-primary font-medium">{email}</span>
        </p>
      </div>

      {/* Helpful info card */}
      <div
        className={cn(
          "rounded-xl p-5 space-y-2 text-left",
          "bg-bg-sunken border border-border-subtle",
        )}
      >
        <p className="text-body-sm font-medium text-text-primary">
          What&apos;s next?
        </p>
        <ul className="space-y-1.5 text-body-sm text-text-secondary">
          <li className="flex gap-2">
            <span className="text-brand-primary shrink-0">•</span>
            <span>Click the link in the email within 24 hours</span>
          </li>
          <li className="flex gap-2">
            <span className="text-brand-primary shrink-0">•</span>
            <span>Choose a new password (8+ characters with a number)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-brand-primary shrink-0">•</span>
            <span>Sign in with your new password</span>
          </li>
        </ul>
      </div>

      {/* Resend helper */}
      <div
        className={cn(
          "rounded-lg p-4 space-y-2 text-center",
          "bg-bg-elevated border border-border-subtle",
        )}
      >
        <p className="text-body-sm text-text-muted">
          Didn&apos;t receive the email?
        </p>
        <p className="text-body-sm text-text-muted">
          Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={cn(
              "text-brand-primary hover:underline font-medium",
              "focus-visible:outline-none focus-visible:underline",
            )}
          >
            try a different email
          </button>
        </p>
      </div>

      {/* Back to signin */}
      <div className="pt-2 text-center">
        <Link
          href={"/auth/signin"}
          className={cn(
            "inline-flex items-center gap-2",
            "text-body-sm text-text-muted",
            "hover:text-text-primary",
            "focus-visible:outline-none focus-visible:text-text-primary",
            "transition-colors duration-(--duration-fast)",
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  GDV "G" icon
// ─────────────────────────────────────────────────────────────

function GIcon() {
  return <span className="text-xl font-black select-none">G</span>;
}
