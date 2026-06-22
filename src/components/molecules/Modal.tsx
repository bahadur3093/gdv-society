"use client";

import {
  forwardRef,
  type ReactNode,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import IconButton from "../atoms/IconButton";

export const ModalRoot = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalClose = DialogPrimitive.Close;
export const ModalPortal = DialogPrimitive.Portal;

// ─────────────────────────────────────────────────────────────
//  Overlay
// ─────────────────────────────────────────────────────────────

export const ModalOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function ModalOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/60 backdrop-blur-sm",
        "data-[state=open]:animate-fade-in",
        className,
      )}
      {...props}
    />
  );
});

// ─────────────────────────────────────────────────────────────
//  Content — main modal container
// ─────────────────────────────────────────────────────────────

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm", // 384px - confirmations
  md: "max-w-md", // 448px - default forms
  lg: "max-w-2xl", // 672px - longer forms
  xl: "max-w-4xl", // 896px - detail views
  full: "max-w-[95vw] max-h-[95vh]",
};

interface ModalContentProps extends ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  size?: ModalSize;
  /** Hide built-in close button (rare — only if you have your own) */
  hideClose?: boolean;
}

export const ModalContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(function ModalContent(
  { size = "md", hideClose, className, children, ...props },
  ref,
) {
  return (
    <DialogPrimitive.Portal>
      <ModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          // Position
          "fixed left-[50%] top-[50%] z-50",
          "translate-x-[-50%] translate-y-[-50%]",
          // Size
          "w-[calc(100vw-2rem)]",
          sizeClasses[size],
          // Max height with internal scroll
          "max-h-[calc(100vh-2rem)]",
          "flex flex-col",
          // Surface
          "bg-bg-elevated",
          "border border-border-default",
          "rounded-lg shadow-xl",
          // Animation
          "data-[state=open]:animate-scale-in",
          // Focus
          "focus:outline-none",
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close asChild>
            <IconButton
              label="Close"
              icon={<X />}
              size="sm"
              variant="ghost"
              className="absolute top-3 right-3 z-10"
            />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

// ─────────────────────────────────────────────────────────────
//  Header
// ─────────────────────────────────────────────────────────────

interface ModalHeaderProps {
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function ModalHeader({
  title,
  description,
  className,
  children,
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        "px-6 pt-6 pb-4",
        // Leave room for close button
        "pr-12",
        className,
      )}
    >
      {title && (
        <DialogPrimitive.Title className="text-h3 text-text-primary">
          {title}
        </DialogPrimitive.Title>
      )}
      {description && (
        <DialogPrimitive.Description className="text-body-sm text-text-secondary">
          {description}
        </DialogPrimitive.Description>
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Body — scrollable content area
// ─────────────────────────────────────────────────────────────

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto custom-scrollbar",
        "px-6 py-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Footer
// ─────────────────────────────────────────────────────────────

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
  /** Add top divider */
  bordered?: boolean;
  /** Layout direction (default row, switch to col on mobile) */
  responsive?: boolean;
}

export function ModalFooter({
  children,
  className,
  bordered = true,
  responsive = true,
}: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex gap-2",
        responsive
          ? "flex-col-reverse sm:flex-row sm:justify-end"
          : "flex-row justify-end",
        "px-6 pt-4 pb-6",
        bordered && "border-t border-border-subtle",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Convenience: <Modal> all-in-one wrapper
// ─────────────────────────────────────────────────────────────

interface ModalProps {
  /** Controlled open state */
  open?: boolean;
  /** Fires when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Title in header */
  title?: ReactNode;
  /** Description below title */
  description?: ReactNode;
  /** Body content */
  children?: ReactNode;
  /** Footer content (action buttons) */
  footer?: ReactNode;
  /** Trigger element (when used uncontrolled) */
  trigger?: ReactNode;
  /** Size */
  size?: ModalSize;
  /** Hide close button */
  hideClose?: boolean;
  /** Custom className for content */
  className?: string;
}

export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  trigger,
  size = "md",
  hideClose,
  className,
}: ModalProps) {
  return (
    <ModalRoot open={open} onOpenChange={onOpenChange}>
      {trigger && <ModalTrigger asChild>{trigger}</ModalTrigger>}
      <ModalContent size={size} hideClose={hideClose} className={className}>
        {(title || description) && (
          <ModalHeader title={title} description={description} />
        )}
        {children && <ModalBody>{children}</ModalBody>}
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </ModalRoot>
  );
}
