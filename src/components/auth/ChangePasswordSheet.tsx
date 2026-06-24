"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import Button from "@/components/atoms/Button";
import { toast } from "@/components/atoms/Toast";
import {
  changePasswordAction,
  type ChangePasswordState,
} from "@/lib/auth/change-password";
import ResponsiveSheet from "../organisms/ResponsiveSheet";

const initialState: ChangePasswordState = { status: "idle" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordSheet({ open, onOpenChange }: Props) {
  const [state, formAction] = useActionState(
    changePasswordAction,
    initialState,
  );
  const [isPending, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswords(false);
    }
  }, [open]);

  // Handle action result
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Password updated");
      onOpenChange(false);
    } else if (state.status === "error" && !state.errors) {
      toast.error(state.message ?? "Failed to update password");
    }
  }, [state]);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.set("currentPassword", currentPassword);
    formData.set("newPassword", newPassword);
    formData.set("confirmPassword", confirmPassword);
    startTransition(() => formAction(formData));
  };

  const checks = {
    length: newPassword.length >= 8,
    number: /\d/.test(newPassword),
    different: newPassword.length > 0 && newPassword !== currentPassword,
    match: confirmPassword.length > 0 && newPassword === confirmPassword,
  };

  const isValid =
    currentPassword.length > 0 &&
    checks.length &&
    checks.number &&
    checks.different &&
    checks.match;

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
      title="Change password"
      description="Enter your current password and choose a new one"
      size="md"
      footer={
        <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3 md:justify-end w-full">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            icon={<Lock />}
            onClick={handleSubmit}
            disabled={!isValid || isPending}
          >
            {isPending ? "Updating…" : "Update password"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Form-level error */}
        {state.status === "error" && state.message && !state.errors && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-md bg-danger-muted border border-danger-border"
          >
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-body-sm text-danger">{state.message}</p>
          </div>
        )}

        {/* Show passwords toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="w-4 h-4 rounded bg-bg-sunken border-border-default text-brand-primary"
          />
          <span className="text-body-sm text-text-secondary">
            Show passwords
          </span>
        </label>

        {/* Current password */}
        <Field
          label="Current password"
          htmlFor="currentPassword"
          error={state.errors?.currentPassword}
        >
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            visible={showPasswords}
            autoComplete="current-password"
            autoFocus
            invalid={!!state.errors?.currentPassword}
          />
        </Field>

        {/* New password */}
        <Field
          label="New password"
          htmlFor="newPassword"
          error={state.errors?.newPassword}
        >
          <PasswordInput
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            visible={showPasswords}
            autoComplete="new-password"
            invalid={!!state.errors?.newPassword}
          />
          {/* Strength hints */}
          {newPassword.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2 px-1">
              <Check met={checks.length} label="8+ characters" />
              <Check met={checks.number} label="Contains a number" />
              <Check met={checks.different} label="Different from current" />
            </div>
          )}
        </Field>

        {/* Confirm password */}
        <Field
          label="Confirm new password"
          htmlFor="confirmPassword"
          error={state.errors?.confirmPassword}
        >
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            visible={showPasswords}
            autoComplete="new-password"
            invalid={!!state.errors?.confirmPassword}
          />
          {confirmPassword.length > 0 && (
            <div className="pt-2 px-1">
              <Check met={checks.match} label="Passwords match" />
            </div>
          )}
        </Field>
      </div>
    </ResponsiveSheet>
  );
}

// ─────────────────────────────────────────────────────────────
//  Subcomponents
// ─────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-body-sm font-medium text-text-secondary"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-body-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordInput({
  id,
  name,
  value,
  onChange,
  visible,
  autoComplete,
  autoFocus,
  invalid,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  visible: boolean;
  autoComplete: string;
  autoFocus?: boolean;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      <Lock
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
        aria-hidden="true"
      />
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required
        placeholder="••••••••"
        aria-invalid={invalid}
        className={cn(
          "w-full h-12 pl-12 pr-4",
          "bg-bg-sunken border border-border-default rounded-xl",
          "text-body text-text-primary placeholder:text-text-muted",
          "transition-all duration-[var(--duration-fast)]",
          "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
          "focus:border-brand-primary",
          invalid && "border-danger",
        )}
      />
    </div>
  );
}

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
