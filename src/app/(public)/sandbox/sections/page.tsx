"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Bell,
  Users,
  FileText,
  Settings,
  History,
  Sparkles,
  ArrowRight,
  Plus,
  ChevronRight,
} from "lucide-react";
import Section from "@/components/organisms/Section";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import StatCard from "@/components/molecules/StatCard";
import Badge from "@/components/atoms/Badge";
import EmptyState from "@/components/organisms/EmptyState";

export default function SectionsSandbox() {
  const [controlled, setControlled] = useState(true);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">Section</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          Consistent section headers — the glue that makes pages feel like one
          design.
        </p>
      </header>

      {/* ─── Basic ─── */}
      <Section
        title="Basic section"
        description="Just title + description. Simplest form."
      >
        <Card padding="md">
          <p className="text-body text-text-secondary">
            Section content goes here. No icon, no action — minimal.
          </p>
        </Card>
      </Section>

      {/* ─── With icon ─── */}
      <Section
        title="With icon"
        description="Icon adds visual context at a glance."
        icon={<Receipt />}
      >
        <Card padding="md">
          <p className="text-body text-text-secondary">
            Sections with icons feel categorized. Good for navigation.
          </p>
        </Card>
      </Section>

      {/* ─── With badge ─── */}
      <Section
        title="With badge"
        description="Badge can indicate count, status, or category."
        icon={<Bell />}
        badge={{ label: "5 new", variant: "danger", size: "sm" }}
      >
        <Card padding="md">
          <p className="text-body text-text-secondary">
            Useful for: notifications, pending items, draft counts.
          </p>
        </Card>
      </Section>

      {/* ─── With action ─── */}
      <Section
        title="With action"
        description="Right-aligned action button for the section."
        icon={<Receipt />}
        action={
          <Button variant="ghost" size="sm" icon={<Plus className="w-4 h-4" />}>
            Add bill
          </Button>
        }
      >
        <Card padding="md">
          <p className="text-body text-text-secondary">
            Action is on the right, vertically centered with the title.
          </p>
        </Card>
      </Section>

      {/* ─── Action as Link ─── */}
      <Section
        title="Action as link"
        description="Common pattern: 'View all' going to another page."
        icon={<History />}
        action={
          <Link
            href={"/sandbox"}
            className="inline-flex items-center gap-1 text-body-sm text-brand-primary hover:underline"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        <Card padding="md">
          <p className="text-body text-text-secondary">
            For ledger summaries, transaction history snippets, etc.
          </p>
        </Card>
      </Section>

      {/* ─── Sizes ─── */}
      <Section
        title="Sizes"
        description="Three sizes scale title + icon proportionally."
      >
        <div className="space-y-6">
          <Section
            size="sm"
            title="Small section"
            description="Use inside cards or compact panels"
            icon={<Receipt />}
          >
            <Card padding="sm" variant="sunken">
              <p className="text-body-sm text-text-secondary">
                Small section content
              </p>
            </Card>
          </Section>

          <Section
            size="md"
            title="Medium (default)"
            description="Default for page sections"
            icon={<Receipt />}
          >
            <Card padding="md" variant="sunken">
              <p className="text-body text-text-secondary">
                Medium section content
              </p>
            </Card>
          </Section>

          <Section
            size="lg"
            title="Large section"
            description="Page-level section headers"
            icon={<Receipt />}
          >
            <Card padding="md" variant="sunken">
              <p className="text-body text-text-secondary">
                Large section content
              </p>
            </Card>
          </Section>
        </div>
      </Section>

      {/* ─── Dividers ─── */}
      <Section
        title="With dividers"
        description="Visual separators around the header."
      >
        <div className="bg-bg-elevated rounded-md border border-border-subtle p-6 space-y-8">
          <Section
            divider="none"
            title="No divider (default)"
            description="Sections flow naturally"
          >
            <p className="text-body-sm text-text-muted">Content here...</p>
          </Section>

          <Section
            divider="top"
            title="Top divider"
            description="Border above the header"
          >
            <p className="text-body-sm text-text-muted">Content here...</p>
          </Section>

          <Section
            divider="bottom"
            title="Bottom divider"
            description="Border below content"
          >
            <p className="text-body-sm text-text-muted">Content here...</p>
          </Section>

          <Section
            divider="both"
            title="Both dividers"
            description="Borders top and bottom"
          >
            <p className="text-body-sm text-text-muted">Content here...</p>
          </Section>
        </div>
      </Section>

      {/* ─── Collapsible ─── */}
      <Section
        title="Collapsible"
        description="User can toggle visibility. Animates smoothly."
      >
        <div className="space-y-3">
          <Section
            collapsible
            title="Click chevron to collapse"
            description="Defaults to open"
            icon={<FileText />}
          >
            <Card padding="md" variant="sunken">
              <p className="text-body text-text-secondary">
                This content can be hidden. Useful for FAQ, advanced settings,
                etc.
              </p>
            </Card>
          </Section>

          <Section
            collapsible
            defaultOpen={false}
            title="Starts collapsed"
            description="Use defaultOpen={false}"
            icon={<Settings />}
            badge={{ label: "Advanced", variant: "neutral", size: "sm" }}
          >
            <Card padding="md" variant="sunken">
              <p className="text-body text-text-secondary">
                Hidden by default. Click to expand.
              </p>
            </Card>
          </Section>

          {/* Controlled */}
          <Section
            collapsible
            open={controlled}
            onOpenChange={setControlled}
            title="Controlled state"
            description={`Currently ${controlled ? "open" : "closed"}`}
            icon={<Sparkles />}
            action={
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setControlled((c) => !c)}
              >
                Toggle from outside
              </Button>
            }
          >
            <Card padding="md" variant="sunken">
              <p className="text-body text-text-secondary">
                Parent component controls the open state via props.
              </p>
            </Card>
          </Section>
        </div>
      </Section>

      {/* ─── Real-world: Admin Master Ledger ─── */}
      <Section
        title="Real-world: Admin Master Ledger Overview"
        description="Mixing StatCards inside Sections — the actual pattern."
        size="lg"
        divider="top"
      >
        <div className="space-y-6">
          <Section
            title="Summary"
            description="Current month totals"
            icon={<Receipt />}
            badge={{ label: "June 2026", variant: "info", size: "sm" }}
          >
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
                icon={<Receipt />}
                accent="success"
              />
              <StatCard
                label="Outstanding"
                value={98800}
                format="currency"
                icon={<Receipt />}
                accent="warning"
              />
              <StatCard
                label="Defaulters"
                value={12}
                format="number"
                icon={<Users />}
                accent="danger"
              />
            </div>
          </Section>

          <Section
            title="Defaulters"
            description="Residents with outstanding dues"
            icon={<Users />}
            badge={{ label: "12", variant: "danger", size: "sm" }}
            action={
              <Button
                size="sm"
                variant="ghost"
                icon={<ChevronRight className="w-4 h-4" />}
                iconPosition="right"
              >
                View all
              </Button>
            }
          >
            <Card padding="md" variant="sunken">
              <p className="text-body text-text-secondary text-center py-4">
                [List of defaulters would go here]
              </p>
            </Card>
          </Section>

          <Section
            collapsible
            defaultOpen={false}
            title="Recent Activity"
            description="Last 7 days of transactions"
            icon={<History />}
          >
            <Card padding="md" variant="sunken">
              <p className="text-body text-text-secondary text-center py-4">
                [Activity feed would go here]
              </p>
            </Card>
          </Section>
        </div>
      </Section>

      {/* ─── No content ─── */}
      <Section
        title="No content (header only)"
        description="Useful as a divider with just visual hierarchy."
        icon={<Sparkles />}
        action={<Badge variant="brand">Pro</Badge>}
        divider="bottom"
      />

      {/* ─── Empty section ─── */}
      <Section
        title="Empty Bills"
        description="Section can host an EmptyState when no data exists"
        icon={<Receipt />}
      >
        <Card padding="md">
          <EmptyState
            size="sm"
            icon={<Receipt />}
            title="No bills generated yet"
            description="Generate the first batch of monthly bills."
            action={{ label: "Generate Bills" }}
          />
        </Card>
      </Section>
    </div>
  );
}
