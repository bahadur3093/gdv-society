"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Lock,
  Hash,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import AuthForm from "@/components/auth/AuthForm";
import { signupAction, type SignupState } from "../actions";
import { cn } from "@/lib/utils/utils";

const initialState: SignupState = { status: "idle" };

export default function SignupForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(signupAction, initialState);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plotNumber, setPlotNumber] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle successful signup
  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    formData.set("password", password);
    formData.set("plotNumber", plotNumber);
    if (terms) formData.set("terms", "on");
    startTransition(() => formAction(formData));
  };

  const isValid =
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    plotNumber.trim().length > 0 &&
    terms;

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    number: /\d/.test(password),
  };

  return (
    <AuthForm
      icon={<GIcon />}
      headline="Create your account"
      subheading="Join your society's digital hub"
      footer={
        <>
          Already have an account?{" "}
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
        {state.status === "error" && state.message && !state.errors?.terms && (
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

        {/* Name field */}
        <Field
          label="Name"
          htmlFor="name"
          error={state.errors?.name}
          icon={<UserIcon className="w-5 h-5" />}
        >
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            placeholder="John Doe"
            aria-invalid={!!state.errors?.name}
            className={cn(
              "w-full h-12 pl-12 pr-4",
              "bg-bg-sunken border border-border-default rounded-xl",
              "text-body text-text-primary placeholder:text-text-muted",
              "transition-all duration-(--duration-fast)",
              "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
              "focus:border-brand-primary",
              state.errors?.name && "border-danger",
            )}
          />
        </Field>

        {/* Email field */}
        <Field
          label="Email"
          htmlFor="email"
          error={state.errors?.email}
          icon={<Mail className="w-5 h-5" />}
        >
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            placeholder="you@example.com"
            aria-invalid={!!state.errors?.email}
            className={cn(
              "w-full h-12 pl-12 pr-4",
              "bg-bg-sunken border border-border-default rounded-xl",
              "text-body text-text-primary placeholder:text-text-muted",
              "transition-all duration-(--duration-fast)",
              "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
              "focus:border-brand-primary",
              state.errors?.email && "border-danger",
            )}
          />
        </Field>

        {/* Password field */}
        <Field
          label="Password"
          htmlFor="password"
          error={state.errors?.password}
          icon={<Lock className="w-5 h-5" />}
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
              autoComplete="new-password"
              required
              placeholder="••••••••"
              aria-invalid={!!state.errors?.password}
              className={cn(
                "w-full h-12 pl-12 pr-12",
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

          {/* Password strength hints (only show when typing) */}
          {password.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2 px-1">
              <StrengthCheck
                met={passwordChecks.length}
                label="8+ characters"
              />
              <StrengthCheck
                met={passwordChecks.number}
                label="Contains a number"
              />
            </div>
          )}
        </Field>

        {/* Plot number field */}
        <Field
          label="Plot number"
          htmlFor="plotNumber"
          error={state.errors?.plotNumber}
          icon={<Hash className="w-5 h-5" />}
          helperText="Your villa or plot reference"
        >
          <input
            id="plotNumber"
            name="plotNumber"
            type="text"
            value={plotNumber}
            onChange={(e) => setPlotNumber(e.target.value)}
            required
            placeholder="e.g., 39"
            aria-invalid={!!state.errors?.plotNumber}
            className={cn(
              "w-full h-12 pl-12 pr-4",
              "bg-bg-sunken border border-border-default rounded-xl",
              "text-body text-text-primary placeholder:text-text-muted",
              "transition-all duration-(--duration-fast)",
              "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
              "focus:border-brand-primary",
              state.errors?.plotNumber && "border-danger",
            )}
          />
        </Field>

        {/* Terms checkbox */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              required
              aria-invalid={!!state.errors?.terms}
              className={cn(
                "w-4 h-4 mt-0.5 rounded",
                "bg-bg-sunken border-border-default text-brand-primary",
                "focus:ring-brand-primary/30 focus:ring-offset-bg-base",
                "cursor-pointer",
                state.errors?.terms && "border-danger",
              )}
            />
            <span className="text-body-sm text-text-secondary leading-tight">
              I agree to the{" "}
              <Link
                href={"/terms"}
                className="text-brand-primary hover:underline"
                target="_blank"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href={"/privacy"}
                className="text-brand-primary hover:underline"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {state.errors?.terms && (
            <p className="text-body-sm text-danger pl-7" role="alert">
              {state.errors.terms}
            </p>
          )}
        </div>

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
              <span>Creating account…</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </form>
    </AuthForm>
  );
}

// ─────────────────────────────────────────────────────────────
//  Reusable Field component
// ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function Field({
  label,
  htmlFor,
  error,
  helperText,
  icon,
  children,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-body-sm font-medium text-text-secondary"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        {children}
      </div>
      {error ? (
        <p className="text-body-sm text-danger" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-micro uppercase text-text-muted tracking-wider">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Password Strength Check
// ─────────────────────────────────────────────────────────────

function StrengthCheck({ met, label }: { met: boolean; label: string }) {
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
