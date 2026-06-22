import { forwardRef, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import Card, { CardProps } from '../atoms/Card';
import { cn, formatCurrency, formatCurrencyCompact, formatNumber, formatPercent } from '@/lib/utils/utils';
import Skeleton, { SkeletonHeading, SkeletonText } from '../atoms/Skeleton';

export type StatCardAccent =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type StatCardVariant = 'default' | 'hero';

export type StatCardFormat = 'currency' | 'currency-compact' | 'number' | 'percent' | 'raw';

export interface StatCardTrend {
  /** Direction of change */
  direction: 'up' | 'down' | 'flat';
  /** Label to show (e.g., "+12%", "+₹3,200", "-5") */
  value: string;
  /** Whether up = good or down = good (default: up = good) */
  upIsGood?: boolean;
  /** Optional label after the value (e.g., "vs last month") */
  label?: string;
}

export interface StatCardProps extends Omit<CardProps, 'children'> {
  /** Small caps label above the value */
  label: string;
  /** The headline value */
  value: string | number;
  /** How to format value (defaults to 'raw' if string, 'currency' if number) */
  format?: StatCardFormat;
  /** Secondary text below value */
  description?: string;
  /** Icon shown top-right */
  icon?: ReactNode;
  /** Accent color tint for icon background */
  accent?: StatCardAccent;
  /** Visual size — hero is bigger, more prominent */
  variant?: StatCardVariant;
  /** Optional trend indicator */
  trend?: StatCardTrend;
  /** Loading state — shows skeleton */
  loading?: boolean;
  /** Use brand gradient on value (hero variant only — visual punch) */
  gradientValue?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Style maps
// ─────────────────────────────────────────────────────────────

const accentIconClasses: Record<StatCardAccent, string> = {
  neutral: 'bg-bg-sunken text-text-secondary',
  brand: 'bg-brand-primary/10 text-brand-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
};

const valueSizes: Record<StatCardVariant, string> = {
  default: 'text-h2 font-mono font-semibold',
  hero: 'text-display-2 font-mono font-bold',
};

const trendDirectionClasses: Record<'up' | 'down' | 'flat', string> = {
  up: 'text-success',
  down: 'text-danger',
  flat: 'text-text-muted',
};

const trendIcons = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
};

// ─────────────────────────────────────────────────────────────
//  Format helper
// ─────────────────────────────────────────────────────────────

function formatValue(value: string | number, format?: StatCardFormat): string {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'currency-compact':
      return formatCurrencyCompact(value);
    case 'number':
      return formatNumber(value);
    case 'percent':
      return formatPercent(value);
    case 'raw':
      return String(value);
    default:
      return formatCurrency(value);
  }
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  {
    label,
    value,
    format,
    description,
    icon,
    accent = 'neutral',
    variant = 'default',
    trend,
    loading = false,
    gradientValue = false,
    className,
    padding = 'md',
    ...cardProps
  },
  ref
) {
  // Loading state
  if (loading) {
    return (
      <Card ref={ref} padding={padding} className={cn('relative', className)} {...cardProps}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <SkeletonText size="sm" width={100} />
            <SkeletonHeading size={variant === 'hero' ? 'h1' : 'h2'} width="50%" />
            <SkeletonText size="sm" width={140} />
          </div>
          {icon && (
            <Skeleton width={40} height={40} shape="rect" className="rounded-lg" />
          )}
        </div>
      </Card>
    );
  }

  // Determine trend display
  const showTrend = !!trend;
  const upIsGood = trend?.upIsGood ?? true;
  const trendColor = trend
    ? trend.direction === 'flat'
      ? 'flat'
      : (trend.direction === 'up') === upIsGood
      ? 'up'
      : 'down'
    : 'flat';
  const TrendIcon = trend ? trendIcons[trend.direction] : null;

  return (
    <Card
      ref={ref}
      padding={padding}
      className={cn('relative', className)}
      {...cardProps}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left side: label + value + description */}
        <div className="flex-1 min-w-0">
          <p className="text-micro uppercase text-text-muted font-medium tracking-wider">
            {label}
          </p>
          <p
            className={cn(
              'mt-2 truncate',
              valueSizes[variant],
              gradientValue
                ? 'text-gradient-brand'
                : accent === 'success'
                ? 'text-success'
                : accent === 'warning'
                ? 'text-warning'
                : accent === 'danger'
                ? 'text-danger'
                : accent === 'info'
                ? 'text-info'
                : accent === 'brand'
                ? 'text-brand-primary'
                : 'text-text-primary'
            )}
          >
            {formatValue(value, format)}
          </p>

          {/* Description + trend */}
          {(description || showTrend) && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {showTrend && TrendIcon && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-body-sm font-medium',
                    trendDirectionClasses[trendColor]
                  )}
                >
                  <TrendIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  {trend.value}
                  {trend.label && (
                    <span className="text-text-muted font-normal ml-1">
                      {trend.label}
                    </span>
                  )}
                </span>
              )}
              {description && !showTrend && (
                <p className="text-body-sm text-text-secondary">{description}</p>
              )}
              {description && showTrend && (
                <p className="text-body-sm text-text-secondary">{description}</p>
              )}
            </div>
          )}
        </div>

        {/* Right side: icon */}
        {icon && (
          <div
            className={cn(
              'shrink-0 flex items-center justify-center',
              'rounded-lg',
              variant === 'hero' ? 'w-12 h-12' : 'w-10 h-10',
              accentIconClasses[accent]
            )}
          >
            <span
              className={cn(
                'inline-flex',
                variant === 'hero' ? 'w-6 h-6' : 'w-5 h-5'
              )}
            >
              {icon}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
});

export default StatCard;