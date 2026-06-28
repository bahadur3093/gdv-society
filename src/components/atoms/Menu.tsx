"use client";

import { type ReactNode, useState, useRef, useEffect, Fragment } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/utils";

export interface MenuOption {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** Show as destructive action (red) */
  danger?: boolean;
  /** Add divider above this item */
  divider?: boolean;
}

interface MenuProps {
  trigger: ReactNode;
  options: MenuOption[];
  /** Align dropdown to trigger */
  align?: "start" | "end";
  /** Open above or below trigger */
  position?: "top" | "bottom";
  /** Custom width (default 200px) */
  width?: number;
}

export default function Menu({
  trigger,
  options,
  align = "end",
  position = "bottom",
  width = 200,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const computePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 6;

    const top = position === "bottom" ? rect.bottom + gap : rect.top - gap;

    const left = align === "start" ? rect.left : rect.right;

    setCoords({ top, left });
  };

  const toggle = () => {
    if (!open) computePosition();
    setOpen(!open);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const handler = () => computePosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open]); // eslint-disable-line

  const transform =
    position === "top"
      ? align === "end"
        ? "translate(-100%, -100%)"
        : "translate(0, -100%)"
      : align === "end"
        ? "translate(-100%, 0)"
        : "translate(0, 0)";

  return (
    <>
      <div
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggle();
        }}
        className="inline-flex cursor-pointer"
      >
        {trigger}
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform,
              width,
              zIndex: 9999,
            }}
            className={cn(
              "rounded-xl overflow-hidden",
              "bg-bg-elevated border border-border-default",
              "shadow-2xl",
              "py-1",
            )}
          >
            {options.map((opt) => (
              <Fragment key={opt.key}>
                {opt.divider && <div className="my-1 h-px bg-border-subtle" />}
                <button
                  type="button"
                  role="menuitem"
                  disabled={opt.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (opt.disabled) return;
                    opt.onClick();
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-left",
                    "text-body-sm font-medium",
                    "transition-colors",
                    opt.danger
                      ? "text-danger hover:bg-danger/10"
                      : "text-text-primary hover:bg-bg-sunken",
                    opt.disabled &&
                      "opacity-50 cursor-not-allowed hover:bg-transparent",
                  )}
                >
                  {opt.icon && (
                    <span className="w-4 h-4 shrink-0 flex items-center justify-center text-text-muted">
                      {opt.icon}
                    </span>
                  )}
                  <span className="flex-1 truncate">{opt.label}</span>
                </button>
              </Fragment>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
