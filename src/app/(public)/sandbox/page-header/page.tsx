"use client";

import {
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Bell,
  Settings,
  ArrowRight,
  CreditCard,
  Building2,
} from "lucide-react";
import PageHeader from "@/components/navigation/PageHeader";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import IconButton from "@/components/atoms/IconButton";
import Avatar from "@/components/atoms/Avatar";

export default function PageHeaderSandbox() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-12">
      {/* ─── Basic ─── */}
      <Card padding="lg">
        <PageHeader
          title="Page Title"
          description="Optional one-liner that explains what this page is for."
        />
        <div className="p-4 bg-bg-sunken rounded text-body-sm text-text-secondary">
          [Page content area]
        </div>
      </Card>

      {/* ─── With actions ─── */}
      <Card padding="lg">
        <PageHeader
          title="Master Ledger"
          description="Overview of all 47 villas and their billing status"
          actions={
            <>
              <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
                Filter
              </Button>
              <Button
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
              >
                Export
              </Button>
              <Button icon={<Plus className="w-4 h-4" />}>
                Generate Bills
              </Button>
            </>
          }
        />
        <div className="p-4 bg-bg-sunken rounded text-body-sm text-text-secondary">
          [Master ledger table here]
        </div>
      </Card>

      {/* ─── With breadcrumbs ─── */}
      <Card padding="lg">
        <PageHeader
          breadcrumbs={[
            { label: "Manage", href: "/admin" },
            { label: "Villas", href: "/admin/villas" },
            { label: "Villa 39" },
          ]}
          title="Villa 39"
          description="1,200 sqft • Bahadur Singh • Owner since 2018"
          badge={<Badge variant="brand">Owner</Badge>}
          actions={
            <>
              <Button variant="secondary" icon={<Edit className="w-4 h-4" />}>
                Edit
              </Button>
              <IconButton
                label="More options"
                icon={<MoreHorizontal />}
                variant="outline"
              />
            </>
          }
        />
        <div className="p-4 bg-bg-sunken rounded text-body-sm text-text-secondary">
          [Villa detail content]
        </div>
      </Card>

      {/* ─── With back button ─── */}
      <Card padding="lg">
        <PageHeader
          back={{ href: "/admin/residents", label: "Back to residents" }}
          title="Bahadur Singh"
          description="Resident of Villa 39 since January 2018"
          leading={<Avatar size="lg" name="Bahadur Singh" status="online" />}
          actions={
            <>
              <Button variant="secondary">Send Message</Button>
              <Button icon={<CreditCard className="w-4 h-4" />}>
                Record Payment
              </Button>
            </>
          }
        />
        <div className="p-4 bg-bg-sunken rounded text-body-sm text-text-secondary">
          [Resident profile content]
        </div>
      </Card>

      {/* ─── With tabs ─── */}
      <Card padding="lg">
        <PageHeader
          title="Bills"
          description="Manage and generate maintenance bills"
          actions={
            <Button icon={<Plus className="w-4 h-4" />}>Generate Bills</Button>
          }
          bordered
          tabs={<FakeTabs />}
        />
        <div className="p-6 bg-bg-sunken rounded text-body-sm text-text-secondary">
          [Tab content area]
        </div>
      </Card>

      {/* ─── Compact ─── */}
      <Card padding="lg">
        <PageHeader
          compact
          title="Compact Mode"
          description="Smaller title, tighter spacing — for sub-pages or modals."
          actions={<Button size="sm">Action</Button>}
        />
        <div className="p-4 bg-bg-sunken rounded text-body-sm text-text-secondary">
          [Sub-page content]
        </div>
      </Card>

      {/* ─── Just title ─── */}
      <Card padding="lg">
        <PageHeader title="Minimal — just a title" />
        <div className="p-4 bg-bg-sunken rounded text-body-sm text-text-secondary">
          [Content]
        </div>
      </Card>

      {/* ─── Real-world: Resident home ─── */}
      <Card padding="lg">
        <PageHeader
          title="Good morning, Bahadur"
          description="Here's your maintenance overview"
          leading={<Avatar size="xl" name="Bahadur Singh" ring="brand" />}
          actions={
            <IconButton
              label="Notifications"
              icon={
                <div className="relative">
                  <Bell />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger ring-2 ring-bg-base" />
                </div>
              }
              variant="ghost"
              size="lg"
            />
          }
        />
        <Card padding="md" variant="gradient">
          <p className="text-micro uppercase text-text-muted">YOU OWE</p>
          <p className="text-display-1 font-mono text-gradient-brand mt-2">
            ₹6,320
          </p>
          <p className="text-body text-text-secondary mt-1">
            2 unpaid bills • next due Jun 10
          </p>
        </Card>
      </Card>

      {/* ─── Real-world: Settings page ─── */}
      <Card padding="lg">
        <PageHeader
          breadcrumbs={[
            { label: "Admin", href: "/admin" },
            { label: "Settings" },
          ]}
          title="Society Settings"
          description="Update billing rates, sinking fund percentage, and society-wide configuration."
          leading={
            <div className="w-12 h-12 rounded-md bg-brand-primary/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-brand-primary" />
            </div>
          }
          actions={<Button>Save Changes</Button>}
          bordered
        />
        <div className="pt-6 p-4 bg-bg-sunken rounded text-body-sm text-text-secondary">
          [Settings form]
        </div>
      </Card>

      {/* ─── Real-world: List page ─── */}
      <Card padding="lg">
        <PageHeader
          title="Villas"
          description="47 total villas — 44 billable, 1 claimed"
          badge={<Badge variant="brand">47</Badge>}
          actions={
            <>
              <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
                Filter
              </Button>
              <Button icon={<Plus className="w-4 h-4" />}>Add Villa</Button>
            </>
          }
          tabs={
            <div className="flex gap-1 border-b border-border-subtle">
              {["All", "Billable", "Not billable", "Unclaimed"].map((t, i) => (
                <button
                  key={t}
                  className={`px-4 py-2 text-body-sm border-b-2 -mb-px transition-colors ${
                    i === 0
                      ? "border-brand-primary text-brand-primary font-medium"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          }
        />
        <div className="pt-6 p-4 bg-bg-sunken rounded text-body-sm text-text-secondary">
          [Villas list]
        </div>
      </Card>

      {/* ─── Loading state pattern ─── */}
      <Card padding="lg">
        <PageHeader
          title={
            <span className="inline-block w-48 h-8 bg-bg-sunken rounded animate-[var(--animate-shimmer)] bg-[length:200%_100%] bg-gradient-to-r from-bg-sunken via-bg-elevated to-bg-sunken" />
          }
          description={
            <span className="inline-block w-72 h-4 bg-bg-sunken rounded animate-[var(--animate-shimmer)] bg-[length:200%_100%] bg-gradient-to-r from-bg-sunken via-bg-elevated to-bg-sunken" />
          }
        />
        <div className="p-4 bg-bg-sunken rounded text-body-sm text-text-secondary">
          [Skeleton header pattern — use Skeleton component in production]
        </div>
      </Card>
    </div>
  );
}

// ─── Fake tabs for the demo ───
function FakeTabs() {
  return (
    <div className="flex gap-1 border-b border-border-subtle">
      {[
        { label: "All Bills", count: 44 },
        { label: "Pending", count: 12 },
        { label: "Partial", count: 3 },
        { label: "Paid", count: 29 },
      ].map((tab, i) => (
        <button
          key={tab.label}
          className={`flex items-center gap-2 px-4 py-3 text-body-sm border-b-2 -mb-px transition-colors ${
            i === 0
              ? "border-brand-primary text-brand-primary font-medium"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          {tab.label}
          <Badge size="sm" variant={i === 0 ? "brand" : "neutral"}>
            {tab.count}
          </Badge>
        </button>
      ))}
    </div>
  );
}
