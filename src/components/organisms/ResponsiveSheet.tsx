"use client";

import { useEffect, useState, type ReactNode } from "react";
import BottomSheet from "./BottomSheet";
import Modal, { ModalSize } from "../molecules/Modal";

interface ResponsiveSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  trigger?: ReactNode;
  /** Modal size on desktop */
  size?: ModalSize;
  /** Breakpoint at which to switch (default: 768px = md) */
  breakpoint?: number;
}

/**
 * Renders BottomSheet on mobile, Modal on desktop.
 * Identical API for both — pass the same props.
 */
export default function ResponsiveSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  trigger,
  size = "md",
  breakpoint = 768,
}: ResponsiveSheetProps) {
  // SSR-safe: default to desktop, swap to mobile after hydration
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        footer={footer}
        trigger={trigger}
      >
        {children}
      </BottomSheet>
    );
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={footer}
      trigger={trigger}
      size={size}
    >
      {children}
    </Modal>
  );
}
