"use client";

import { useTransition } from "react";
import { LogOut, UserCog } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { toast } from "@/components/atoms/Toast";
import Section from "@/components/organisms/Section";
import Card from "@/components/atoms/Card";
import { cn } from "@/lib/utils/utils";

interface Props {
  email: string;
}

export default function AdminAccountSection({ email }: Props) {
  const [isSigningOut, startSignOutTransition] = useTransition();

  const handleSignOut = () => {
    startSignOutTransition(async () => {
      try {
        await signOutAction();
      } catch (e) {
        toast.error("Failed to sign out", {
          description: e instanceof Error ? e.message : "Please try again",
        });
      }
    });
  };

  return (
    <Section title="Account" icon={<UserCog />}>
      <Card padding="md">
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
      </Card>
    </Section>
  );
}
