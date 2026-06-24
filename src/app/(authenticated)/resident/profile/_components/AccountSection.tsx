"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogOut, KeyRound, AlertCircle } from "lucide-react";
import { requestPasswordResetAction } from "../actions";
import { signOutAction } from "@/lib/auth/actions";
import { toast } from "@/components/atoms/Toast";
import Section from "@/components/organisms/Section";
import Card from "@/components/atoms/Card";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import { cn } from "@/lib/utils/utils";

interface Props {
  email: string;
}

export default function AccountSection({ email }: Props) {
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSigningOut, startSignOutTransition] = useTransition();

  const handleResetPassword = async () => {
    setIsResetting(true);
    const result = await requestPasswordResetAction();
    setIsResetting(false);

    if (result.status === "success") {
      toast.success("Password reset requested", {
        description: result.message,
      });
      setResetOpen(false);
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to request reset");
    }
  };

  const handleSignOut = () => {
    startSignOutTransition(async () => {
      try {
        await signOutAction();
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
    <>
      <Section title="Account" icon={<Lock />}>
        <Card padding="md">
          <div className="space-y-3">
            {/* Change password */}
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className={cn(
                "w-full flex items-center gap-3",
                "px-3 py-3 -mx-1 rounded-md",
                "text-left",
                "transition-colors duration-(--duration-fast)",
                "hover:bg-bg-sunken",
                "focus-visible:outline-none focus-visible:bg-bg-sunken",
              )}
            >
              <div className="w-10 h-10 rounded-md bg-info/10 text-info flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-text-primary">
                  Change password
                </p>
                <p className="text-body-sm text-text-muted truncate">
                  Request a reset link via the society admin
                </p>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-border-subtle" />

            {/* Sign out */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={cn(
                "w-full flex items-center gap-3",
                "px-3 py-3 -mx-1 rounded-md",
                "text-left",
                "transition-colors duration-(--duration-fast)",
                "hover:bg-danger-muted",
                "focus-visible:outline-none focus-visible:bg-danger-muted",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <div className="w-10 h-10 rounded-md bg-danger-muted text-danger flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-danger">
                  {isSigningOut ? "Signing out…" : "Sign out"}
                </p>
                <p className="text-body-sm text-text-muted truncate">{email}</p>
              </div>
            </button>
          </div>
        </Card>
      </Section>

      {/* Reset confirmation modal */}
      <Modal
        open={resetOpen}
        onOpenChange={(open) => !open && !isResetting && setResetOpen(false)}
        title="Request password reset?"
        description={`A reset link will be generated and sent to ${email} after admin approval.`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setResetOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<KeyRound />}
              onClick={handleResetPassword}
              disabled={isResetting}
            >
              {isResetting ? "Requesting…" : "Request reset"}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-3 rounded-md bg-info-muted border border-info-border">
          <AlertCircle className="w-4 h-4 text-info shrink-0 mt-0.5" />
          <p className="text-body-sm text-info">
            Your request will appear in the admin&apos;s queue. They&apos;ll
            review and email you the reset link within 24 hours.
          </p>
        </div>
      </Modal>
    </>
  );
}
