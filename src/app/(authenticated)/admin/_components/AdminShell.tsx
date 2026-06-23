"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/providers/ThemeProvider";
import Sidebar from "@/components/navigation/Sidebar";
import Drawer from "@/components/navigation/Drawer";
import TopBar from "@/components/navigation/TopBar";
import IconButton from "@/components/atoms/IconButton";
import Input from "@/components/atoms/Input";
import { cn } from "@/lib/utils/utils";
import Avatar from "@/components/atoms/Avatar";
import { buildAdminNav } from "./adminNav";
import UserMenu from "@/components/navigation/UserMenu";
import PullToRefresh from "@/components/organisms/PullToRefresh";

interface AdminShellProps {
  userName: string;
  userEmail: string;
  badges: {
    pendingRequests?: number;
    pendingPayments?: number;
  };
  children: React.ReactNode;
}

export default function AdminShell({
  userName,
  userEmail,
  badges,
  children,
}: AdminShellProps) {
  const { resolved, toggle } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const ThemeIcon = resolved === "dark" ? Sun : Moon;
  const navSections = buildAdminNav(badges);

  // Derive page title from current path (basic — overridden by PageHeader inside pages)
  const pageTitle = derivePageTitle(pathname);

  return (
    <div className="flex min-h-screen bg-bg-base">
      {/* ───── Desktop Sidebar ───── */}
      <div className="hidden md:flex">
        <Sidebar
          sections={navSections}
          brand={<BrandLogo />}
          footer={<UserFooter name={userName} email={userEmail} />}
        />
      </div>

      {/* ───── Mobile Drawer ───── */}
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        sections={navSections}
        brand={<BrandLogo />}
        footer={<UserFooter name={userName} email={userEmail} />}
      />

      {/* ───── Main column ───── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar
          leading={
            <div className="flex items-center gap-3">
              {/* Mobile: hamburger */}
              <IconButton
                label="Open menu"
                icon={<Menu />}
                variant="ghost"
                size="md"
                onClick={() => setDrawerOpen(true)}
                className="md:hidden"
              />

              {/* Desktop: breadcrumb */}
              <Breadcrumbs pathname={pathname} />

              {/* Mobile: page title */}
              <h1 className="md:hidden text-h4 text-text-primary truncate">
                {pageTitle}
              </h1>
            </div>
          }
          center={
            <div className="w-full max-w-md">
              <Input
                leadingIcon={<Search />}
                placeholder="Search villas, residents, bills..."
                inputSize="md"
              />
            </div>
          }
          actions={
            <>
              <IconButton
                label="Notifications"
                icon={
                  <div className="relative">
                    <Bell />
                    {badges.pendingRequests && badges.pendingRequests > 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger ring-2 ring-bg-base"
                      />
                    )}
                  </div>
                }
                variant="ghost"
                size="md"
              />
              <IconButton
                label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
                icon={<ThemeIcon />}
                variant="ghost"
                size="md"
                onClick={toggle}
                showTooltip
              />
              <UserMenu
                name={userName}
                email={userEmail}
                role="ADMIN"
                profileHref="/admin/profile"
                avatarSize="md"
              />
            </>
          }
          glassOnScroll
        />

        {/* Page content */}

        <main className="flex-1 overflow-x-hidden">
          <PullToRefresh>
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
              {children}
            </div>
          </PullToRefresh>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Brand logo
// ─────────────────────────────────────────────────────────────

function BrandLogo() {
  return (
    <Link
      href={"/admin/ledger"}
      className={cn(
        "flex items-center gap-2.5 w-full overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-brand-primary rounded",
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-md shrink-0 shadow-md",
          "bg-(image:--gradient-brand)",
          "flex items-center justify-center",
        )}
      >
        <span className="font-bold text-white text-body-lg">G</span>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-body font-bold text-text-primary whitespace-nowrap">
          GDV Society
        </p>
        <p className="text-micro uppercase text-text-muted whitespace-nowrap tracking-wider">
          Admin Console
        </p>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
//  User footer (with sign out)
// ─────────────────────────────────────────────────────────────

function UserFooter({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-2.5 w-full overflow-hidden">
      <Avatar size="sm" name={name} status="online" />
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="text-body-sm font-medium text-text-primary truncate">
          {name}
        </p>
        <p className="text-micro text-text-muted truncate">{email}</p>
      </div>
      <IconButton
        label="Sign out"
        icon={<LogOut />}
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        showTooltip
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Breadcrumb (desktop only — replaces page title on small screens)
// ─────────────────────────────────────────────────────────────

function Breadcrumbs({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  // For /admin/ledger → ['admin', 'ledger']
  // We skip 'admin' and show the rest

  if (segments.length <= 1) return null;

  const crumbs = segments.slice(1).map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 2).join("/");
    return { label: humanize(seg), href };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden md:flex items-center gap-1.5 text-body-sm"
    >
      <Link
        href={"/admin/ledger"}
        className="text-text-muted hover:text-text-primary transition-colors duration-(--duration-fast)"
      >
        Admin
      </Link>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.href} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
            {isLast ? (
              <span className="text-text-primary font-medium">{c.label}</span>
            ) : (
              <Link
                href={c.href}
                className="text-text-muted hover:text-text-primary"
              >
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

const SEGMENT_LABELS: Record<string, string> = {
  ledger: "Master Ledger",
  bills: "Bills",
  payments: "Payments",
  expenses: "Expenses",
  residents: "Residents",
  villas: "Villas",
  layout: "Layout",
  announcements: "Announcements",
  requests: "Requests",
  settings: "Settings",
  new: "New",
};

function humanize(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  // Fallback: capitalize and replace dashes
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function derivePageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Admin";
  const last = segments[segments.length - 1];
  // If last segment looks like an ID (cuid pattern), use the parent
  if (last.length > 10 && /^[a-z0-9]+$/.test(last)) {
    return humanize(segments[segments.length - 2] ?? "Detail");
  }
  return humanize(last);
}
