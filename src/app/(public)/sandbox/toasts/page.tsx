"use client";

import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import { toast } from "@/components/atoms/Toast";
import {
  AlertCircle,
  Sparkles,
  CreditCard,
  Trash2,
  RefreshCw,
} from "lucide-react";

export default function ToastsSandbox() {
  // Simulate async operation
  const simulateAsync = (ms = 1500, shouldFail = false) =>
    new Promise<{ data: string }>((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) reject(new Error("Network error"));
        else resolve({ data: "Done" });
      }, ms);
    });

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">Toast</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          Notifications powered by sonner. Theme-aware, accessible,
          drag-to-dismiss on mobile.
        </p>
      </header>

      {/* ─── Variants ─── */}
      <Section title="Variants">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={() =>
              toast("Default toast", {
                description: "No variant — neutral styling",
              })
            }
          >
            Default
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.success("Payment recorded", {
                description: "₹6,320 allocated to 2 bills",
              })
            }
          >
            Success
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.error("Payment failed", {
                description: "Bank declined the transaction",
              })
            }
          >
            Error
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.warning("Outstanding amount changed", {
                description: "Refresh to see latest",
              })
            }
          >
            Warning
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.info("New bills generated", {
                description: "44 bills created for July 2026",
              })
            }
          >
            Info
          </Button>
        </div>
      </Section>

      {/* ─── With Actions ─── */}
      <Section title="With Action Buttons">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              toast.success("Bill deleted", {
                description: "Villa 39 June 2026 bill removed",
                action: {
                  label: "Undo",
                  onClick: () => toast.info("Restored"),
                },
              })
            }
          >
            With &quot;Undo&quot; action
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              toast("Payment received", {
                description: "₹6,320 from Bahadur Singh",
                action: {
                  label: "View",
                  onClick: () => toast.info("Navigating to ledger..."),
                },
                cancel: {
                  label: "Dismiss",
                  onClick: () => {},
                },
              })
            }
          >
            With Action + Cancel
          </Button>
        </div>
      </Section>

      {/* ─── Promise (async operation) ─── */}
      <Section title="Promise (async operations)">
        <p className="text-body-sm text-text-secondary">
          Toast automatically updates from loading → success/error based on
          promise resolution.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              toast.promise(simulateAsync(2000), {
                loading: "Recording payment...",
                success: "Payment recorded successfully",
                error: "Failed to record payment",
              })
            }
          >
            Successful Promise
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              toast.promise(simulateAsync(2000, true), {
                loading: "Submitting...",
                success: "Done",
                error: (err) => `${err.message}`,
              })
            }
          >
            Failing Promise
          </Button>

          <Button
            variant="ghost"
            onClick={() =>
              toast.promise(simulateAsync(3000), {
                loading: "Generating 44 bills for July...",
                success: (data) => ({
                  message: "Bills generated",
                  description: "44 bills created successfully",
                }),
                error: "Generation failed",
              })
            }
          >
            With Description in Success
          </Button>
        </div>
      </Section>

      {/* ─── Loading + Manual Update ─── */}
      <Section title="Manual Loading + Update">
        <p className="text-body-sm text-text-secondary">
          For when you need fine-grained control over toast state.
        </p>
        <Button
          onClick={() => {
            const id = toast.loading("Processing payment...");
            setTimeout(() => {
              toast.success("Payment confirmed", {
                id, // ← Updates the existing toast
                description: "Allocated to 2 bills",
              });
            }, 2000);
          }}
        >
          Loading → Success (manual)
        </Button>
      </Section>

      {/* ─── Custom JSX ─── */}
      <Section title="Custom JSX (full layout control)">
        <Button
          onClick={() =>
            toast.custom((t) => (
              <Card
                padding="md"
                variant="default"
                className="w-[360px] !shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[image:var(--gradient-brand-soft)] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-body font-medium text-text-primary">
                      Premium feature unlocked
                    </p>
                    <p className="text-body-sm text-text-secondary mt-0.5">
                      You can now generate yearly reports
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => toast.dismiss(t)}
                      >
                        Try it
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.dismiss(t)}
                      >
                        Later
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          }
        >
          Show Custom Toast
        </Button>
      </Section>

      {/* ─── Duration ─── */}
      <Section title="Custom Duration">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              toast.info("Quick info (2 seconds)", { duration: 2000 })
            }
          >
            2 seconds
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.info("Stays for 10 seconds", { duration: 10000 })
            }
          >
            10 seconds
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.warning("Sticky toast (no auto-dismiss)", {
                duration: Infinity,
                description: "Close manually with X",
              })
            }
          >
            Persistent (Infinity)
          </Button>
        </div>
      </Section>

      {/* ─── Position from API ─── */}
      <Section title="Position Override">
        <p className="text-body-sm text-text-secondary">
          Override the default position for specific toasts.
        </p>
        <div className="flex flex-wrap gap-3">
          {(
            [
              "top-left",
              "top-right",
              "top-center",
              "bottom-left",
              "bottom-right",
              "bottom-center",
            ] as const
          ).map((pos) => (
            <Button
              key={pos}
              variant="ghost"
              size="sm"
              onClick={() => toast.info(`Position: ${pos}`, { position: pos })}
            >
              {pos}
            </Button>
          ))}
        </div>
      </Section>

      {/* ─── Real-world patterns ─── */}
      <Section title="Real-World Patterns">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card padding="md">
            <p className="text-h4 text-text-primary mb-2">Record Payment</p>
            <p className="text-body-sm text-text-secondary mb-4">
              Optimistic UI with toast feedback
            </p>
            <Button
              variant="gradient"
              fullWidth
              icon={<CreditCard className="w-4 h-4" />}
              onClick={() => {
                toast.promise(simulateAsync(2000), {
                  loading: "Submitting payment request...",
                  success: () => ({
                    message: "Payment request submitted",
                    description: "Admin will verify within 24 hours",
                  }),
                  error: "Submission failed. Please try again.",
                });
              }}
            >
              Submit Request
            </Button>
          </Card>

          <Card padding="md">
            <p className="text-h4 text-text-primary mb-2">Delete with Undo</p>
            <p className="text-body-sm text-text-secondary mb-4">
              Soft-delete pattern (Gmail-style)
            </p>
            <Button
              variant="danger"
              fullWidth
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                toast("Villa 39 archived", {
                  description: "You can restore within 30 days",
                  action: {
                    label: "Undo",
                    onClick: () => toast.success("Villa 39 restored"),
                  },
                  duration: 8000,
                });
              }}
            >
              Archive Villa
            </Button>
          </Card>

          <Card padding="md">
            <p className="text-h4 text-text-primary mb-2">Refresh Data</p>
            <p className="text-body-sm text-text-secondary mb-4">
              Loading → success with auto-dismiss
            </p>
            <Button
              variant="secondary"
              fullWidth
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => {
                const id = toast.loading("Refreshing master ledger...");
                setTimeout(() => {
                  toast.success("Ledger updated", {
                    id,
                    description: "47 villas refreshed",
                    duration: 2000,
                  });
                }, 1500);
              }}
            >
              Refresh
            </Button>
          </Card>

          <Card padding="md">
            <p className="text-h4 text-text-primary mb-2">Action Required</p>
            <p className="text-body-sm text-text-secondary mb-4">
              Persistent toast with CTA
            </p>
            <Button
              variant="secondary"
              fullWidth
              icon={<AlertCircle className="w-4 h-4" />}
              onClick={() => {
                toast.warning("Bills due in 3 days", {
                  description: "5 villas have unpaid bills",
                  duration: Infinity,
                  action: {
                    label: "View",
                    onClick: () => toast.info("Navigating..."),
                  },
                });
              }}
            >
              Trigger Warning
            </Button>
          </Card>
        </div>
      </Section>

      {/* ─── Stacking ─── */}
      <Section title="Stack Multiple Toasts">
        <Button
          onClick={() => {
            toast.success("Bill generated for Villa 1");
            setTimeout(() => toast.success("Bill generated for Villa 2"), 200);
            setTimeout(() => toast.success("Bill generated for Villa 3"), 400);
            setTimeout(() => toast.info("44 bills total"), 600);
          }}
        >
          Fire 4 Toasts
        </Button>
      </Section>

      {/* ─── Dismiss all ─── */}
      <Section title="Programmatic Dismiss">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              toast.info("Toast 1");
              toast.info("Toast 2");
              toast.info("Toast 3");
            }}
          >
            Show 3 toasts
          </Button>
          <Button variant="ghost" onClick={() => toast.dismiss()}>
            Dismiss all
          </Button>
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
