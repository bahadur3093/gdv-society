"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  KeyRound,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { requestAdminPasswordResetAction } from "../actions";
import { toast } from "@/components/atoms/Toast";
import Section from "@/components/organisms/Section";
import Card from "@/components/atoms/Card";
import { cn } from "@/lib/utils/utils";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";

interface Admin {
  email: string;
  emailVerified: Date | null;
}

interface Props {
  admin: Admin;
}

export default function AdminSecuritySection({ admin }: Props) {
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async () => {
    setIsResetting(true);
    const result = await requestAdminPasswordResetAction();
    setIsResetting(false);

    if (result.status === "success") {
      toast.success("Password reset ready", {
        description: result.message,
      });
      setResetOpen(false);
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to generate reset link");
    }
  };

  return (
    <>
      <Section title="Security" icon={<Lock />}>
        <Card padding="md">
          <div className="space-y-3">
            {/* Email verification status */}
            <div className="flex items-center gap-3 px-3 py-3 -mx-1 rounded-md">
              <div
                className={cn(
                  "w-10 h-10 rounded-md flex items-center justify-center shrink-0",
                  admin.emailVerified
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning",
                )}
              >
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-text-primary">
                  Email verification
                </p>
                <p className="text-body-sm text-text-muted truncate">
                  {admin.email}
                </p>
              </div>
              {admin.emailVerified ? (
                <Badge size="sm" variant="success" icon={<CheckCircle2 />}>
                  Verified
                </Badge>
              ) : (
                <Badge size="sm" variant="warning" icon={<AlertTriangle />}>
                  Unverified
                </Badge>
              )}
            </div>

            <div className="border-t border-border-subtle" />

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
                  Generate a reset link (valid 24 hours)
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
            </button>
          </div>
        </Card>
      </Section>

      {/* Reset confirmation modal */}
      <Modal
        open={resetOpen}
        onOpenChange={(open) => !open && !isResetting && setResetOpen(false)}
        title="Generate password reset link?"
        description="A new reset link will be created that you can use within 24 hours."
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
              {isResetting ? "Generating…" : "Generate link"}
            </Button>
          </>
        }
      />
    </>
  );
}
