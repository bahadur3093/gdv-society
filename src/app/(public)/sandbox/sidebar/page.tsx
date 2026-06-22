"use client";

import Avatar from "@/components/atoms/Avatar";
import Card from "@/components/atoms/Card";
import IconButton from "@/components/atoms/IconButton";
import Sidebar, { SidebarSection } from "@/components/navigation/Sidebar";
import StatCard from "@/components/molecules/StatCard";
import {
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

export default function SidebarSandbox() {
  // Real admin nav structure
  const sections: SidebarSection[] = [
    {
      key: "operations",
      title: "Operations",
      items: [
        {
          key: "master-ledger",
          href: "/sandbox/sidebar",
          icon: <BookOpen />,
          label: "Master Ledger",
        },
        {
          key: "bills",
          href: "/sandbox/sidebar/bills",
          icon: <Receipt />,
          label: "Bills",
          badge: { label: "44", variant: "brand" },
        },
        {
          key: "payments",
          href: "/sandbox/sidebar/payments",
          icon: <CreditCard />,
          label: "Payments",
          badge: { label: "3", variant: "danger" },
        },
        {
          key: "levies",
          href: "/sandbox/sidebar/levies",
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
          href: "/sandbox/sidebar/residents",
          icon: <Users />,
          label: "Residents",
          badge: { dot: true, variant: "warning" },
        },
        {
          key: "villas",
          href: "/sandbox/sidebar/villas",
          icon: <Building2 />,
          label: "Villas",
        },
        {
          key: "announcements",
          href: "/sandbox/sidebar/announcements",
          icon: <Bell />,
          label: "Announcements",
        },
        {
          key: "settings",
          href: "/sandbox/sidebar/settings",
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
          href: "/sandbox/sidebar/logs",
          icon: <FileText />,
          label: "Activity Logs",
        },
        {
          key: "help",
          href: "/sandbox/sidebar/help",
          icon: <HelpCircle />,
          label: "Help",
          disabled: true,
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-bg-base">
      {/* The actual sidebar */}
      {/* <Sidebar
        sections={sections}
        brand={<BrandLogo />}
        footer={<UserFooter />}
      /> */}

      {/* Main content area */}
      <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 text-text-primary">Sidebar</h1>
            <p className="text-body text-text-secondary mt-1">
              Admin desktop navigation — collapse, hover, badges, gradient
              active indicator.
            </p>
          </div>
        </header>

        <Card padding="md" variant="sunken">
          <p className="text-body text-text-primary mb-2">
            💡 Try these interactions:
          </p>
          <ul className="text-body-sm text-text-secondary space-y-1 ml-4">
            <li>
              • Click the chevron at the bottom of the sidebar to collapse
            </li>
            <li>• When collapsed, hover the sidebar to temporarily expand</li>
            <li>• Refresh the page — collapsed state persists</li>
            <li>• Click any nav item to see the active state change</li>
            <li>
              • Notice the gradient line on the active item&apos;s left edge
            </li>
          </ul>
        </Card>

        {/* Fake content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            label="Villas"
            value={47}
            format="number"
            icon={<Building2 />}
            accent="info"
          />
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} padding="md">
            <p className="text-h4 text-text-primary">Content area {i + 1}</p>
            <p className="text-body-sm text-text-secondary mt-1">
              The sidebar stays sticky on the left as you scroll. Width animates
              smoothly when toggled. On real admin pages, this is where the
              actual content lives.
            </p>
          </Card>
        ))}
      </main>
    </div>
  );
}

// ─── Brand logo at top of sidebar ───
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

// ─── User menu at bottom ───
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
