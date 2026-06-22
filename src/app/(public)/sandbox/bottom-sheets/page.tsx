"use client";

import { useState } from "react";
import {
  CreditCard,
  Filter,
  Settings,
  ChevronRight,
  Wallet,
  Check,
  Calendar,
  Bell,
  Upload,
  Trash2,
  Info,
} from "lucide-react";
import Card from "@/components/atoms/Card";
import BottomSheet, {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetRoot,
  BottomSheetTrigger,
} from "@/components/organisms/BottomSheet";
import Button from "@/components/atoms/Button";
import FormField from "@/components/atoms/FormField";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";

export default function BottomSheetsSandbox() {
  // For controlled examples
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Snap points example
  const snapPoints = [0.5, 1];
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  // Form state for payment example
  const [amount, setAmount] = useState("6320");
  const [method, setMethod] = useState("UPI");

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">BottomSheet</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          Mobile-native drawer with drag-to-dismiss, snap points, and full
          accessibility via vaul.
        </p>
      </header>

      <Card padding="md" variant="sunken">
        <p className="text-body text-text-secondary">
          💡 Best viewed on mobile or with browser DevTools mobile mode. Try
          dragging sheets down to dismiss them.
        </p>
      </Card>

      {/* ─── Basic ─── */}
      <Section title="Basic Sheet">
        <BottomSheet
          trigger={<Button>Open Basic Sheet</Button>}
          title="Hello, sheet!"
          description="This is a minimal bottom sheet."
        >
          <p className="text-body text-text-primary">
            Drag down on the handle to dismiss, click the X, click the backdrop,
            or press Escape.
          </p>
          <p className="text-body text-text-secondary mt-3">
            On mobile, the gesture feels native — momentum, spring physics,
            haptic-style snap.
          </p>
        </BottomSheet>
      </Section>

      {/* ─── With footer actions ─── */}
      <Section title="With Footer Actions">
        <BottomSheet
          trigger={<Button variant="secondary">Open with Footer</Button>}
          title="Confirm action"
          description="Are you sure you want to proceed?"
          footer={
            <>
              <Button variant="gradient" fullWidth size="lg" shape="pill">
                Confirm
              </Button>
              <Button variant="ghost" fullWidth size="lg">
                Cancel
              </Button>
            </>
          }
        >
          <p className="text-body text-text-primary">
            Once confirmed, this action cannot be undone.
          </p>
        </BottomSheet>
      </Section>

      {/* ─── Controlled (state lives in parent) ─── */}
      <Section title="Controlled (programmatic open)">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setPaymentOpen(true)}
            icon={<CreditCard className="w-4 h-4" />}
          >
            Pay Now
          </Button>
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(true)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete Item
          </Button>
        </div>

        {/* Payment sheet */}
        <BottomSheet
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          title="Record Payment"
          description="Submit your payment details for admin review."
          footer={
            <Button
              variant="gradient"
              fullWidth
              size="lg"
              shape="pill"
              onClick={() => {
                alert(`Submitting ₹${amount} via ${method}`);
                setPaymentOpen(false);
              }}
            >
              Submit Payment Request
            </Button>
          }
        >
          <div className="space-y-5">
            <FormField label="Amount" required helperText="Outstanding: ₹6,320">
              <Input
                prefix="₹"
                type="number"
                inputSize="lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </FormField>

            <FormField label="Payment Method" required>
              <div className="flex flex-wrap gap-2">
                {["UPI", "Cash", "Bank Transfer", "Cheque"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`px-4 py-2 rounded-full text-body-sm border transition-colors ${
                      method === m
                        ? "bg-brand-primary text-brand-primary-fg border-brand-primary"
                        : "bg-bg-sunken text-text-secondary border-border-default hover:border-border-strong"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Reference Number" helperText="Optional">
              <Input placeholder="UPI-XYZ-12345" />
            </FormField>

            <FormField label="Receipt (optional)">
              <button
                type="button"
                className="w-full border-2 border-dashed border-border-default rounded-md p-6 text-center hover:bg-bg-sunken transition-colors"
              >
                <Upload className="w-6 h-6 mx-auto text-text-muted mb-2" />
                <p className="text-body-sm text-text-secondary">
                  Tap to upload screenshot
                </p>
              </button>
            </FormField>
          </div>
        </BottomSheet>

        {/* Confirm delete sheet */}
        <BottomSheet
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete this item?"
          description="This action cannot be undone."
          footer={
            <>
              <Button
                variant="danger"
                fullWidth
                size="lg"
                onClick={() => {
                  alert("Deleted");
                  setConfirmOpen(false);
                }}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                fullWidth
                size="lg"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
            </>
          }
        >
          <div className="flex gap-3 p-4 bg-danger-muted rounded-md border border-danger-border">
            <Info className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <p className="text-body-sm text-danger">
              Once deleted, you won&apos;t be able to recover this item.
            </p>
          </div>
        </BottomSheet>
      </Section>

      {/* ─── Snap Points ─── */}
      <Section title="Snap Points (peek / half / full)">
        <Button
          onClick={() => {
            setSnap(snapPoints[0]);
            setFilterOpen(true);
          }}
          icon={<Filter className="w-4 h-4" />}
        >
          Open with Snap Points
        </Button>

        <BottomSheet
          open={filterOpen}
          onOpenChange={setFilterOpen}
          title="Filters"
          description="Drag up to expand, down to collapse"
          snapPoints={snapPoints}
          activeSnapPoint={snap}
          setActiveSnapPoint={setSnap}
        >
          <div className="space-y-4">
            <p className="text-body-sm text-text-muted">
              Current snap: {String(snap)}
            </p>

            <FormField label="Status">
              <div className="flex flex-wrap gap-2">
                {["All", "Pending", "Partial", "Paid"].map((s) => (
                  <Badge
                    key={s}
                    variant={s === "All" ? "brand" : "neutral"}
                    size="md"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </FormField>

            <FormField label="Date Range">
              <Input type="date" />
            </FormField>

            <FormField label="Amount Range">
              <div className="flex gap-2">
                <Input prefix="₹" type="number" placeholder="Min" />
                <Input prefix="₹" type="number" placeholder="Max" />
              </div>
            </FormField>

            {/* Filler content to show scrolling at full height */}
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} padding="sm" variant="sunken">
                <p className="text-body-sm text-text-secondary">
                  Filter option {i + 1}
                </p>
              </Card>
            ))}
          </div>
        </BottomSheet>
      </Section>

      {/* ─── Hide handle / close ─── */}
      <Section title="Custom: No Handle, No Close">
        <BottomSheet
          trigger={<Button variant="ghost">Open Minimal</Button>}
          title="Custom layout"
          hideHandle
          hideClose
          footer={<Button fullWidth>Done</Button>}
        >
          <p className="text-body text-text-primary">
            No drag handle, no X button. Only dismissable via the footer button
            or dragging from anywhere on the sheet.
          </p>
        </BottomSheet>
      </Section>

      {/* ─── Composed (manual layout) ─── */}
      <Section title="Composed (full control)">
        <BottomSheetRoot>
          <BottomSheetTrigger asChild>
            <Button variant="secondary">Open Custom Layout</Button>
          </BottomSheetTrigger>
          <BottomSheetContent>
            {/* Custom header with avatar */}
            <div className="flex items-center gap-3 px-6 pt-4 pb-4 border-b border-border-subtle">
              <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-brand-primary" />
              </div>
              <div className="flex-1">
                <p className="text-h4 text-text-primary">Payment Confirmed</p>
                <p className="text-body-sm text-text-secondary">
                  ₹6,320 paid via UPI
                </p>
              </div>
              <Badge variant="success" icon={<Check />}>
                Done
              </Badge>
            </div>

            <BottomSheetBody>
              <div className="space-y-3">
                <DetailRow label="Amount" value="₹6,320" />
                <DetailRow label="Method" value="UPI" />
                <DetailRow label="Reference" value="UPI-XYZ-12345" />
                <DetailRow label="Date" value="Jun 21, 2026" />
                <DetailRow label="Allocated to" value="2 bills" />
              </div>
            </BottomSheetBody>

            <BottomSheetFooter>
              <Button variant="gradient" fullWidth size="lg" shape="pill">
                View Receipt
              </Button>
              <Button variant="ghost" fullWidth size="lg">
                Share
              </Button>
            </BottomSheetFooter>
          </BottomSheetContent>
        </BottomSheetRoot>
      </Section>

      {/* ─── Action menu sheet ─── */}
      <Section title="Action Menu (like iOS share sheet)">
        <BottomSheet
          trigger={<Button variant="secondary">Open Action Menu</Button>}
          title="Actions"
          description="Choose what to do"
        >
          <div className="space-y-1">
            {[
              {
                icon: CreditCard,
                label: "Record Payment",
                desc: "For this villa",
              },
              { icon: Bell, label: "Send Reminder", desc: "SMS + email" },
              { icon: Calendar, label: "Reschedule Due Date" },
              { icon: Settings, label: "Edit Villa Details" },
              { icon: Trash2, label: "Mark as Inactive", danger: true },
            ].map(({ icon: Icon, label, desc, danger }) => (
              <button
                key={label}
                type="button"
                className={`w-full flex items-center gap-3 p-3 rounded-md text-left hover:bg-bg-sunken transition-colors ${
                  danger ? "text-danger" : "text-text-primary"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-md flex items-center justify-center ${
                    danger
                      ? "bg-danger-muted text-danger"
                      : "bg-bg-sunken text-text-secondary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-body font-medium">{label}</p>
                  {desc && (
                    <p className="text-body-sm text-text-muted">{desc}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
            ))}
          </div>
        </BottomSheet>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
      <span className="text-body-sm text-text-secondary">{label}</span>
      <span className="text-body font-mono text-text-primary">{value}</span>
    </div>
  );
}
