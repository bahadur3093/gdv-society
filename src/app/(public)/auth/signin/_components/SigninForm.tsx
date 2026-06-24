"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import AuthForm from "@/components/auth/AuthForm";
import { signinAction, type SigninState } from "../actions";
import { cn } from "@/lib/utils/utils";
import { toast } from "@/components/atoms/Toast";

const initialState: SigninState = { status: "idle" };

export default function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(signinAction, initialState);
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle action result
  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      toast.success("Password updated", {
        description: "Sign in with your new password",
      });
    }
  }, [searchParams]);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    startTransition(() => formAction(formData));
  };

  const isValid = email.length > 0 && password.length > 0;

  return (
    <AuthForm
      icon={<GIcon />}
      headline="Welcome back"
      subheading="Sign in to your society account"
      footer={
        <>
          New to GDV?{" "}
          <Link
            href={"/auth/signup"}
            className="text-brand-primary font-medium hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Create an account
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
        <FormField label="Email" htmlFor="email" error={state.errors?.email}>
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
        </FormField>

        {/* Password field */}
        <FormField
          label="Password"
          htmlFor="password"
          error={state.errors?.password}
          labelExtra={
            <Link
              href={"/auth/forgot-password"}
              className="text-body-sm text-brand-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              Forgot password?
            </Link>
          }
        >
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
              autoComplete="current-password"
              required
              placeholder="••••••••"
              aria-invalid={!!state.errors?.password}
              className={cn(
                "w-full h-14 pl-12 pr-12",
                "bg-bg-sunken border border-border-default rounded-xl",
                "text-body text-text-primary placeholder:text-text-muted",
                "transition-all duration-(--duration-fast)",
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
                "transition-colors duration-(--duration-fast)",
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
        </FormField>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isValid || isPending}
          className={cn(
            "w-full h-12 rounded-full",
            "bg-(image:--gradient-brand)",
            "text-white font-semibold",
            "shadow-lg shadow-brand-primary/20",
            "transition-all duration-(--duration-fast)",
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
              <span>Signing in…</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </form>
    </AuthForm>
  );
}

// ─────────────────────────────────────────────────────────────
//  Form Field — consistent label + content wrapper
// ─────────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  labelExtra?: React.ReactNode;
  children: React.ReactNode;
}

function FormField({
  label,
  htmlFor,
  error,
  labelExtra,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-body-sm font-medium text-text-secondary"
        >
          {label}
        </label>
        {labelExtra}
      </div>
      {children}
      {error && (
        <p className="text-body-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  GDV "G" icon (used in headline)
// ─────────────────────────────────────────────────────────────

function GIcon() {
  return <span className="text-xl font-black select-none">G</span>;
}
