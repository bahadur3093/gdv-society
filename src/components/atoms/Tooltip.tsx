"use client";

import { type ReactNode, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/utils";

interface TooltipProps {
  label: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export default function Tooltip({
  label,
  children,
  position = "top",
  delay = 200,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const computePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        break;
    }
    setCoords({ top, left });
  };

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      computePosition();
      setVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const transformStyle =
    position === "top"
      ? "translate(-50%, -100%)"
      : position === "bottom"
        ? "translate(-50%, 0)"
        : position === "left"
          ? "translate(-100%, -50%)"
          : "translate(0, -50%)";

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
      >
        {children}
      </span>

      {mounted &&
        visible &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: transformStyle,
              zIndex: 9999,
            }}
            className={cn(
              "pointer-events-none",
              "whitespace-nowrap px-2 py-1 rounded-md",
              "bg-bg-elevated border border-border-default",
              "text-xs text-text-primary font-medium",
              "shadow-lg",
            )}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
}
