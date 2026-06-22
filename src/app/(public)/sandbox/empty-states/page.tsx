"use client";

import Card from "@/components/atoms/Card";
import EmptyState from "@/components/organisms/EmptyState";
import {
  Receipt,
  Inbox,
  Users,
  Search,
  CheckCircle2,
  FileText,
  Sparkles,
  Bell,
  AlertTriangle,
  Bookmark,
  Plus,
  FilterX,
  ShoppingCart,
} from "lucide-react";

export default function EmptyStatesSandbox() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">EmptyState</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          The `&quot;`nothing here yet`&quot;` component. Should always guide
          users to the next step.
        </p>
      </header>

      {/* ─── Sizes ─── */}
      <Section title="Sizes">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="md">
            <EmptyState
              size="sm"
              icon={<Inbox />}
              title="No items"
              description="Small empty state"
              action={{ label: "Add Item" }}
            />
          </Card>
          <Card padding="md">
            <EmptyState
              size="md"
              icon={<Inbox />}
              title="No items"
              description="Medium (default)"
              action={{ label: "Add Item" }}
            />
          </Card>
          <Card padding="md">
            <EmptyState
              size="lg"
              icon={<Inbox />}
              title="No items"
              description="Large empty state"
              action={{ label: "Add Item" }}
            />
          </Card>
        </div>
      </Section>

      {/* ─── Tones ─── */}
      <Section title="Tones">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card padding="md">
            <EmptyState
              icon={<Inbox />}
              title="Neutral"
              description="Default neutral background tint"
              tone="neutral"
            />
          </Card>
          <Card padding="md">
            <EmptyState
              icon={<CheckCircle2 />}
              title="All caught up!"
              description="Success — empty IS the goal"
              tone="success"
            />
          </Card>
          <Card padding="md">
            <EmptyState
              icon={<Sparkles />}
              title="Getting started"
              description="Info — guidance for new users"
              tone="info"
            />
          </Card>
          <Card padding="md">
            <EmptyState
              icon={<AlertTriangle />}
              title="No data found"
              description="Warning — something is wrong"
              tone="warning"
            />
          </Card>
        </div>
      </Section>

      {/* ─── With Actions ─── */}
      <Section title="With Primary + Secondary Actions">
        <Card padding="md">
          <EmptyState
            icon={<Receipt />}
            title="No bills generated yet"
            description="Generate the first batch of monthly bills to start tracking dues."
            action={{
              label: "Generate Bills",
              icon: <Plus className="w-4 h-4" />,
            }}
            secondaryAction={{
              label: "Learn More",
            }}
            tone="info"
          />
        </Card>
      </Section>

      {/* ─── Action as link ─── */}
      <Section title="Action as Link">
        <Card padding="md">
          <EmptyState
            icon={<Bookmark />}
            title="No saved items"
            description={
              <>
                You haven`&apos;`t saved anything yet.{" "}
                <a href="#" className="text-brand-primary hover:underline">
                  Browse villas
                </a>{" "}
                to get started.
              </>
            }
            action={{
              label: "Browse Villas",
              href: "/sandbox",
            }}
          />
        </Card>
      </Section>

      {/* ─── Full Page Empty State ─── */}
      <Section title="Full Page (centered vertically)">
        <Card padding="md" className="border-dashed border-2 min-h-100">
          <EmptyState
            fullPage
            size="lg"
            icon={<Sparkles />}
            title="Welcome to GDV Hub"
            description="This is your first time here. Let's set up your villa to start tracking maintenance."
            tone="info"
            action={{
              label: "Get Started",
            }}
            secondaryAction={{
              label: "Skip for now",
            }}
          />
        </Card>
      </Section>

      {/* ─── Real-world: No defaulters ─── */}
      <Section title="Real-World: No Defaulters (good empty)">
        <Card padding="md">
          <EmptyState
            icon={<CheckCircle2 />}
            title="No defaulters this month! 🎉"
            description="Every resident has paid their June 2026 maintenance. Great work."
            tone="success"
            action={{
              label: "View All Residents",
              variant: "secondary",
            }}
          />
        </Card>
      </Section>

      {/* ─── Real-world: Search no results ─── */}
      <Section title="Real-World: Search Returned Nothing">
        <Card padding="md">
          <EmptyState
            size="sm"
            icon={<Search />}
            title="No results for &ldquo;villa 99&rdquo;"
            description="Try a different villa number, name, or check spelling."
            action={{
              label: "Clear Search",
              variant: "ghost",
              icon: <FilterX className="w-4 h-4" />,
            }}
          />
        </Card>
      </Section>

      {/* ─── Real-world: Empty inbox ─── */}
      <Section title="Real-World: Empty Inbox">
        <Card padding="md">
          <EmptyState
            icon={<Bell />}
            title="You're all caught up"
            description="No new notifications. Anything new will show up here."
            tone="success"
            size="md"
          />
        </Card>
      </Section>

      {/* ─── Real-world: Empty ledger ─── */}
      <Section title="Real-World: Empty Ledger (new resident)">
        <Card padding="lg">
          <EmptyState
            size="md"
            icon={<FileText />}
            title="Your ledger is empty"
            description="No bills or payments yet. Your first maintenance bill will appear here on the 1st of next month."
            tone="info"
            action={{
              label: "View Sample Ledger",
              variant: "secondary",
            }}
          />
        </Card>
      </Section>

      {/* ─── Real-world: No residents claimed ─── */}
      <Section title="Real-World: Admin View — No Residents Claimed">
        <Card padding="lg">
          <EmptyState
            icon={<Users />}
            title="No residents have signed up yet"
            description="Share the signup link with residents so they can claim their villas and access the app."
            action={{
              label: "Copy Signup Link",
              icon: <Plus className="w-4 h-4" />,
            }}
            secondaryAction={{
              label: "Send via Email",
            }}
            tone="info"
          />
        </Card>
      </Section>

      {/* ─── Custom illustration ─── */}
      <Section title="Custom Illustration (replaces icon)">
        <Card padding="lg">
          <EmptyState
            illustration={
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-[image:var(--gradient-brand-soft)] flex items-center justify-center">
                  <ShoppingCart className="w-16 h-16 text-brand-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-h4 font-bold">
                  0
                </div>
              </div>
            }
            title="Your cart is empty"
            description="Add items to get started."
            action={{ label: "Continue Shopping" }}
            size="lg"
          />
        </Card>
      </Section>

      {/* ─── Inline in table ─── */}
      <Section title="Inline in Table (data table empty row)">
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
              <tr>
                <td colSpan={4} className="p-6">
                  <EmptyState
                    size="sm"
                    icon={<Search />}
                    title="No matching villas"
                    description="Try adjusting your filters."
                    action={{
                      label: "Reset Filters",
                      variant: "ghost",
                      icon: <FilterX className="w-4 h-4" />,
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
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
