import {
  BookOpen,
  Receipt,
  CreditCard,
  TrendingDown,
  Users,
  Home,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Settings as SettingsIcon,
} from "lucide-react";
import type { SidebarSection } from "@/components/navigation/Sidebar";

export function buildAdminNav(
  badges: {
    pendingRequests?: number;
    pendingPayments?: number;
  } = {},
): SidebarSection[] {
  return [
    {
      key: "operations",
      title: "Operations",
      items: [
        {
          key: "ledger",
          href: "/admin/ledger",
          icon: <BookOpen />,
          label: "Master Ledger",
        },
        {
          key: "bills",
          href: "/admin/bills",
          icon: <Receipt />,
          label: "Bills",
        },
        {
          key: "payments",
          href: "/admin/payments",
          icon: <CreditCard />,
          label: "Payments",
          badge: badges.pendingPayments
            ? { label: String(badges.pendingPayments), variant: "warning" }
            : undefined,
        },
        {
          key: "expenses",
          href: "/admin/expenses",
          icon: <TrendingDown />,
          label: "Expenses",
        },
      ],
    },
    {
      key: "manage",
      title: "Manage",
      items: [
        {
          key: "residents",
          href: "/admin/residents",
          icon: <Users />,
          label: "Residents",
        },
        {
          key: "villas",
          href: "/admin/villas",
          icon: <Home />,
          label: "Villas",
        },
        {
          key: "layout",
          href: "/admin/layout",
          icon: <LayoutGrid />,
          label: "Layout",
        },
        {
          key: "announcements",
          href: "/admin/announcements",
          icon: <Megaphone />,
          label: "Announcements",
        },
        {
          key: "requests",
          href: "/admin/requests",
          icon: <MessageSquare />,
          label: "Requests",
          badge: badges.pendingRequests
            ? { label: String(badges.pendingRequests), variant: "danger" }
            : undefined,
        },
      ],
    },
    {
      key: "system",
      title: "System",
      items: [
        {
          key: "settings",
          href: "/admin/settings",
          icon: <SettingsIcon />,
          label: "Settings",
        },
      ],
    },
  ];
}
