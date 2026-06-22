"use client";

import { useState } from "react";
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
  Receipt,
  CreditCard,
  Building2,
  Clock,
  Sparkles,
} from "lucide-react";
import Button from "@/components/atoms/Button";
import StatCard from "@/components/molecules/StatCard";

export default function StatCardsSandbox() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">StatCard</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          The first composite — built from Card, with built-in formatting,
          trends, and loading state.
        </p>
      </header>

      <Button onClick={() => setLoading((l) => !l)}>
        Toggle loading: {loading ? "ON" : "OFF"}
      </Button>

      {/* ─── Basic Usage ─── */}
      <Section title="Basic Usage">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Billed"
            value={211200}
            format="currency"
            description="Across 44 villas"
            icon={<Wallet />}
            accent="brand"
            loading={loading}
          />
          <StatCard
            label="Collected"
            value={112400}
            format="currency"
            description="53% collection rate"
            icon={<CheckCircle2 />}
            accent="success"
            loading={loading}
          />
          <StatCard
            label="Outstanding"
            value={98800}
            format="currency"
            description="From 12 villas"
            icon={<AlertTriangle />}
            accent="warning"
            loading={loading}
          />
          <StatCard
            label="Defaulters"
            value={12}
            format="number"
            description="Of 47 residents"
            icon={<Users />}
            accent="danger"
            loading={loading}
          />
        </div>
      </Section>

      {/* ─── With Trend Indicators ─── */}
      <Section title="With Trend Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Revenue"
            value={211200}
            format="currency"
            icon={<TrendingUp />}
            accent="brand"
            trend={{
              direction: "up",
              value: "+12%",
              label: "vs last month",
            }}
          />
          <StatCard
            label="Defaulters"
            value={12}
            format="number"
            icon={<Users />}
            accent="danger"
            trend={{
              direction: "down",
              value: "-3",
              label: "vs last month",
              upIsGood: false, // down is good for defaulters
            }}
          />
          <StatCard
            label="Bills generated"
            value={47}
            format="number"
            icon={<Receipt />}
            accent="info"
            trend={{
              direction: "flat",
              value: "No change",
            }}
          />
        </div>
      </Section>

      {/* ─── Compact Currency ─── */}
      <Section title="Compact Currency (₹1.5L instead of ₹1,50,000)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Year Revenue"
            value={2533000}
            format="currency-compact"
            description="Apr 2025 - Mar 2026"
            icon={<Wallet />}
            accent="brand"
          />
          <StatCard
            label="Sinking Fund"
            value={1800000}
            format="currency-compact"
            description="Available balance"
            icon={<Building2 />}
            accent="success"
          />
          <StatCard
            label="Yearly Expenses"
            value={1240000}
            format="currency-compact"
            description="Operational"
            icon={<Clock />}
            accent="warning"
          />
        </div>
      </Section>

      {/* ─── Hero Variant (resident home) ─── */}
      <Section title="Hero Variant (with gradient value)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            label="YOU OWE"
            value={6320}
            format="currency"
            description="2 unpaid bills • next due Jun 10"
            variant="hero"
            gradientValue
          />
          <StatCard
            label="THIS MONTH'S BILL"
            value={3600}
            format="currency"
            description="1,200 sqft × ₹3/sqft"
            icon={<Sparkles />}
            accent="brand"
            variant="hero"
            gradientValue
          />
        </div>
      </Section>

      {/* ─── Hero variants in gradient card ─── */}
      <Section title="Hero in Gradient Card">
        <StatCard
          label="YOU OWE"
          value={6320}
          format="currency"
          description="2 unpaid bills • next due Jun 10"
          variant="hero"
          gradientValue
          padding="lg"
          variant_card="gradient"
          {...({} as any)}
          className="max-w-md"
        />
        <p className="text-body-sm text-text-muted mt-2">
          (Note: Card variant prop is on StatCard via Card inheritance — wrap or
          pass directly)
        </p>
      </Section>

      {/* ─── All Accent Colors ─── */}
      <Section title="All Accent Colors">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(
            [
              "neutral",
              "brand",
              "success",
              "warning",
              "danger",
              "info",
            ] as const
          ).map((accent) => (
            <StatCard
              key={accent}
              label={accent}
              value={1234}
              format="number"
              icon={<Sparkles />}
              accent={accent}
            />
          ))}
        </div>
      </Section>

      {/* ─── String Values (custom format) ─── */}
      <Section title="String Values (any text)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Status"
            value="Active"
            icon={<CheckCircle2 />}
            accent="success"
          />
          <StatCard
            label="Plan"
            value="Premium"
            icon={<Sparkles />}
            accent="brand"
          />
          <StatCard
            label="Next billing"
            value="Jul 10"
            icon={<Clock />}
            accent="info"
            description="Auto-pay enabled"
          />
        </div>
      </Section>

      {/* ─── Mixed Real-World Layout ─── */}
      <Section title="Real-World: Admin Master Ledger Header">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Villas"
            value="47"
            description="44 billable"
            icon={<Building2 />}
            accent="neutral"
          />
          <StatCard
            label="Total Billed"
            value={211200}
            format="currency"
            description="June 2026"
            icon={<Receipt />}
            accent="brand"
            trend={{
              direction: "up",
              value: "+₹3,200",
              label: "vs May",
            }}
          />
          <StatCard
            label="Collected"
            value={112400}
            format="currency"
            description="53% collection rate"
            icon={<CreditCard />}
            accent="success"
          />
          <StatCard
            label="Outstanding"
            value={98800}
            format="currency"
            description="12 defaulters"
            icon={<AlertTriangle />}
            accent="warning"
          />
        </div>
      </Section>

      {/* ─── Interactive (clickable) ─── */}
      <Section title="Interactive (clickable card)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Defaulters"
            value={12}
            format="number"
            description="Click to view list →"
            icon={<Users />}
            accent="danger"
            interactive
            onClick={() => alert("Navigate to defaulters list")}
          />
          <StatCard
            label="Pending Approvals"
            value={5}
            format="number"
            description="Click to review →"
            icon={<Clock />}
            accent="warning"
            interactive
            onClick={() => alert("Navigate to approvals")}
          />
          <StatCard
            label="New Residents"
            value={3}
            format="number"
            description="This month"
            icon={<Sparkles />}
            accent="brand"
            interactive
            onClick={() => alert("Navigate to new residents")}
          />
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
