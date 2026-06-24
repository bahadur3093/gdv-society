"use client";

import { useState } from "react";
import { Lock, KeyRound, ChevronRight } from "lucide-react";
import Section from "@/components/organisms/Section";
import Card from "@/components/atoms/Card";
import { cn } from "@/lib/utils/utils";
import ChangePasswordSheet from "@/components/auth/ChangePasswordSheet";

export default function SecuritySection() {
  const [changeOpen, setChangeOpen] = useState(false);

  return (
    <>
      <Section title="Security" icon={<Lock />}>
        <Card padding="md">
          <button
            type="button"
            onClick={() => setChangeOpen(true)}
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
                Update your account password
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
          </button>
        </Card>
      </Section>

      <ChangePasswordSheet open={changeOpen} onOpenChange={setChangeOpen} />
    </>
  );
}
