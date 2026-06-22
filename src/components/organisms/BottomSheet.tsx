"use client";

import {
  forwardRef,
  type ReactNode,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import IconButton from "../atoms/IconButton";

// ─────────────────────────────────────────────────────────────
//  Root + Trigger (re-exports of vaul primitives)
//  Use these directly when you need vaul's full API
// ─────────────────────────────────────────────────────────────

export const BottomSheetRoot = Drawer.Root;
export const BottomSheetTrigger = Drawer.Trigger;
export const BottomSheetClose = Drawer.Close;
export const BottomSheetPortal = Drawer.Portal;

// ─────────────────────────────────────────────────────────────
//  Overlay
// ─────────────────────────────────────────────────────────────

export const BottomSheetOverlay = forwardRef<
  ElementRef<typeof Drawer.Overlay>,
  ComponentPropsWithoutRef<typeof Drawer.Overlay>
>(function BottomSheetOverlay({ className, ...props }, ref) {
  return (
    <Drawer.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/60 backdrop-blur-sm",
        // Vaul applies data-state="open|closed" → animate
        "data-[state=open]:animate-fade-in",
        className,
      )}
      {...props}
    />
  );
});

// ─────────────────────────────────────────────────────────────
//  Content — main sheet container
// ─────────────────────────────────────────────────────────────

interface BottomSheetContentProps extends ComponentPropsWithoutRef<
  typeof Drawer.Content
> {
  /** Hide the drag handle (default: visible) */
  hideHandle?: boolean;
}

export const BottomSheetContent = forwardRef<
  ElementRef<typeof Drawer.Content>,
  BottomSheetContentProps
>(function BottomSheetContent(
  { hideHandle, className, children, ...props },
  ref,
) {
  return (
    <Drawer.Portal>
      <BottomSheetOverlay />
      <Drawer.Content
        ref={ref}
        className={cn(
          // Position + size
          "fixed bottom-0 left-0 right-0 z-50",
          "flex flex-col",
          "max-h-[96vh]",
          // Surface
          "bg-bg-elevated",
          "border-t border-border-subtle",
          // Top rounded corners only
          "rounded-t-xl",
          // Safe area for iOS home indicator
          "pb-[env(safe-area-inset-bottom)]",
          // Focus visible
          "focus:outline-none",
          className,
        )}
        {...props}
      >
        {/* Drag handle (visual + drag target via vaul) */}
        {!hideHandle && (
          <div
            className="mx-auto mt-2.5 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-border-strong/60"
            aria-hidden="true"
          />
        )}
        {children}
      </Drawer.Content>
    </Drawer.Portal>
  );
});

// ─────────────────────────────────────────────────────────────
//  Header — title + optional close button
// ─────────────────────────────────────────────────────────────

interface BottomSheetHeaderProps {
  title?: ReactNode;
  description?: ReactNode;
  showClose?: boolean;
  className?: string;
}

export function BottomSheetHeader({
  title,
  description,
  showClose = true,
  className,
}: BottomSheetHeaderProps) {
  if (!title && !description && !showClose) return null;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        "px-6 pt-4 pb-3",
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <Drawer.Title className="text-h3 text-text-primary">
            {title}
          </Drawer.Title>
        )}
        {description && (
          <Drawer.Description className="text-body-sm text-text-secondary mt-1">
            {description}
          </Drawer.Description>
        )}
      </div>
      {showClose && (
        <Drawer.Close asChild>
          <IconButton label="Close" icon={<X />} size="sm" variant="ghost" />
        </Drawer.Close>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Body — scrollable content area
// ─────────────────────────────────────────────────────────────

interface BottomSheetBodyProps {
  children: ReactNode;
  className?: string;
}

export function BottomSheetBody({ children, className }: BottomSheetBodyProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto custom-scrollbar",
        "px-6 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Footer — sticky bottom area for actions
// ─────────────────────────────────────────────────────────────

interface BottomSheetFooterProps {
  children: ReactNode;
  className?: string;
  /** Add top divider */
  bordered?: boolean;
}

export function BottomSheetFooter({
  children,
  className,
  bordered = true,
}: BottomSheetFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        "px-6 pt-4 pb-2",
        bordered && "border-t border-border-subtle",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Convenience: <BottomSheet> all-in-one wrapper
//  For simple cases without needing to compose parts manually
// ─────────────────────────────────────────────────────────────

interface BottomSheetProps {
  /** Controlled open state */
  open?: boolean;
  /** Fires when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Title shown in header */
  title?: ReactNode;
  /** Description shown below title */
  description?: ReactNode;
  /** Hide the X close button in header */
  hideClose?: boolean;
  /** Hide the drag handle */
  hideHandle?: boolean;
  /** Body content */
  children?: ReactNode;
  /** Footer content (typically action buttons) */
  footer?: ReactNode;
  /** Trigger element (when used uncontrolled) */
  trigger?: ReactNode;
  /** Snap points (vaul format: array of numbers 0-1 or string heights) */
  snapPoints?: (string | number)[];
  /** Currently active snap point */
  activeSnapPoint?: string | number | null;
  /** Fires when snap point changes */
  setActiveSnapPoint?: (snapPoint: string | number | null) => void;
  /** Dismissible by drag/backdrop click */
  dismissible?: boolean;
}

export default function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  hideClose,
  hideHandle,
  children,
  footer,
  trigger,
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  dismissible = true,
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
      dismissible={dismissible}
    >
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <BottomSheetContent hideHandle={hideHandle}>
        <BottomSheetHeader
          title={title}
          description={description}
          showClose={!hideClose}
        />
        <BottomSheetBody>{children}</BottomSheetBody>
        {footer && <BottomSheetFooter>{footer}</BottomSheetFooter>}
      </BottomSheetContent>
    </Drawer.Root>
  );
}
