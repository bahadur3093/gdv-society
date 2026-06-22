"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Bell,
  MapPin,
  Crown,
  ShieldCheck,
} from "lucide-react";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

export default function BadgesSandbox() {
  const [filters, setFilters] = useState([
    "Villa 39",
    "Pending",
    "Last 30 days",
    "UPI",
  ]);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">Badge</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          Status indicators, tags, counts, and filter chips. The unsung hero of
          UI.
        </p>
      </header>

      {/* ─── Variants ─── */}
      <Section title="Variants">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="brand">Brand</Badge>
        </div>
      </Section>

      {/* ─── Outline ─── */}
      <Section title="Outline (subtle emphasis)">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral" outline>
            Neutral
          </Badge>
          <Badge variant="success" outline>
            Success
          </Badge>
          <Badge variant="warning" outline>
            Warning
          </Badge>
          <Badge variant="danger" outline>
            Danger
          </Badge>
          <Badge variant="info" outline>
            Info
          </Badge>
          <Badge variant="brand" outline>
            Brand
          </Badge>
        </div>
      </Section>

      {/* ─── Sizes ─── */}
      <Section title="Sizes">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge size="sm" variant="success">
              Small
            </Badge>
            <Badge size="md" variant="success">
              Medium (default)
            </Badge>
            <Badge size="lg" variant="success">
              Large
            </Badge>
          </div>
          <p className="text-body-sm text-text-muted">
            sm = 20px (table cells), md = 24px (default), lg = 28px (hero)
          </p>
        </div>
      </Section>

      {/* ─── With Dot Prefix ─── */}
      <Section title="With Dot (status indicator)">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" dot>
            Online
          </Badge>
          <Badge variant="warning" dot>
            Away
          </Badge>
          <Badge variant="danger" dot>
            Offline
          </Badge>
          <Badge variant="info" dot>
            Recording
          </Badge>
          <Badge variant="brand" dot>
            Premium
          </Badge>
        </div>
      </Section>

      {/* ─── With Icon ─── */}
      <Section title="With Icon">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" icon={<CheckCircle2 />}>
            Paid
          </Badge>
          <Badge variant="warning" icon={<Clock />}>
            Partial
          </Badge>
          <Badge variant="danger" icon={<AlertCircle />}>
            Overdue
          </Badge>
          <Badge variant="brand" icon={<Crown />}>
            VIP
          </Badge>
          <Badge variant="info" icon={<ShieldCheck />}>
            Verified
          </Badge>
        </div>
      </Section>

      {/* ─── Removable (filter chips) ─── */}
      <Section title="Removable (filter chips)">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <Badge
                key={filter}
                variant="neutral"
                removable
                onRemove={() =>
                  setFilters((f) => f.filter((x) => x !== filter))
                }
              >
                {filter}
              </Badge>
            ))}
            {filters.length === 0 && (
              <p className="text-body-sm text-text-muted">
                All filters removed
              </p>
            )}
            <button
              type="button"
              onClick={() =>
                setFilters(["Villa 39", "Pending", "Last 30 days", "UPI"])
              }
              className="text-body-sm text-brand-primary hover:underline ml-2"
            >
              Reset
            </button>
          </div>
        </div>
      </Section>

      {/* ─── Real-world: Bill status in table ─── */}
      <Section title="Real-World: Bill Status in Table">
        <Card padding="none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle text-body-sm text-text-muted">
                <th className="text-left p-3 font-medium">Villa</th>
                <th className="text-left p-3 font-medium">Resident</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  villa: 39,
                  name: "Bahadur Singh",
                  amount: "₹6,320",
                  status: "partial",
                },
                {
                  villa: 12,
                  name: "Priya Sharma",
                  amount: "₹3,000",
                  status: "pending",
                },
                {
                  villa: 5,
                  name: "Ramesh Kumar",
                  amount: "₹0",
                  status: "paid",
                },
                {
                  villa: 23,
                  name: "Anita Verma",
                  amount: "₹4,800",
                  status: "overdue",
                },
              ].map((row) => (
                <tr
                  key={row.villa}
                  className="border-b border-border-subtle last:border-0"
                >
                  <td className="p-3 font-mono text-body text-text-secondary">
                    {row.villa}
                  </td>
                  <td className="p-3 text-body text-text-primary">
                    {row.name}
                  </td>
                  <td className="p-3 text-right font-mono text-body text-text-primary">
                    {row.amount}
                  </td>
                  <td className="p-3">
                    {row.status === "paid" && (
                      <Badge
                        size="sm"
                        variant="success"
                        icon={<CheckCircle2 />}
                      >
                        Paid
                      </Badge>
                    )}
                    {row.status === "partial" && (
                      <Badge size="sm" variant="warning" icon={<Clock />}>
                        Partial
                      </Badge>
                    )}
                    {row.status === "pending" && (
                      <Badge size="sm" variant="neutral" dot>
                        Pending
                      </Badge>
                    )}
                    {row.status === "overdue" && (
                      <Badge size="sm" variant="danger" icon={<AlertCircle />}>
                        Overdue
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      {/* ─── Real-world: Notification count ─── */}
      <Section title="Real-World: Notification Count">
        <div className="flex items-center gap-6">
          <div className="relative inline-block">
            <button
              type="button"
              aria-label="Notifications"
              className="w-12 h-12 rounded-full bg-bg-sunken flex items-center justify-center hover:bg-bg-elevated transition-colors border border-border-subtle"
            >
              <Bell className="w-5 h-5 text-text-secondary" />
            </button>
            <Badge
              variant="danger"
              size="sm"
              className="absolute -top-1 -right-1 min-w-5"
            >
              3
            </Badge>
          </div>

          <div className="relative inline-block">
            <button
              type="button"
              aria-label="Inbox"
              className="w-12 h-12 rounded-full bg-bg-sunken flex items-center justify-center hover:bg-bg-elevated transition-colors border border-border-subtle"
            >
              <Bell className="w-5 h-5 text-text-secondary" />
            </button>
            <Badge
              variant="danger"
              size="sm"
              className="absolute -top-1 -right-1 min-w-[1.25rem]"
            >
              99+
            </Badge>
          </div>
        </div>
      </Section>

      {/* ─── Real-world: Tags on a card ─── */}
      <Section title="Real-World: Tags on a Card">
        <Card padding="md" className="max-w-md">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-h4 text-text-primary">Villa 39</p>
              <p className="text-body-sm text-text-secondary">Bahadur Singh</p>
            </div>
            <Badge variant="brand" outline icon={<Crown />}>
              Owner
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge variant="neutral" outline size="sm" icon={<MapPin />}>
              1,200 sqft
            </Badge>
            <Badge variant="neutral" outline size="sm">
              Corner plot
            </Badge>
            <Badge variant="neutral" outline size="sm">
              East-facing
            </Badge>
            <Badge variant="info" outline size="sm" icon={<Zap />}>
              EV charging
            </Badge>
          </div>
        </Card>
      </Section>

      {/* ─── Combined ─── */}
      <Section title="Multiple Badges Side-by-Side">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand" icon={<Crown />} size="lg">
            Premium
          </Badge>
          <Badge variant="success" dot size="lg">
            Active
          </Badge>
          <Badge variant="info" size="lg">
            12 villas
          </Badge>
        </div>
      </Section>

      {/* ─── All semantic states (legend) ─── */}
      <Section title="Bill Status Legend">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Paid",
              variant: "success" as const,
              icon: <CheckCircle2 />,
            },
            { label: "Partial", variant: "warning" as const, icon: <Clock /> },
            { label: "Pending", variant: "neutral" as const, dot: true },
            {
              label: "Overdue",
              variant: "danger" as const,
              icon: <AlertCircle />,
            },
          ].map(({ label, variant, icon, dot }) => (
            <Card key={label} variant="outline" padding="sm">
              <div className="flex items-center gap-3">
                <Badge variant={variant} icon={icon} dot={dot}>
                  {label}
                </Badge>
                <p className="text-body-sm text-text-secondary">{label} bill</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-h3 text-text-primary border-b border-border-subtle pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}
