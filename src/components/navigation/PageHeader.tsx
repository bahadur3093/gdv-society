import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import IconButton from "../atoms/IconButton";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Breadcrumb path (optional) */
  breadcrumbs?: Breadcrumb[];
  /** Back button — href or onClick */
  back?: { href?: string; onClick?: () => void; label?: string };
  /** Icon/avatar element shown left of title */
  leading?: ReactNode;
  /** Page title — required */
  title: ReactNode;
  /** Badge shown next to title */
  badge?: ReactNode;
  /** Description below title */
  description?: ReactNode;
  /** Primary action(s) — buttons */
  actions?: ReactNode;
  /** Bottom border */
  bordered?: boolean;
  /** Compact mode (less vertical spacing) */
  compact?: boolean;
  /** Tabs/navigation row shown below the header */
  tabs?: ReactNode;
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  {
    breadcrumbs,
    back,
    leading,
    title,
    badge,
    description,
    actions,
    bordered = false,
    compact = false,
    tabs,
    className,
    ...props
  },
  ref,
) {
  return (
    <header
      ref={ref}
      className={cn(
        "w-full",
        compact ? "pb-4" : "pb-6",
        bordered && "border-b border-border-subtle",
        className,
      )}
      {...props}
    >
      {/* ─── Breadcrumbs ─── */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center gap-1 flex-wrap text-body-sm">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li
                  key={`${crumb.label}-${idx}`}
                  className="flex items-center gap-1"
                >
                  {idx > 0 && (
                    <ChevronRight
                      className="w-3.5 h-3.5 text-text-muted shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className={cn(
                        "text-text-muted hover:text-text-primary",
                        "transition-colors duration-[var(--duration-fast)]",
                        "focus-visible:outline-none focus-visible:underline",
                      )}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        isLast
                          ? "text-text-primary font-medium"
                          : "text-text-muted",
                      )}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* ─── Main row: back + leading + title + actions ─── */}
      <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
        {/* Back button */}
        {back && <BackButton {...back} />}

        {/* Leading (avatar/icon) */}
        {leading && <div className="shrink-0 mt-1">{leading}</div>}

        {/* Title block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className={cn(
                "text-text-primary truncate",
                compact ? "text-h2" : "text-h1",
              )}
            >
              {title}
            </h1>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
          {description && (
            <p
              className={cn(
                "text-text-secondary",
                compact ? "text-body-sm mt-1" : "text-body mt-2",
                "max-w-3xl",
              )}
            >
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div
            className={cn(
              "shrink-0 flex items-center gap-2 flex-wrap",
              // On mobile, actions move to next row (full width)
              "w-full sm:w-auto",
            )}
          >
            {actions}
          </div>
        )}
      </div>

      {/* ─── Tabs row ─── */}
      {tabs && <div className="mt-6 -mb-px">{tabs}</div>}
    </header>
  );
});

export default PageHeader;

// ─────────────────────────────────────────────────────────────
//  Back button (extracted for readability)
// ─────────────────────────────────────────────────────────────

function BackButton({
  href,
  onClick,
  label = "Back",
}: NonNullable<PageHeaderProps["back"]>) {
  if (href) {
    return (
      <IconButton
        asChild
        label={label}
        icon={<ChevronLeft />}
        variant="ghost"
        size="md"
        className="shrink-0 -ml-2 mt-1"
      >
        <Link href={href}>label</Link>
      </IconButton>
    );
  }
  return (
    <IconButton
      label={label}
      icon={<ChevronLeft />}
      variant="ghost"
      size="md"
      onClick={onClick}
      className="shrink-0 -ml-2 mt-1"
    />
  );
}
