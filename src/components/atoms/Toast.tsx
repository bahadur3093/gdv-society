"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function Toaster() {
  const { resolved } = useTheme();

  return (
    <SonnerToaster
      position="top-right"
      theme={resolved as "light" | "dark"}
      closeButton
      richColors={false}
      expand={false}
      visibleToasts={4}
      gap={12}
      offset="16px"
      icons={{
        success: <CheckCircle2 className="w-5 h-5" />,
        error: <X className="w-5 h-5" />,
        warning: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
        loading: <Loader2 className="w-5 h-5 animate-spin" />,
        close: <X className="w-4 h-4" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          // Base toast — all variants
          toast: [
            "group relative",
            "flex items-start gap-4",
            "min-h-[80px] w-full",
            "pl-5 pr-12 py-4 rounded-2xl",
            "!bg-bg-elevated backdrop-blur-xl",
            "!border !border-white/8",
            "shadow-[0_8px_30px_rgba(0,0,0,0.5)]",
            "text-text-primary",
            "overflow-hidden",
          ].join(" "),

          // Icon container — bigger filled circle
          icon: [
            "relative shrink-0 w-10 h-10 rounded-full",
            "flex items-center justify-center",
            "bg-text-muted text-text-primary",
            "[&_svg]:!w-6 [&_svg]:!h-6",
            "[&_svg]:!stroke-[2.5]",
          ].join(" "),

          // Content — larger text
          title: "text-h3 font-bold text-text-primary leading-tight",
          description: "text-body text-text-secondary mt-1 leading-snug",

          actionButton: [
            "inline-flex items-center justify-center",
            "h-9 px-3 rounded-md",
            "bg-brand-primary text-white",
            "text-body-sm font-medium",
            "hover:opacity-90 transition-opacity",
            "shrink-0",
          ].join(" "),

          cancelButton: [
            "inline-flex items-center justify-center",
            "h-9 px-3 rounded-md",
            "bg-bg-sunken text-text-primary border border-border-default",
            "text-body-sm font-medium",
            "hover:bg-bg-elevated transition-colors",
            "shrink-0",
          ].join(" "),

          closeButton: [
            "!absolute !top-3 !right-3",
            "!w-7 !h-7 !rounded-md",
            "!bg-bg-sunken/60 hover:!bg-bg-sunken",
            "!border !border-white/5",
            "!text-text-muted hover:!text-text-primary",
            "!transition-colors",
            "!left-auto",
            "flex items-center justify-center",
          ].join(" "),

          // ── Variants ──
          // Each: filled icon circle + soft radial glow from left edge

          success: [
            "[&_[data-icon]]:!bg-success",
            "[&_[data-icon]]:!text-bg-base",
            "bg-[radial-gradient(circle_at_5%_50%,rgba(52,211,153,0.18)_0%,transparent_45%)]",
          ].join(" "),

          error: [
            "[&_[data-icon]]:!bg-danger",
            "[&_[data-icon]]:!text-bg-base",
            "bg-[radial-gradient(circle_at_5%_50%,rgba(248,113,113,0.18)_0%,transparent_45%)]",
          ].join(" "),

          warning: [
            "[&_[data-icon]]:!bg-warning",
            "[&_[data-icon]]:!text-bg-base",
            "bg-[radial-gradient(circle_at_5%_50%,rgba(251,191,36,0.18)_0%,transparent_45%)]",
          ].join(" "),

          info: [
            "[&_[data-icon]]:!bg-info",
            "[&_[data-icon]]:!text-bg-base",
            "bg-[radial-gradient(circle_at_5%_50%,rgba(56,189,248,0.18)_0%,transparent_45%)]",
          ].join(" "),

          loading: [
            "[&_[data-icon]]:!bg-brand-primary",
            "[&_[data-icon]]:!text-white",
            "bg-[radial-gradient(circle_at_5%_50%,rgba(139,92,246,0.18)_0%,transparent_45%)]",
          ].join(" "),
        },
      }}
    />
  );
}

export const toast = sonnerToast;

export type { ExternalToast } from "sonner";
