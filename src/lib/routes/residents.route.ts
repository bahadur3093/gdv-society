import { NavItem } from "@/types/navbar";
import {
  Calculator,
  DollarSign,
  FileText,
  LayoutDashboard,
  Map,
  Receipt,
} from "lucide-react";

export const ResidentRoutes: NavItem[] = [
  { href: "/resident/dashboard", label: "Summary", icon: LayoutDashboard },
  { href: "/resident/ledger", label: "Ledger", icon: Receipt },
  { href: "/resident/maintenance", label: "Maintenance", icon: Calculator },
  { href: "/resident/requests", label: "Requests", icon: FileText },
  { href: "/resident/layout", label: "Layout", icon: Map },
  { href: "/resident/expenses", label: "Expenses", icon: DollarSign },
];
