"use client";

import {
  useState,
  useRef,
  useEffect,
  useTransition,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Settings,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { signOutAction } from "@/lib/auth/actions";
import { toast } from "../atoms/Toast";
import { cn } from "@/lib/utils/utils";
import Avatar from "../atoms/Avatar";
import Badge from "../atoms/Badge";

interface UserMenuProps {
  /** User's display name */
  name: string;
  /** User's email */
  email: string;
  /** User's role (e.g., RESIDENT, ADMIN) — shown as badge */
  role?: "RESIDENT" | "ADMIN";
  /** Profile page link (e.g., /admin/profile or /resident/profile) */
  profileHref: string;
  /** Hide caret icon next to avatar */
  hideCaret?: boolean;
  /** Avatar size override */
  avatarSize?: "sm" | "md";
  /** Additional className for trigger */
  className?: string;
}

export default function UserMenu({
  name,
  email,
  role,
  profileHref,
  hideCaret = false,
  avatarSize = "md",
  className,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [isSigningOut, startSignOutTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { preference, setPreference, resolved } = useTheme();

  // ─── Close on outside click ───
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ─── Close on Escape ───
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // ─── Sign out handler ───
  const handleSignOut = () => {
    startSignOutTransition(async () => {
      try {
        await signOutAction();
        // Note: redirect happens server-side
      } catch (e) {
        toast.error("Failed to sign out", {
          description: e instanceof Error ? e.message : "Please try again",
        });
      }
    });
  };

  // ─── Theme toggle items ───
  const themeItems = [
    { value: "light", label: "Light", icon: <Sun className="w-full h-full" /> },
    { value: "dark", label: "Dark", icon: <Moon className="w-full h-full" /> },
    { value: "system", label: "System", icon: <Monitor className="w-full h-full" /> },
  ] as const;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
        className={cn(
          "inline-flex items-center gap-2",
          "rounded-full",
          "transition-all duration-(--duration-fast)",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          "focus-visible:ring-offset-bg-base",
          open && "ring-2 ring-brand-primary/30",
        )}
      >
        <Avatar
          size={avatarSize}
          name={name}
          ring={open ? "brand" : "subtle"}
        />
        {!hideCaret && (
          <ChevronDown
            className={cn(
              "w-4 h-4 text-text-muted shrink-0",
              "transition-transform duration-(--duration-fast)",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            // Position
            "absolute right-0 mt-2 z-50",
            "min-w-70",
            // Surface
            "bg-bg-elevated border border-border-default",
            "rounded-md shadow-xl",
            // Animation
            "animate-slide-down",
            // Padding for inner sections
            "overflow-hidden",
          )}
        >
          {/* Header — user info */}
          <div className="px-4 py-3 border-b border-border-subtle bg-bg-sunken/40">
            <div className="flex items-center gap-3">
              <Avatar size="md" name={name} />
              <div className="flex-1 min-w-0">
                <p className="text-body font-medium text-text-primary truncate">
                  {name}
                </p>
                <p className="text-body-sm text-text-muted truncate">{email}</p>
                {role && (
                  <div className="mt-1">
                    <Badge
                      size="sm"
                      variant={role === "ADMIN" ? "brand" : "info"}
                      outline
                    >
                      {role === "ADMIN" ? "Administrator" : "Resident"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile link */}
          <div className="py-1.5">
            <MenuLink
              href={profileHref}
              icon={<Settings className="w-full h-full" />}
              label="Profile & Settings"
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Theme section */}
          <div className="py-1.5 border-t border-border-subtle">
            <div className="px-4 pt-2 pb-1">
              <p className="text-micro uppercase tracking-wider text-text-muted">
                Appearance
              </p>
            </div>
            {themeItems.map((item) => {
              const isActive = preference === item.value;
              return (
                <MenuButton
                  key={item.value}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => {
                    setPreference(item.value);
                  }}
                  active={isActive}
                  trailing={
                    isActive ? (
                      <Check className="w-4 h-4 text-brand-primary" />
                    ) : item.value === preference ? null : null
                  }
                  hint={
                    item.value === "system" && preference === "system"
                      ? `(${resolved})`
                      : undefined
                  }
                />
              );
            })}
          </div>

          {/* Sign out */}
          <div className="py-1.5 border-t border-border-subtle">
            <MenuButton
              icon={
                isSigningOut ? <Loader2 className="animate-spin" /> : <LogOut className="w-full h-full" />
              }
              label={isSigningOut ? "Signing out…" : "Sign out"}
              onClick={handleSignOut}
              danger
              disabled={isSigningOut}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Menu Link (for navigation)
// ─────────────────────────────────────────────────────────────

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3",
        "px-4 py-2",
        "text-body text-text-primary",
        "transition-colors duration-(--duration-fast)",
        "hover:bg-bg-sunken",
        "focus-visible:outline-none focus-visible:bg-bg-sunken",
      )}
    >
      <span className="w-4 h-4 text-text-secondary shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
//  Menu Button (for actions)
// ─────────────────────────────────────────────────────────────

function MenuButton({
  icon,
  label,
  onClick,
  active,
  danger,
  disabled,
  trailing,
  hint,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3",
        "px-4 py-2",
        "text-body text-left",
        "transition-colors duration-(--duration-fast)",
        "focus-visible:outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        danger
          ? "text-danger hover:bg-danger-muted focus-visible:bg-danger-muted"
          : active
            ? "text-text-primary bg-brand-primary/5"
            : "text-text-primary hover:bg-bg-sunken focus-visible:bg-bg-sunken",
      )}
    >
      <span
        className={cn(
          "w-4 h-4 shrink-0",
          danger ? "text-danger" : "text-text-secondary",
        )}
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-body-sm text-text-muted">{hint}</span>}
      {trailing && <span className="shrink-0">{trailing}</span>}
    </button>
  );
}
