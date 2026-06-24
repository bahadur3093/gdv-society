import { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/utils";
import AuthBrandPanel from "./AuthBrandPanel";

interface AuthLayoutProps {
  /** Main form content (left panel) */
  children: ReactNode;
  /** Brand panel tagline */
  tagline: string;
  /** Optional brand panel decoration variant */
  brandVariant?: "default" | "success" | "time" | "security";
  /** Hide brand panel entirely (rare, for very minimal pages) */
  hideBrandPanel?: boolean;
}

export default function AuthLayout({
  children,
  tagline,
  brandVariant = "default",
  hideBrandPanel = false,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-bg-base">
      {/* Top header bar */}
      <header
        className={cn(
          "absolute top-0 left-0 right-0 z-20",
          "flex justify-between items-center",
          "px-6 py-4",
          "bg-transparent",
        )}
      >
        {/* Brand logo */}
        <Link
          href={"/"}
          className={cn(
            "inline-flex items-center gap-2",
            "rounded-md",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-brand-primary focus-visible:ring-offset-2",
            "focus-visible:ring-offset-bg-base",
          )}
        >
          <span
            className={cn(
              "text-h3 font-bold tracking-tight",
              "text-gradient-brand",
            )}
          >
            GDV Society Hub
          </span>
        </Link>

        {/* Help link */}
        <a
          href="mailto:support@gdvsociety.com"
          className={cn(
            "inline-flex items-center justify-center",
            "w-9 h-9 rounded-full",
            "text-text-secondary hover:text-text-primary",
            "hover:bg-bg-elevated",
            "transition-colors duration-(--duration-fast)",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-brand-primary",
          )}
          aria-label="Get help"
        >
          <HelpIcon />
        </a>
      </header>

      {/* Main split-screen layout */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-screen">
        {/* LEFT: Form panel */}
        <section
          className={cn(
            "flex-1",
            "flex flex-col justify-center items-center",
            "px-6 py-24 lg:px-12 lg:py-12",
            "lg:w-1/2",
            "relative z-10",
            "bg-bg-base",
          )}
        >
          <div className="w-full max-w-105">{children}</div>
        </section>

        {/* RIGHT: Brand panel (desktop only) */}
        {!hideBrandPanel && (
          <AuthBrandPanel tagline={tagline} variant={brandVariant} />
        )}
      </main>

      {/* Footer */}
      <footer
        className={cn(
          "absolute bottom-0 left-0 right-0 z-20",
          "flex flex-col md:flex-row",
          "justify-center items-center gap-4 md:gap-6",
          "px-4 py-6",
          "text-micro text-text-muted",
        )}
      >
        <span className="font-mono">
          © {new Date().getFullYear()} GDV Society Hub
        </span>
        <nav className="flex items-center gap-4">
          <Link
            href={"/privacy"}
            className="hover:text-text-primary transition-colors"
          >
            Privacy
          </Link>
          <Link
            href={"/terms"}
            className="hover:text-text-primary transition-colors"
          >
            Terms
          </Link>
          <a
            href="mailto:support@gdvsociety.com"
            className="hover:text-text-primary transition-colors"
          >
            Support
          </a>
        </nav>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Help Icon (inline SVG to avoid lucide import for SSR)
// ─────────────────────────────────────────────────────────────

function HelpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
