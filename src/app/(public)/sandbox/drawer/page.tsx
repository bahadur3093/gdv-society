"use client";

import { useState } from "react";
import {
  Menu,
  BookOpen,
  Receipt,
  CreditCard,
  Sparkles,
  Users,
  Building2,
  Settings,
  FileText,
  HelpCircle,
  LogOut,
  Bell,
} from "lucide-react";
import Drawer from "@/components/navigation/Drawer";
import type { SidebarSection } from "@/components/navigation/Sidebar";
import IconButton from "@/components/atoms/IconButton";
import Avatar from "@/components/atoms/Avatar";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import StatCard from "@/components/molecules/StatCard";

export default function DrawerSandbox() {
  const [open, setOpen] = useState(false);

  // Same admin nav as Sidebar — proves the data shape is reusable
  const sections: SidebarSection[] = [
    {
      key: "operations",
      title: "Operations",
      items: [
        {
          key: "master-ledger",
          href: "/sandbox/drawer",
          icon: <BookOpen />,
          label: "Master Ledger",
        },
        {
          key: "bills",
          href: "/sandbox/drawer/bills",
          icon: <Receipt />,
          label: "Bills",
          badge: { label: "44", variant: "brand" },
        },
        {
          key: "payments",
          href: "/sandbox/drawer/payments",
          icon: <CreditCard />,
          label: "Payments",
          badge: { label: "3", variant: "danger" },
        },
        {
          key: "levies",
          href: "/sandbox/drawer/levies",
          icon: <Sparkles />,
          label: "Special Levies",
        },
      ],
    },
    {
      key: "manage",
      title: "Manage",
      items: [
        {
          key: "residents",
          href: "/sandbox/drawer/residents",
          icon: <Users />,
          label: "Residents",
          badge: { dot: true, variant: "warning" },
        },
        {
          key: "villas",
          href: "/sandbox/drawer/villas",
          icon: <Building2 />,
          label: "Villas",
        },
        {
          key: "announcements",
          href: "/sandbox/drawer/announcements",
          icon: <Bell />,
          label: "Announcements",
        },
        {
          key: "settings",
          href: "/sandbox/drawer/settings",
          icon: <Settings />,
          label: "Settings",
        },
      ],
    },
    {
      key: "system",
      title: "System",
      items: [
        {
          key: "logs",
          href: "/sandbox/drawer/logs",
          icon: <FileText />,
          label: "Activity Logs",
        },
        {
          key: "help",
          href: "/sandbox/drawer/help",
          icon: <HelpCircle />,
          label: "Help",
          disabled: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Fake mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 bg-bg-elevated border-b border-border-subtle">
        <IconButton
          label="Open menu"
          icon={<Menu />}
          variant="ghost"
          onClick={() => setOpen(true)}
        />
        <h1 className="flex-1 text-h4 text-text-primary">Master Ledger</h1>
        <Avatar size="sm" name="Admin User" status="online" />
      </header>

      {/* Main content */}
      <main className="p-4 space-y-4 max-w-md mx-auto">
        <Card padding="md" variant="sunken">
          <p className="text-body text-text-primary mb-2">
            💡 Tap the hamburger icon (top-left) to open the drawer.
          </p>
          <p className="text-body-sm text-text-secondary">
            Best tested on mobile or in browser DevTools mobile mode.
          </p>
        </Card>

        <Card padding="md">
          <p className="text-h4 text-text-primary mb-2">Try these:</p>
          <ul className="text-body-sm text-text-secondary space-y-1.5 ml-4">
            <li>• Tap hamburger to open drawer</li>
            <li>• Swipe drawer left (drag) to close</li>
            <li>• Tap backdrop to close</li>
            <li>• Tap any nav item — drawer auto-closes</li>
            <li>• Press ESC to close</li>
          </ul>
        </Card>

        <Button
          fullWidth
          icon={<Menu className="w-4 h-4" />}
          onClick={() => setOpen(true)}
        >
          Open Drawer
        </Button>

        {/* Fake content to scroll */}
        <StatCard
          label="Total Billed"
          value={211200}
          format="currency"
          icon={<Receipt />}
          accent="brand"
        />
        <StatCard
          label="Collected"
          value={112400}
          format="currency"
          icon={<CreditCard />}
          accent="success"
        />
        <StatCard
          label="Outstanding"
          value={98800}
          format="currency"
          icon={<Sparkles />}
          accent="warning"
        />
        <StatCard
          label="Defaulters"
          value={12}
          format="number"
          icon={<Users />}
          accent="danger"
        />

        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} padding="md">
            <p className="text-h4 text-text-primary">Scroll content {i + 1}</p>
            <p className="text-body-sm text-text-secondary mt-1">
              Drawer overlays content. Page scroll is locked while open.
            </p>
          </Card>
        ))}
      </main>

      {/* The drawer */}
      <Drawer
        open={open}
        onOpenChange={setOpen}
        sections={sections}
        brand={<BrandLogo />}
        footer={<UserFooter />}
      />
    </div>
  );
}

// ─── Brand logo ───
function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5 w-full overflow-hidden">
      <div className="w-9 h-9 rounded-md bg-[image:var(--gradient-brand)] flex items-center justify-center shrink-0 shadow-md">
        <span className="font-bold text-white text-body-lg">G</span>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-body font-bold text-text-primary whitespace-nowrap">
          GDV Society
        </p>
        <p className="text-micro uppercase text-text-muted whitespace-nowrap">
          Admin Console
        </p>
      </div>
    </div>
  );
}

// ─── User footer ───
function UserFooter() {
  return (
    <div className="flex items-center gap-2.5 w-full overflow-hidden">
      <Avatar size="sm" name="Admin User" status="online" />
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-body-sm font-medium text-text-primary truncate">
          Admin User
        </p>
        <p className="text-micro text-text-muted truncate">admin@gdv.com</p>
      </div>
      <IconButton
        label="Sign out"
        icon={<LogOut />}
        variant="ghost"
        size="sm"
      />
    </div>
  );
}
