"use client";

import { useState } from "react";
import {
  Home,
  FileText,
  Bell,
  User,
  ShoppingBag,
  Wallet,
  Search,
  Heart,
  MessageCircle,
} from "lucide-react";
import FloatingTabBar, {
  type TabItem,
} from "@/components/navigation/FloatingTabBar";
import Card from "@/components/atoms/Card";
import StatCard from "@/components/molecules/StatCard";

export default function FloatingTabBarSandbox() {
  const [showLabels, setShowLabels] = useState(false);
  const [hideOnScroll, setHideOnScroll] = useState(true);

  // The actual resident nav (4 tabs)
  const residentTabs: TabItem[] = [
    {
      key: "home",
      href: "/sandbox/floating-tab-bar",
      icon: <Home />,
      label: "Home",
    },
    {
      key: "ledger",
      href: "/sandbox/floating-tab-bar/ledger",
      icon: <FileText />,
      label: "Ledger",
    },
    {
      key: "bell",
      href: "/sandbox/floating-tab-bar/bell",
      icon: <Bell />,
      label: "Notifications",
      badge: { label: "3", variant: "danger" },
    },
    {
      key: "me",
      href: "/sandbox/floating-tab-bar/me",
      icon: <User />,
      label: "Me",
      badge: { dot: true, variant: "warning" },
    },
  ];

  // 5-tab variant
  const fiveTabs: TabItem[] = [
    { key: "home", href: "/a", icon: <Home />, label: "Home" },
    { key: "search", href: "/b", icon: <Search />, label: "Search" },
    {
      key: "cart",
      href: "/c",
      icon: <ShoppingBag />,
      label: "Cart",
      badge: { label: "12", variant: "brand" },
    },
    { key: "fav", href: "/d", icon: <Heart />, label: "Favorites" },
    { key: "me", href: "/e", icon: <User />, label: "Profile" },
  ];

  // 3-tab variant
  const threeTabs: TabItem[] = [
    { key: "home", href: "/x", icon: <Home />, label: "Home" },
    {
      key: "chat",
      href: "/y",
      icon: <MessageCircle />,
      label: "Chat",
      badge: { label: "99+", variant: "danger" },
    },
    { key: "wallet", href: "/z", icon: <Wallet />, label: "Wallet" },
  ];

  return (
    <div className="max-w-md mx-auto p-6 pb-24 space-y-8">
      <header>
        <h1 className="text-h1 text-text-primary">FloatingTabBar</h1>
        <p className="text-body text-text-secondary mt-2">
          Resident mobile navigation. Look down — the bar is at the bottom!
        </p>
      </header>

      <Card padding="md" variant="sunken">
        <p className="text-body-sm text-text-primary mb-2">
          💡 Best tested on mobile or browser DevTools mobile mode.
        </p>
        <p className="text-body-sm text-text-secondary">
          The active tab below (&quot;Home&rdquo;) matches the current URL.
        </p>
      </Card>

      {/* Controls */}
      <Card padding="md">
        <h2 className="text-h3 text-text-primary mb-3">Controls</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="accent-brand-primary"
            />
            <span className="text-body text-text-primary">
              Always show labels
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hideOnScroll}
              onChange={(e) => setHideOnScroll(e.target.checked)}
              className="accent-brand-primary"
            />
            <span className="text-body text-text-primary">
              Hide on scroll down
            </span>
          </label>
        </div>
      </Card>

      {/* Fake content for scrolling */}
      <div className="space-y-4">
        <StatCard
          label="YOU OWE"
          value={6320}
          format="currency"
          description="2 unpaid bills"
          variant="hero"
          gradientValue
        />

        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} padding="md">
            <p className="text-h4 text-text-primary">Scroll content {i + 1}</p>
            <p className="text-body-sm text-text-secondary mt-1">
              Scroll down to see the tab bar hide. Scroll back up to bring it
              back. The active tab stays violet.
            </p>
          </Card>
        ))}
      </div>

      {/* Variants preview (static, not floating) */}
      <Card padding="md">
        <h2 className="text-h3 text-text-primary mb-4">Other Configurations</h2>
        <div className="space-y-6">
          {/* 5 tabs */}
          <div>
            <p className="text-body-sm text-text-muted mb-2">
              5 tabs (e-commerce)
            </p>
            <div className="relative h-20 bg-bg-sunken rounded-lg">
              <PreviewBar items={fiveTabs} showLabels={false} />
            </div>
          </div>

          {/* 3 tabs */}
          <div>
            <p className="text-body-sm text-text-muted mb-2">
              3 tabs (messaging)
            </p>
            <div className="relative h-20 bg-bg-sunken rounded-lg">
              <PreviewBar items={threeTabs} showLabels />
            </div>
          </div>
        </div>
      </Card>

      {/* Actual floating tab bar */}
      <FloatingTabBar
        items={residentTabs}
        showLabels={showLabels}
      />
    </div>
  );
}

// Static preview helper (no fixed positioning)
function PreviewBar({
  items,
  showLabels,
}: {
  items: TabItem[];
  showLabels: boolean;
}) {
  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)]">
      <div className="flex items-center justify-around gap-1 bg-bg-elevated/80 backdrop-blur-xl border border-border-subtle rounded-full shadow-md px-2 py-2">
        {items.map((item, i) => {
          const isActive = i === 0;
          return (
            <div
              key={item.key}
              className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 min-h-10 py-1.5 px-2 rounded-full ${
                isActive
                  ? "bg-brand-primary/15 text-brand-primary"
                  : "text-text-secondary"
              }`}
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-(image:--gradient-brand)" />
              )}
              <div className="relative">
                <span className="inline-flex w-4 h-4">{item.icon}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5">
                    <span className="block px-1 h-3.5 min-w-3.5 rounded-full bg-danger text-[9px] text-white font-medium leading-3.5 text-center ring-1 ring-bg-elevated">
                      {item.badge.label}
                    </span>
                  </span>
                )}
              </div>
              {(showLabels || isActive) && (
                <span className="text-[9px] font-medium leading-none">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
