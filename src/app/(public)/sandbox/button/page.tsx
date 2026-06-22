"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Heart, Plus, Trash2 } from "lucide-react";
import Button from "@/components/atoms/Button";

export default function ButtonsSandbox() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );

  const triggerLoad = (key: string) => {
    setLoadingStates((s) => ({ ...s, [key]: true }));
    setTimeout(() => setLoadingStates((s) => ({ ...s, [key]: false })), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">Button</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          5 variants × 4 sizes × 3 shapes, plus loading and icon support.
        </p>
      </header>

      {/* ─── Variants ─── */}
      <Section title="Variants">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="gradient">Gradient CTA</Button>
        </div>
      </Section>

      {/* ─── Sizes ─── */}
      <Section title="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium (default)</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </Section>

      {/* ─── Shapes ─── */}
      <Section title="Shapes">
        <div className="flex flex-wrap items-center gap-3">
          <Button shape="default">Default radius</Button>
          <Button shape="pill" variant="gradient">
            Pill (CTA)
          </Button>
          <Button
            shape="square"
            aria-label="Add"
            icon={<Plus className="w-4 h-4" />}
          />
          <Button
            shape="square"
            size="lg"
            aria-label="Delete"
            variant="danger"
            icon={<Trash2 className="w-5 h-5" />}
          />
        </div>
      </Section>

      {/* ─── With Icons ─── */}
      <Section title="With Icons">
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<Download className="w-4 h-4" />}>Download</Button>
          <Button
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            variant="secondary"
          >
            Next step
          </Button>
          <Button icon={<Heart className="w-4 h-4" />} variant="ghost">
            Like
          </Button>
        </div>
      </Section>

      {/* ─── Loading ─── */}
      <Section title="Loading States">
        <div className="flex flex-wrap items-center gap-3">
          <Button loading={loadingStates.a} onClick={() => triggerLoad("a")}>
            {loadingStates.a ? "Saving" : "Click to load"}
          </Button>
          <Button
            variant="gradient"
            loading={loadingStates.b}
            loadingText="Processing..."
            onClick={() => triggerLoad("b")}
          >
            Submit Payment
          </Button>
          <Button variant="secondary" loading>
            Always loading
          </Button>
        </div>
      </Section>

      {/* ─── Full Width ─── */}
      <Section title="Full Width">
        <div className="space-y-3 max-w-sm">
          <Button fullWidth size="lg">
            Full width button
          </Button>
          <Button fullWidth variant="gradient" size="lg" shape="pill">
            Hero CTA — Pay Now
          </Button>
          <Button fullWidth variant="secondary">
            Cancel
          </Button>
        </div>
      </Section>

      {/* ─── Disabled ─── */}
      <Section title="Disabled">
        <div className="flex flex-wrap gap-3">
          <Button disabled>Primary disabled</Button>
          <Button variant="secondary" disabled>
            Secondary disabled
          </Button>
          <Button variant="gradient" disabled>
            Gradient disabled
          </Button>
        </div>
      </Section>

      {/* ─── asChild (renders as Link) ─── */}
      <Section title="As Child (renders as Next.js Link)">
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link href={"/sandbox/inputs"}>← Back to sandbox</Link>
          </Button>
          <Button asChild variant="gradient" shape="pill" size="lg">
            <Link href={"/sandbox/inputs"}>Try Inputs Next →</Link>
          </Button>
        </div>
        <p className="text-body-sm text-text-muted mt-3">
          Useful: button styling + real navigation behavior of{" "}
          <code>&lt;Link&gt;</code>
        </p>
      </Section>

      {/* ─── Real-world combinations ─── */}
      <Section title="Real-World Examples">
        <div className="space-y-6 max-w-md">
          {/* Hero CTA */}
          <div className="p-6 bg-bg-elevated border border-border-subtle rounded-lg space-y-4">
            <div>
              <p className="text-micro uppercase text-text-muted">YOU OWE</p>
              <p className="text-display-2 font-mono text-gradient-brand">
                ₹6,320
              </p>
            </div>
            <Button fullWidth size="xl" shape="pill" variant="gradient">
              Pay Now
            </Button>
          </div>

          {/* Form actions */}
          <div className="p-6 bg-bg-elevated border border-border-subtle rounded-lg space-y-3">
            <p className="text-h4 text-text-primary">Confirm Payment</p>
            <p className="text-body text-text-secondary">
              ₹3,600 will be allocated to June bill.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="gradient" fullWidth>
                Confirm
              </Button>
              <Button variant="ghost" fullWidth>
                Cancel
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="p-4 bg-bg-elevated border border-border-subtle rounded-lg flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              shape="square"
              aria-label="Like"
              icon={<Heart className="w-3.5 h-3.5" />}
            />
            <Button
              size="sm"
              variant="ghost"
              shape="square"
              aria-label="Delete"
              icon={<Trash2 className="w-3.5 h-3.5" />}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

// ─── Section helper ───
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
