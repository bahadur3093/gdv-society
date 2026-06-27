"use client";

import { toast } from "@/components/atoms/Toast";

export default function ToastSandbox() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8 bg-bg-base">
      <h1 className="text-h2 text-text-primary mb-6">Toast variants</h1>

      <button
        type="button"
        onClick={() =>
          toast.success("Payment approved", {
            description: "Your ₹6,320 has been recorded successfully.",
            dismissible: false,
            duration: 40000000
          })
        }
        className="px-6 h-11 rounded-full bg-success/15 text-success border border-success/30"
      >
        Show Success
      </button>

      <button
        type="button"
        onClick={() =>
          toast.warning("Approaching limit", {
            description: "You've used 80% of your monthly water allowance.",
          })
        }
        className="px-6 h-11 rounded-full bg-warning/15 text-warning border border-warning/30"
      >
        Show Warning
      </button>

      <button
        type="button"
        onClick={() =>
          toast.error("Couldn't save changes", {
            description: "Network error. Please try again.",
          })
        }
        className="px-6 h-11 rounded-full bg-danger/15 text-danger border border-danger/30"
      >
        Show Error
      </button>

      <button
        type="button"
        onClick={() => {
          const id = toast.loading("Sending reminder...", {
            description: "This will take a moment.",
          });
          setTimeout(() => {
            toast.success("Reminder sent", { id });
          }, 20000);
        }}
        className="px-6 h-11 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/30"
      >
        Show Loading → Success
      </button>

      <button
        type="button"
        onClick={() =>
          toast.info("Update available", {
            description: "A new version of the app is ready to install.",
          })
        }
        className="px-6 h-11 rounded-full bg-info/15 text-info border border-info/30"
      >
        Show Info
      </button>
    </div>
  );
}
