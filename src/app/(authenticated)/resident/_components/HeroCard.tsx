"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import { cn, formatCurrency } from "@/lib/utils/utils";

interface HeroCardProps {
  outstandingBalance: number;
  unpaidBillsCount: number;
  nextDueLabel: string | null;
  status: "PAID" | "PARTIAL" | "PENDING" | "CREDIT";
}

export default function HeroCard({
  outstandingBalance,
  unpaidBillsCount,
  nextDueLabel,
  status,
}: HeroCardProps) {
  // ─── Fully paid state — different visual treatment ───
  if (status === "PAID" || outstandingBalance === 0) {
    return (
      <Card
        variant="gradient"
        padding="lg"
        className="relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-micro uppercase tracking-wider text-text-muted font-medium">
              You&apos;re all caught up
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8 text-success" />
              </div>
              <p className="text-display-2 md:text-display-1 font-mono font-bold text-text-primary">
                ₹0
              </p>
            </div>
            <p className="text-body md:text-body-lg text-text-secondary mt-3">
              No outstanding bills — well done!
            </p>
          </div>

          <Button
            asChild
            variant="secondary"
            size="lg"
            shape="pill"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            <Link href={"/resident/ledger"}>View Ledger</Link>
          </Button>
        </div>
      </Card>
    );
  }

  // ─── Credit state ───
  if (status === "CREDIT") {
    return (
      <Card
        variant="gradient"
        padding="lg"
        className="relative overflow-hidden"
      >
        <div className="relative z-10">
          <p className="text-micro uppercase tracking-wider text-text-muted font-medium">
            Credit balance
          </p>
          <p className="text-display-1 md:text-[64px] leading-none font-mono font-bold text-success mt-3">
            {formatCurrency(Math.abs(outstandingBalance))}
          </p>
          <p className="text-body md:text-body-lg text-text-secondary mt-3">
            You have a credit. It&apos;ll be applied to your next bill.
          </p>
        </div>
      </Card>
    );
  }

  // ─── Default: PARTIAL or PENDING — the hero amount ───
  const subtitle = formatSubtitle(unpaidBillsCount, nextDueLabel);

  return (
    <Card variant="gradient" padding="lg" className="relative overflow-hidden">
      {/* Extra atmospheric glow for the hero (subtle pink in top-right) */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute -top-20 -right-20 w-72 h-72",
          "bg-brand-pink/20 rounded-full blur-3xl",
          "pointer-events-none",
        )}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
        {/* Left: label + big number + subtitle */}
        <div className="flex-1 min-w-0">
          <p className="text-micro uppercase tracking-wider text-text-muted font-medium">
            You owe
          </p>

          <p
            className={cn(
              "mt-2 md:mt-3",
              "font-mono font-bold tracking-tight",
              "text-display-1 md:text-[64px] md:leading-16",
              "text-gradient-brand",
            )}
          >
            {formatCurrency(outstandingBalance)}
          </p>

          {subtitle && (
            <p className="text-body md:text-body-lg text-text-secondary mt-3">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Pay CTA */}
        <div className="shrink-0">
          <Button
            asChild
            variant="gradient"
            size="xl"
            shape="pill"
            fullWidth
            className="md:w-auto md:min-w-40"
          >
            <Link href={"/resident/pay"}>Pay Now</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
//  Subtitle formatter
//  Examples:
//    "2 unpaid bills • next due Jun 10"
//    "1 unpaid bill"
//    null (no bills, but partial state — fallback)
// ─────────────────────────────────────────────────────────────

function formatSubtitle(count: number, nextDue: string | null): string | null {
  if (count === 0) return null;

  const billsLabel = `${count} unpaid bill${count === 1 ? "" : "s"}`;

  if (nextDue) {
    return `${billsLabel} • ${nextDue}`;
  }
  return billsLabel;
}
