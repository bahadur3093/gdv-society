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
      // Position: top-center on mobile, bottom-right on desktop
      position="top-center"
      // Match our theme
      theme={resolved as "light" | "dark"}
      // Visual config
      closeButton
      richColors={false}
      expand={false}
      visibleToasts={4}
      gap={8}
      offset="16px"
      // Custom icons (override sonner defaults to match GDV)
      icons={{
        success: <CheckCircle2 className="w-4 h-4" />,
        error: <AlertCircle className="w-4 h-4" />,
        warning: <AlertTriangle className="w-4 h-4" />,
        info: <Info className="w-4 h-4" />,
        loading: <Loader2 className="w-4 h-4 animate-spin" />,
        close: <X className="w-3.5 h-3.5" />,
      }}
      // Toast options — applies to ALL toasts
      toastOptions={{
        // Class overrides → our token system
        unstyled: false,
        classNames: {
          toast: [
            "group",
            "flex items-start gap-3",
            "px-4 py-3 rounded-md",
            "bg-bg-elevated border border-border-default",
            "shadow-lg",
            "text-text-primary",
            // Sonner-specific: when toast has data-styled="true"
            "group-[.toaster]:!font-sans",
          ].join(" "),
          title: "text-body font-medium",
          description: "text-body-sm text-text-secondary",
          actionButton: [
            "inline-flex items-center justify-center",
            "h-8 px-3 rounded",
            "bg-brand-primary text-brand-primary-fg",
            "text-body-sm font-medium",
            "hover:bg-brand-primary-hover",
            "transition-colors duration-[var(--duration-fast)]",
            "shrink-0",
          ].join(" "),
          cancelButton: [
            "inline-flex items-center justify-center",
            "h-8 px-3 rounded",
            "bg-bg-sunken text-text-primary border border-border-default",
            "text-body-sm font-medium",
            "hover:bg-bg-elevated",
            "transition-colors duration-[var(--duration-fast)]",
            "shrink-0",
          ].join(" "),
          closeButton: [
            "absolute top-2 right-2",
            "w-6 h-6 rounded",
            "bg-bg-elevated hover:bg-bg-sunken",
            "border border-border-subtle",
            "text-text-secondary hover:text-text-primary",
            "transition-colors duration-[var(--duration-fast)]",
            "flex items-center justify-center",
          ].join(" "),
          // Variant-specific tints
          success: "!bg-success !border-success !text-white [&_*]:!text-white",
          error: "!bg-danger !border-danger !text-white [&_*]:!text-white",
          warning: "!bg-warning !border-warning !text-white [&_*]:!text-white",
          info: "!bg-info !border-info !text-white [&_*]:!text-white",
          loading: "!bg-bg-elevated !border-border-default",
        },
      }}
    />
  );
}

export const toast = sonnerToast;

export type { ExternalToast } from "sonner";
