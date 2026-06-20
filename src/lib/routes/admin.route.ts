import { NavItem } from "@/types/navbar";
import {
  Bell,
  BookOpen,
  Cog,
  CreditCard,
  DollarSign,
  FileText,
  Map,
  Receipt,
  Settings,
  Table,
  Users,
} from "lucide-react";

export const AdminRoutes: NavItem[] = [
  { href: "/admin/ledger", label: "Ledger", icon: BookOpen },
  { href: "/admin/villas", label: "Villas", icon: Table },
  { href: "/admin/residents", label: "Residents", icon: Users },
  { href: "/admin/bills", label: "Generate Bills", icon: Receipt },
  { href: '/admin/payments/new', label: 'Record Payment', icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/config", label: "Config", icon: Cog },
  { href: "/admin/expenses", label: "Expense", icon: DollarSign },
  { href: "/admin/layout", label: "Layout", icon: Map },
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
];
