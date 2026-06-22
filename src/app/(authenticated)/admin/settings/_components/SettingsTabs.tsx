"use client";

import { useState } from "react";
import {
  Coins,
  Building2,
  Bell,
  ToggleRight,
  UserCircle,
  ShieldAlert,
} from "lucide-react";
import SocietySettingsForm from "./SocietySettingsForm";
import ComingSoonTab from "./ComingSoonTab";
import Tabs, { TabItem } from "@/components/molecules/Tabs";

const TABS: TabItem[] = [
  { key: "society", label: "Society", icon: <Coins /> },
  {
    key: "info",
    label: "Society Info",
    icon: <Building2 />,
    badge: { label: "Soon", variant: "neutral" },
    disabled: true,
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: <Bell />,
    badge: { label: "Soon", variant: "neutral" },
    disabled: true,
  },
  {
    key: "app",
    label: "App Config",
    icon: <ToggleRight />,
    badge: { label: "Soon", variant: "neutral" },
    disabled: true,
  },
  {
    key: "account",
    label: "Account",
    icon: <UserCircle />,
    badge: { label: "Soon", variant: "neutral" },
    disabled: true,
  },
  {
    key: "danger",
    label: "Danger Zone",
    icon: <ShieldAlert />,
    badge: { label: "Soon", variant: "neutral" },
    disabled: true,
  },
];

interface InitialValues {
  perSqFtRate: number;
  sinkingFundPercentage: number;
  totalVillas: number;
}

interface Props {
  initialValues: InitialValues;
}

export default function SettingsTabs({ initialValues }: Props) {
  const [active, setActive] = useState("society");

  return (
    <div className="space-y-6">
      <Tabs
        items={TABS}
        value={active}
        onChange={setActive}
        variant="underline"
        size="md"
      />

      {/* Tab content */}
      {active === "society" && (
        <SocietySettingsForm initialValues={initialValues} />
      )}

      {active === "info" && (
        <ComingSoonTab
          icon={<Building2 />}
          title="Society Info coming soon"
          description="Name, address, registration number, contact email and phone."
        />
      )}

      {active === "notifications" && (
        <ComingSoonTab
          icon={<Bell />}
          title="Notifications coming soon"
          description="Email reminders for unpaid bills, custom templates, and delivery preferences."
        />
      )}

      {active === "app" && (
        <ComingSoonTab
          icon={<ToggleRight />}
          title="App Config coming soon"
          description="Feature flags for announcements, requests, payments, and PWA prompts."
        />
      )}

      {active === "account" && (
        <ComingSoonTab
          icon={<UserCircle />}
          title="Account settings coming soon"
          description="Change password, set up 2FA, manage active sessions."
        />
      )}

      {active === "danger" && (
        <ComingSoonTab
          icon={<ShieldAlert />}
          title="Danger Zone coming soon"
          description="Bulk operations: delete bills, reset allocations, export data, factory reset."
        />
      )}
    </div>
  );
}
