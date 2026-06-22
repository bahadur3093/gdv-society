/**
 * SETTINGS — currently MVP with just Society Settings.
 *
 * TODO Future tabs / improvements:
 *  • Society Info  — name, address, registration #, contact details
 *  • Billing       — grace period, late fees (flat/%), auto-fee cron
 *  • Notifications — email reminders, days before due, templates
 *  • App Config    — feature flags, PWA prompts (uses AppConfig)
 *  • Account       — password change, 2FA, sessions
 *  • Danger Zone   — bulk delete, reset allocations, full export, factory reset
 *
 * Future polish:
 *  • Audit log per setting change
 *  • Undo last change within 24h
 *  • Settings search across all tabs
 *  • Settings export/import (society JSON)
 */

import { Settings as SettingsIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/navigation/PageHeader";
import { requireAdmin } from "@/lib/auth/auth";
import SettingsTabs from "./_components/SettingsTabs";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings — Admin" };

export default async function SettingsPage() {
  await requireAdmin();

  // Fetch current society settings (may not exist on fresh install)
  const settings = await prisma.societySettings.findFirst({
    orderBy: { createdAt: "desc" },
  });

  // Defaults if no settings row exists yet
  const initialValues = {
    perSqFtRate: settings?.perSqFtRate ?? 3,
    sinkingFundPercentage: settings?.sinkingFundPercentage ?? 20,
    totalVillas: settings?.totalVillas ?? 47,
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        leading={
          <div className="w-12 h-12 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <SettingsIcon className="w-6 h-6" />
          </div>
        }
        title="Settings"
        description="Configure billing rates, society details, and system preferences."
      />

      <SettingsTabs initialValues={initialValues} />
    </div>
  );
}
