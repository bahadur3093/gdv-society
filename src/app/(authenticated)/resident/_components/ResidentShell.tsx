"use client";

import {
  Home,
  FileText,
  Bell,
  User as UserIcon,
  Sun,
  Moon,
  TrendingDown,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";
import FloatingTabBar, {
  type TabItem,
} from "@/components/navigation/FloatingTabBar";
import Avatar from "@/components/atoms/Avatar";
import { cn, isActiveRoute } from "@/lib/utils/utils";
import IconButton from "@/components/atoms/IconButton";
import UserMenu from "@/components/navigation/UserMenu";
import PullToRefresh from "@/components/organisms/PullToRefresh";

interface ResidentShellProps {
  userName: string;
  userEmail: string;
  villaNo: number | null;
  children: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────
//  Nav items (shared between mobile floating bar + desktop inline)
// ─────────────────────────────────────────────────────────────

const NAV_ITEMS: TabItem[] = [
  {
    key: "home",
    href: "/resident",
    icon: <Home className="w-full h-full" />,
    label: "Dashboard",
  },
  {
    key: "ledger",
    href: "/resident/ledger",
    icon: <FileText className="w-full h-full" />,
    label: "Ledger",
  },
  {
    key: "finances",
    href: "/resident/expenses",
    icon: <TrendingDown />,
    label: "Finances",
  },

  {
    key: "announcements",
    href: "/resident/announcements",
    icon: <Bell className="w-full h-full" />,
    label: "Announcements",
  },
  {
    key: "profile",
    href: "/resident/profile",
    icon: <UserIcon className="w-full h-full" />,
    label: "Profile",
  },
];

// ─────────────────────────────────────────────────────────────
//  Shell
// ─────────────────────────────────────────────────────────────

export default function ResidentShell({
  userName,
  userEmail,
  villaNo,
  children,
}: ResidentShellProps) {
  const { resolved, toggle } = useTheme();
  const ThemeIcon = resolved === "dark" ? Sun : Moon;

  // First name only for greeting
  const firstName = userName.split(" ")[0];
  const greeting = getGreeting();

  return (
    <div className="relative min-h-screen flex flex-col bg-bg-base">
      {/* ───── Aurora background mesh (subtle) ───── */}

      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 pointer-events-none -z-10",
          "bg-(image:--gradient-aurora)",
        )}
      />

      <header
        className={cn(
          "sticky top-0 z-20",
          "pt-[env(safe-area-inset-top)]",
          "bg-bg-base/80 backdrop-blur-xl",
          "border-b border-border-subtle",
        )}
      >
        <div className="max-w-7xl mx-auto h-14 md:h-16 flex items-center gap-4 px-4 md:px-6">
          <div className="flex-1 flex items-center gap-3 md:gap-8 min-w-0">
            <Link
              href="/resident"
              className="hidden md:inline-flex items-center gap-2 shrink-0"
            >
              <span className="text-h3 font-bold text-gradient-brand tracking-tight">
                GDV
              </span>
            </Link>

            <div className="md:hidden flex items-center gap-3 min-w-0">
              <Avatar size="md" name={userName} />
              <div className="min-w-0">
                <p className="text-body-sm text-text-secondary leading-tight">
                  {greeting},
                </p>
                <p className="text-body font-semibold text-text-primary truncate leading-tight">
                  {firstName}
                </p>
              </div>
            </div>

            <DesktopNav />
          </div>

          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <IconButton
              label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
              icon={<ThemeIcon />}
              variant="ghost"
              size="md"
              onClick={toggle}
              showTooltip
            />
            {/* Desktop avatar */}

            <UserMenu
              name={userName}
              email={userEmail ?? ""} // ← if userEmail not passed, you'll need to pass it from layout
              role="RESIDENT"
              profileHref="/resident/profile"
              avatarSize="md"
            />
          </div>
        </div>
      </header>

      {/* ───── Main content ───── */}

      <main className="flex-1 pb-24 md:pb-12">
        <PullToRefresh>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {children}
          </div>
        </PullToRefresh>
      </main>

      {/* ───── Floating tab bar (mobile only) ───── */}
      <div className="md:hidden">
        <FloatingTabBar items={NAV_ITEMS} rootHref="/resident" />
      </div>
    </div>
  );
}

function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveRoute(pathname, item.href, {
          rootHref: "/resident",
        });

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative inline-flex items-center gap-2 justify-center",
              "px-3 py-2 rounded-md text-body-sm font-medium",
              "transition-colors duration-(--duration-fast)",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
              "focus-visible:ring-offset-bg-base",
              isActive
                ? "text-text-primary bg-bg-sunken"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-sunken/60",
            )}
          >
            <span className="w-4 h-4 inline-flex">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
