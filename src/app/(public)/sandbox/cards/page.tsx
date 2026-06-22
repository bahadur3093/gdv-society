"use client";

import Link from "next/link";
import {
  CreditCard,
  TrendingUp,
  Users,
  AlertCircle,
  ArrowRight,
  MoreVertical,
  Star,
  MapPin,
} from "lucide-react";
import Card, {
  CardBody,
  CardFooter,
  CardHeader,
} from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import IconButton from "@/components/atoms/IconButton";

export default function CardsSandbox() {
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">Card</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          The universal surface — from stat tiles to modal containers.
        </p>
      </header>

      {/* ─── Variants ─── */}
      <Section title="Variants">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="default">
            <div className="text-h4 text-text-primary">Default</div>
            <p className="text-body-sm text-text-secondary mt-1">
              Elevated surface with subtle border. Most common.
            </p>
          </Card>

          <Card variant="sunken">
            <div className="text-h4 text-text-primary">Sunken</div>
            <p className="text-body-sm text-text-secondary mt-1">
              Recessed surface. Use for nested or quiet content.
            </p>
          </Card>

          <Card variant="gradient">
            <div className="text-h4 text-text-primary">Gradient</div>
            <p className="text-body-sm text-text-secondary mt-1">
              Subtle aurora mesh. Reserve for hero moments only.
            </p>
          </Card>

          <Card variant="glass">
            <div className="text-h4 text-text-primary">Glass</div>
            <p className="text-body-sm text-text-secondary mt-1">
              Translucent + backdrop-blur. For floating overlays.
            </p>
          </Card>

          <Card variant="outline">
            <div className="text-h4 text-text-primary">Outline</div>
            <p className="text-body-sm text-text-secondary mt-1">
              No background, just border. Subtle grouping.
            </p>
          </Card>
        </div>
      </Section>

      {/* ─── Padding sizes ─── */}
      <Section title="Padding Sizes">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="none" className="text-center">
            <div className="text-body-sm text-text-primary p-2 bg-bg-sunken">
              padding="none"
            </div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-body-sm text-text-primary">
              padding="sm" (p-4)
            </div>
          </Card>
          <Card padding="md" className="text-center">
            <div className="text-body-sm text-text-primary">
              padding="md" (p-6)
            </div>
          </Card>
          <Card padding="lg" className="text-center">
            <div className="text-body-sm text-text-primary">
              padding="lg" (p-8)
            </div>
          </Card>
        </div>
      </Section>

      {/* ─── Interactive ─── */}
      <Section title="Interactive (hoverable, clickable)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card interactive>
            <div className="text-h4 text-text-primary">Hover me</div>
            <p className="text-body-sm text-text-secondary mt-1">
              Subtle lift and shadow increase.
            </p>
          </Card>

          <Card interactive asChild>
            <Link href={""}>
              <div className="text-h4 text-text-primary">As Link</div>
              <p className="text-body-sm text-text-secondary mt-1">
                Renders as &lt;a&gt; — Tab to focus.
              </p>
            </Link>
          </Card>

          <Card
            interactive
            variant="gradient"
            onClick={() => alert("Card clicked!")}
            role="button"
            tabIndex={0}
          >
            <div className="text-h4 text-text-primary">As Button</div>
            <p className="text-body-sm text-text-secondary mt-1">
              Click triggers handler.
            </p>
          </Card>
        </div>
      </Section>

      {/* ─── With compound parts ─── */}
      <Section title="Compound Parts: Header + Body + Footer">
        <Card padding="md">
          <CardHeader
            title="Monthly Report"
            description="Society maintenance for June 2026"
            action={<IconButton label="Menu" icon={<MoreVertical />} />}
          />
          <CardBody>
            <div className="space-y-2 text-body text-text-secondary">
              <p>Total billed: ₹2,11,200 across 44 villas</p>
              <p>Collected: ₹1,12,400 (53%)</p>
              <p>12 residents have outstanding dues</p>
            </div>
          </CardBody>
          <CardFooter>
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary">Download PDF</Button>
          </CardFooter>
        </Card>
      </Section>

      {/* ─── StatCard pattern (preview of composite) ─── */}
      <Section title="Stat Cards (admin overview)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-micro uppercase text-text-muted">
                  Total Billed
                </p>
                <p className="text-h2 font-mono text-text-primary mt-2">
                  ₹2,11,200
                </p>
                <p className="text-body-sm text-text-secondary mt-1">
                  Across 44 villas
                </p>
              </div>
              <div className="p-2 rounded-md bg-brand-primary/10 text-brand-primary">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-micro uppercase text-text-muted">
                  Collected
                </p>
                <p className="text-h2 font-mono text-success mt-2">₹1,12,400</p>
                <p className="text-body-sm text-text-secondary mt-1">
                  53% collection rate
                </p>
              </div>
              <div className="p-2 rounded-md bg-success/10 text-success">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-micro uppercase text-text-muted">
                  Outstanding
                </p>
                <p className="text-h2 font-mono text-warning mt-2">₹98,800</p>
                <p className="text-body-sm text-text-secondary mt-1">
                  From 12 villas
                </p>
              </div>
              <div className="p-2 rounded-md bg-warning/10 text-warning">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-micro uppercase text-text-muted">
                  Defaulters
                </p>
                <p className="text-h2 font-mono text-danger mt-2">12</p>
                <p className="text-body-sm text-text-secondary mt-1">
                  Of 47 residents
                </p>
              </div>
              <div className="p-2 rounded-md bg-danger/10 text-danger">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* ─── Hero card (gradient) ─── */}
      <Section title="Hero Card (resident home)">
        <Card variant="gradient" padding="lg" className="max-w-md">
          <p className="text-micro uppercase text-text-muted">YOU OWE</p>
          <p className="text-display-1 font-mono text-gradient-brand mt-2">
            ₹6,320
          </p>
          <p className="text-body text-text-secondary mt-1">
            2 unpaid bills • next due Jun 10
          </p>
          <Button
            variant="gradient"
            size="xl"
            shape="pill"
            fullWidth
            className="mt-6"
          >
            Pay Now
          </Button>
        </Card>
      </Section>

      {/* ─── List item card pattern ─── */}
      <Section title="List Item Cards (mobile-friendly)">
        <div className="space-y-3 max-w-2xl">
          {[
            {
              villa: 39,
              name: "Bahadur Singh",
              amount: "₹6,320",
              status: "PARTIAL",
              tag: "text-warning",
            },
            {
              villa: 12,
              name: "Priya Sharma",
              amount: "₹3,000",
              status: "PENDING",
              tag: "text-danger",
            },
            {
              villa: 5,
              name: "Ramesh Kumar",
              amount: "₹0",
              status: "PAID",
              tag: "text-success",
            },
          ].map((row) => (
            <Card key={row.villa} interactive padding="sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-bg-sunken flex items-center justify-center font-mono text-body-sm text-text-secondary shrink-0">
                  {row.villa}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body text-text-primary font-medium">
                    {row.name}
                  </p>
                  <p className={`text-body-sm font-medium ${row.tag}`}>
                    {row.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-body text-text-primary">
                    {row.amount}
                  </p>
                </div>
                <IconButton size="sm" label="More" icon={<ArrowRight />} />
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ─── Glass nav preview ─── */}
      <Section title="Glass Card (floating nav preview)">
        <div className="relative h-64 rounded-lg overflow-hidden bg-bg-aurora p-8">
          {/* Some content behind the nav */}
          <div className="absolute inset-0 bg-[image:var(--gradient-aurora)] pointer-events-none" />
          <div className="absolute inset-0 flex items-end justify-center pb-6">
            <Card
              variant="glass"
              padding="none"
              radius="xl"
              className="px-2 py-2 inline-flex gap-1"
            >
              {["Home", "Ledger", "Bell", "Me"].map((label, i) => (
                <button
                  key={label}
                  className={cn(
                    "px-4 py-2 rounded-full text-body-sm font-medium transition-colors",
                    i === 0
                      ? "bg-brand-primary/20 text-brand-primary"
                      : "text-text-secondary hover:bg-bg-sunken",
                  )}
                >
                  {label}
                </button>
              ))}
            </Card>
          </div>
          <p className="text-body-sm text-text-muted relative z-10">
            Preview of resident floating tab bar.
          </p>
        </div>
      </Section>

      {/* ─── Outline card ─── */}
      <Section title="Outline Cards (subtle grouping)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Villa 39", value: "1,200 sqft", icon: MapPin },
            { label: "Plot Rate", value: "₹3/sqft", icon: TrendingUp },
            { label: "Member since", value: "Jan 2026", icon: Star },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} variant="outline" padding="sm">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-text-muted shrink-0" />
                <div>
                  <p className="text-body-sm text-text-secondary">{label}</p>
                  <p className="text-body text-text-primary font-medium">
                    {value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ─── Full Height (grid) ─── */}
      <Section title="Full Height (cards stretch in grid)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          <Card fullHeight>
            <p className="text-h4 text-text-primary">Short content</p>
            <p className="text-body-sm text-text-secondary mt-1">
              Just a couple lines.
            </p>
          </Card>
          <Card fullHeight>
            <p className="text-h4 text-text-primary">Medium content</p>
            <p className="text-body-sm text-text-secondary mt-1">
              A bit more text. Maybe two or three sentences. All cards in this
              grid should be the same height.
            </p>
          </Card>
          <Card fullHeight>
            <p className="text-h4 text-text-primary">Long content</p>
            <p className="text-body-sm text-text-secondary mt-1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation.
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
}

// ─── Helpers ───
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

function cn(...args: (string | false | undefined)[]) {
  return args.filter(Boolean).join(" ");
}
