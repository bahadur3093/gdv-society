"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Trash2,
  Settings,
  Search,
  Plus,
  Bell,
  ChevronRight,
  CreditCard,
  Eye,
  MoreVertical,
  Download,
  Edit,
  Star,
  Bookmark,
} from "lucide-react";
import IconButton from "@/components/atoms/IconButton";
import Button from "@/components/atoms/Button";

export default function IconButtonsSandbox() {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">IconButton</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          Dedicated icon-only button with required accessible label.
        </p>
      </header>

      {/* ─── Variants ─── */}
      <Section title="Variants">
        <div className="flex flex-wrap items-center gap-3">
          <IconButton variant="ghost" label="Like" icon={<Heart />} />
          <IconButton variant="solid" label="Add new" icon={<Plus />} />
          <IconButton variant="outline" label="Settings" icon={<Settings />} />
          <IconButton variant="danger" label="Delete" icon={<Trash2 />} />
        </div>
      </Section>

      {/* ─── Sizes ─── */}
      <Section title="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <IconButton size="sm" label="Search small" icon={<Search />} />
          <IconButton size="md" label="Search medium" icon={<Search />} />
          <IconButton size="lg" label="Search large" icon={<Search />} />
        </div>
        <p className="text-body-sm text-text-muted">
          sm = 32px (tables), md = 40px (default), lg = 48px (touch targets)
        </p>
      </Section>

      {/* ─── With Tooltip ─── */}
      <Section title="With Tooltip (native title)">
        <div className="flex flex-wrap items-center gap-3">
          <IconButton showTooltip label="Notifications" icon={<Bell />} />
          <IconButton
            showTooltip
            label="Download report"
            icon={<Download />}
            variant="outline"
          />
          <IconButton
            showTooltip
            label="Edit details"
            icon={<Edit />}
            variant="solid"
          />
        </div>
        <p className="text-body-sm text-text-muted">
          Hover any button to see the tooltip (uses native browser title).
        </p>
      </Section>

      {/* ─── Loading ─── */}
      <Section title="Loading State">
        <div className="flex flex-wrap items-center gap-3">
          <IconButton
            variant="solid"
            label="Save"
            icon={<Download />}
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
          />
          <IconButton
            variant="ghost"
            label="Loading example"
            icon={<Settings />}
            loading
          />
        </div>
      </Section>

      {/* ─── Stateful (toggle) ─── */}
      <Section title="Toggle State Example">
        <div className="flex items-center gap-3">
          <IconButton
            variant={liked ? "danger" : "ghost"}
            label={liked ? "Unlike" : "Like"}
            icon={<Heart className={liked ? "fill-current" : ""} />}
            onClick={() => setLiked((l) => !l)}
            showTooltip
          />
          <span className="text-body text-text-secondary">
            {liked ? "Liked!" : "Not liked"}
          </span>
        </div>
      </Section>

      {/* ─── In Toolbar ─── */}
      <Section title="In a Toolbar">
        <div className="p-3 bg-bg-elevated border border-border-subtle rounded-lg flex items-center gap-1">
          <IconButton
            size="sm"
            label="Bold"
            icon={<strong className="text-body-sm">B</strong>}
          />
          <IconButton
            size="sm"
            label="Italic"
            icon={<em className="text-body-sm">I</em>}
          />
          <div className="w-px h-5 bg-border-default mx-1" />
          <IconButton size="sm" label="Star" icon={<Star />} />
          <IconButton size="sm" label="Bookmark" icon={<Bookmark />} />
          <IconButton size="sm" label="Like" icon={<Heart />} />
          <div className="w-px h-5 bg-border-default mx-1" />
          <IconButton
            size="sm"
            variant="danger"
            label="Delete"
            icon={<Trash2 />}
          />
          <div className="flex-1" />
          <IconButton size="sm" label="More" icon={<MoreVertical />} />
        </div>
      </Section>

      {/* ─── In a Table Row ─── */}
      <Section title="In a Table Row">
        <div className="bg-bg-elevated border border-border-subtle rounded-lg overflow-hidden">
          {[
            {
              villa: 39,
              name: "Bahadur Singh",
              amount: "₹6,320",
              status: "PARTIAL",
            },
            {
              villa: 12,
              name: "Priya Sharma",
              amount: "₹3,000",
              status: "PENDING",
            },
            { villa: 5, name: "Ramesh Kumar", amount: "₹0", status: "PAID" },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border-b border-border-subtle last:border-b-0 hover:bg-bg-sunken transition-colors"
            >
              <div className="font-mono text-body text-text-secondary w-12">
                {row.villa}
              </div>
              <div className="flex-1">
                <div className="text-body text-text-primary">{row.name}</div>
                <div className="text-body-sm text-text-muted">{row.status}</div>
              </div>
              <div className="font-mono text-body text-text-primary">
                {row.amount}
              </div>
              <div className="flex gap-1">
                <IconButton
                  size="sm"
                  label={`Record payment for ${row.name}`}
                  icon={<CreditCard />}
                  showTooltip
                />
                <IconButton
                  size="sm"
                  label={`View ledger for ${row.name}`}
                  icon={<Eye />}
                  showTooltip
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── asChild (with Link) ─── */}
      <Section title="As Child (Next.js Link)">
        <div className="flex flex-wrap gap-3 items-center">
          <IconButton
            asChild
            label="Back to sandbox"
            icon={<ChevronRight className="rotate-180" />}
          >
            <Link href={""}>Back</Link>
          </IconButton>
          <span className="text-body-sm text-text-muted">
            Renders as &lt;a&gt; with button styling — inspect DOM
          </span>
        </div>
      </Section>

      {/* ─── Real combo: Card with actions ─── */}
      <Section title="Real-World: Notification Card">
        <div className="max-w-md p-4 bg-bg-elevated border border-border-subtle rounded-lg flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body text-text-primary font-medium">
              New payment request
            </p>
            <p className="text-body-sm text-text-secondary mt-0.5">
              Bahadur Singh requested ₹6,320 via UPI
            </p>
            <p className="text-micro text-text-muted uppercase mt-1">
              2 minutes ago
            </p>
          </div>
          <IconButton
            size="sm"
            label="Mark as read"
            icon={<Eye />}
            showTooltip
          />
          <IconButton
            size="sm"
            label="Dismiss"
            icon={<Trash2 />}
            variant="danger"
            showTooltip
          />
        </div>
      </Section>

      {/* ─── Compare with Button shape="square" ─── */}
      <Section title="Comparison: Button vs IconButton">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              shape="square"
              aria-label="Add via Button"
              icon={<Plus className="w-4 h-4" />}
            />
            <span className="text-body-sm text-text-secondary">
              Button shape=&quot;square&quot; — when you need loading/async
              patterns
            </span>
          </div>
          <div className="flex items-center gap-3">
            <IconButton
              label="Add via IconButton"
              icon={<Plus />}
              variant="solid"
            />
            <span className="text-body-sm text-text-secondary">
              IconButton — cleaner API for pure icon actions
            </span>
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
