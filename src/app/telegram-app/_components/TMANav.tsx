"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Search, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils/utils";

const TABS = [
  { href: "/telegram-app/inbox", label: "Inbox", icon: Inbox },
  { href: "/telegram-app/search", label: "Search", icon: Search },
  { href: "/telegram-app/dashboard", label: "Stats", icon: BarChart3 },
];

export default function TMANav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-bg-elevated border-t border-border-default",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <div className="flex max-w-md mx-auto">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1",
                "py-2 px-2 min-h-14",
                "transition-colors duration-(--duration-fast)",
                active
                  ? "text-brand-primary"
                  : "text-text-muted hover:text-text-primary",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
