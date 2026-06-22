"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CreditCard,
  Settings,
  Info,
  Check,
  Trash2,
  Save,
  ExternalLink,
  Bell,
} from "lucide-react";
import Modal, {
  ModalBody,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalRoot,
  ModalTrigger,
} from "@/components/molecules/Modal";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import { toast } from "@/components/atoms/Toast";
import FormField from "@/components/atoms/FormField";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import ResponsiveSheet from "@/components/organisms/ResponsiveSheet";

export default function ModalsSandbox() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [responsiveOpen, setResponsiveOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-12">
      <header>
        <h1 className="text-h1 text-text-primary">Modal</h1>
        <p className="text-body-lg text-text-secondary mt-2">
          Desktop-focused dialogs powered by Radix. Plus a responsive helper
          that becomes a BottomSheet on mobile.
        </p>
      </header>

      {/* ─── Basic ─── */}
      <Section title="Basic Modal">
        <Modal
          trigger={<Button>Open Basic Modal</Button>}
          title="Hello, Modal!"
          description="This is a simple confirmation dialog."
        >
          <p className="text-body text-text-primary">
            Click anywhere outside, press ESC, or use the X button to close.
          </p>
        </Modal>
      </Section>

      {/* ─── Sizes ─── */}
      <Section title="Sizes">
        <div className="flex flex-wrap gap-2">
          <Modal
            trigger={
              <Button variant="secondary" size="sm">
                Small
              </Button>
            }
            title="Small modal"
            description="Best for confirmations"
            size="sm"
            footer={
              <>
                <ModalClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </ModalClose>
                <ModalClose asChild>
                  <Button>Confirm</Button>
                </ModalClose>
              </>
            }
          >
            <p className="text-body text-text-primary">
              Compact size, quick decisions.
            </p>
          </Modal>

          <Modal
            trigger={
              <Button variant="secondary" size="sm">
                Medium
              </Button>
            }
            title="Medium modal (default)"
            size="md"
          >
            <p className="text-body text-text-primary">Most common size.</p>
          </Modal>

          <Modal
            trigger={
              <Button variant="secondary" size="sm">
                Large
              </Button>
            }
            title="Large modal"
            description="For longer forms"
            size="lg"
          >
            <p className="text-body text-text-primary">
              More room for content, still focused.
            </p>
          </Modal>

          <Modal
            trigger={
              <Button variant="secondary" size="sm">
                XL
              </Button>
            }
            title="Extra-large modal"
            description="For detail views with rich content"
            size="xl"
          >
            <div className="grid grid-cols-2 gap-4">
              <Card padding="sm" variant="sunken">
                <p className="text-body-sm text-text-secondary">Stats here</p>
              </Card>
              <Card padding="sm" variant="sunken">
                <p className="text-body-sm text-text-secondary">More stats</p>
              </Card>
            </div>
          </Modal>

          <Modal
            trigger={
              <Button variant="secondary" size="sm">
                Full
              </Button>
            }
            title="Full size modal"
            description="Near-full screen"
            size="full"
          >
            <p className="text-body text-text-primary">
              For very rich detail views (95% viewport).
            </p>
          </Modal>
        </div>
      </Section>

      {/* ─── Confirmation Pattern ─── */}
      <Section title="Confirmation Dialog (controlled)">
        <Button
          variant="danger"
          icon={<Trash2 className="w-4 h-4" />}
          onClick={() => setConfirmOpen(true)}
        >
          Delete Villa
        </Button>

        <Modal
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete Villa 39?"
          description="This action cannot be undone. All associated bills and payments will also be deleted."
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => {
                  setConfirmOpen(false);
                  toast.success("Villa 39 deleted", {
                    action: {
                      label: "Undo",
                      onClick: () => toast.info("Restored"),
                    },
                  });
                }}
              >
                Delete Permanently
              </Button>
            </>
          }
        >
          <div className="flex gap-3 p-4 bg-danger-muted rounded-md border border-danger-border">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-body-sm font-medium text-danger">
                Permanent action
              </p>
              <p className="text-body-sm text-text-secondary">
                Resident records, bills, and payment history for Villa 39 will
                be permanently deleted.
              </p>
            </div>
          </div>
        </Modal>
      </Section>

      {/* ─── Form Modal ─── */}
      <Section title="Form Modal (settings)">
        <Button
          variant="secondary"
          icon={<Settings className="w-4 h-4" />}
          onClick={() => setSettingsOpen(true)}
        >
          Open Settings
        </Button>

        <Modal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          title="Society Settings"
          description="Update billing rates and configuration"
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button
                icon={<Save className="w-4 h-4" />}
                onClick={() => {
                  setSettingsOpen(false);
                  toast.success("Settings saved");
                }}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            <FormField label="Rate per sqft" required>
              <Input prefix="₹" suffix="/sqft" type="number" defaultValue="3" />
            </FormField>

            <FormField label="Sinking fund percentage" required>
              <Input suffix="%" type="number" defaultValue="20" />
            </FormField>

            <FormField label="Total villas">
              <Input type="number" defaultValue="47" disabled />
            </FormField>

            <FormField label="Due date (day of month)">
              <Input type="number" defaultValue="10" min="1" max="28" />
            </FormField>
          </div>
        </Modal>
      </Section>

      {/* ─── Composed (full control) ─── */}
      <Section title="Composed (full layout control)">
        <ModalRoot>
          <ModalTrigger asChild>
            <Button variant="secondary">Open Composed</Button>
          </ModalTrigger>
          <ModalContent size="md">
            {/* Custom header with badge */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 pr-12 border-b border-border-subtle">
              <div className="w-12 h-12 rounded-full bg-success-muted flex items-center justify-center">
                <Check className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1">
                <h2 className="text-h3 text-text-primary">Payment Confirmed</h2>
                <p className="text-body-sm text-text-secondary">
                  Bahadur Singh • Villa 39
                </p>
              </div>
              <Badge variant="success">Done</Badge>
            </div>

            <ModalBody>
              <div className="space-y-3">
                <DetailRow label="Amount" value="₹6,320" />
                <DetailRow label="Method" value="UPI" />
                <DetailRow label="Reference" value="UPI-XYZ-12345" />
                <DetailRow label="Date" value="Jun 21, 2026, 2:30 PM" />
                <DetailRow label="Allocated to" value="June + May bills" />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="ghost"
                icon={<ExternalLink className="w-4 h-4" />}
              >
                View Receipt
              </Button>
              <ModalClose asChild>
                <Button>Done</Button>
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </ModalRoot>
      </Section>

      {/* ─── No close button ─── */}
      <Section title="No Close Button (must use footer)">
        <Modal
          trigger={<Button variant="secondary">Open Mandatory Modal</Button>}
          title="Action Required"
          description="You must choose to proceed."
          hideClose
          size="sm"
          footer={
            <>
              <ModalClose asChild>
                <Button variant="ghost">Skip</Button>
              </ModalClose>
              <ModalClose asChild>
                <Button>Accept</Button>
              </ModalClose>
            </>
          }
        >
          <p className="text-body text-text-primary">
            No X button or backdrop dismiss. User must pick an action.
          </p>
        </Modal>
      </Section>

      {/* ─── Responsive Sheet (Modal + BottomSheet) ─── */}
      <Section title="ResponsiveSheet (the magic combo)">
        <Card padding="md" variant="sunken">
          <p className="text-body text-text-primary mb-2">
            Same component renders:
          </p>
          <ul className="text-body-sm text-text-secondary space-y-1 ml-4">
            <li>
              • <strong>BottomSheet</strong> on mobile (&lt; 768px)
            </li>
            <li>
              • <strong>Modal</strong> on desktop (≥ 768px)
            </li>
          </ul>
          <p className="text-body-sm text-text-muted mt-3">
            Resize your browser to see it swap automatically.
          </p>
        </Card>

        <Button
          variant="gradient"
          icon={<CreditCard className="w-4 h-4" />}
          onClick={() => setResponsiveOpen(true)}
        >
          Open Responsive Sheet
        </Button>

        <ResponsiveSheet
          open={responsiveOpen}
          onOpenChange={setResponsiveOpen}
          title="Record Payment"
          description="Submit your payment details for verification."
          size="md"
          footer={
            <Button
              variant="gradient"
              fullWidth
              onClick={() => {
                setResponsiveOpen(false);
                toast.success("Payment submitted", {
                  description: "Admin will verify shortly",
                });
              }}
            >
              Submit Payment
            </Button>
          }
        >
          <div className="space-y-5">
            <FormField label="Amount" required helperText="Outstanding: ₹6,320">
              <Input
                prefix="₹"
                type="number"
                defaultValue="6320"
                inputSize="lg"
              />
            </FormField>

            <FormField label="Payment method" required>
              <Input defaultValue="UPI" />
            </FormField>

            <FormField label="Reference" helperText="UPI ref or cheque number">
              <Input placeholder="UPI-XYZ-12345" />
            </FormField>
          </div>
        </ResponsiveSheet>
      </Section>

      {/* ─── Real-world: Confirmation with details ─── */}
      <Section title="Real-World: Generate Bills Confirmation">
        <Modal
          trigger={
            <Button icon={<Bell className="w-4 h-4" />}>
              Generate June Bills
            </Button>
          }
          title="Generate bills for June 2026?"
          description="This will create bills for all 44 billable villas."
          size="md"
          footer={
            <>
              <ModalClose asChild>
                <Button variant="ghost">Cancel</Button>
              </ModalClose>
              <Button
                onClick={() =>
                  toast.promise(new Promise((r) => setTimeout(r, 2000)), {
                    loading: "Generating 44 bills...",
                    success: "44 bills generated",
                    error: "Generation failed",
                  })
                }
              >
                Generate 44 Bills
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <DetailRow label="Period" value="June 2026" />
            <DetailRow label="Eligible villas" value="44 of 47" />
            <DetailRow label="Skipped" value="3 (not billable)" />
            <DetailRow label="Total amount" value="₹2,11,200" />
            <DetailRow label="Per-sqft rate" value="₹3" />
          </div>

          <div className="mt-4 flex gap-3 p-3 bg-info-muted rounded-md border border-info-border">
            <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
            <p className="text-body-sm text-info">
              Bills already generated for June 2026 will be skipped.
            </p>
          </div>
        </Modal>
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
