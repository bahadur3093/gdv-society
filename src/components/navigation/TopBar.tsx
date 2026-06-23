'use client';

import { cn } from '@/lib/utils/utils';
import { forwardRef, useEffect, useState, type ReactNode, type HTMLAttributes } from 'react';

export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Left slot — typically a menu hamburger or back button */
  leading?: ReactNode;
  /** Title — string or custom JSX */
  title?: ReactNode;
  /** Subtitle below title (small text) */
  subtitle?: ReactNode;
  /** Center slot — typically search or breadcrumbs (hidden on mobile by default) */
  center?: ReactNode;
  /** Right slot — actions (notifications, user menu, etc.) */
  actions?: ReactNode;
  /** Compact mode (smaller height) */
  compact?: boolean;
  /** Add glass/blur effect when page scrolled */
  glassOnScroll?: boolean;
  /** Hide on scroll down (mobile feature) */
  hideOnScroll?: boolean;
  /** Bottom border */
  bordered?: boolean;
  /** Show center on mobile (default: desktop-only) */
  centerOnMobile?: boolean;
  /** Custom container className (inner) */
  containerClassName?: string;
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar(
  {
    leading,
    title,
    subtitle,
    center,
    actions,
    compact = false,
    glassOnScroll = true,
    hideOnScroll = false,
    bordered = true,
    centerOnMobile = false,
    className,
    containerClassName,
    ...props
  },
  ref
) {
  const [scrolled, setScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Track scroll for glass effect + hide-on-scroll
  useEffect(() => {
    if (!glassOnScroll && !hideOnScroll) return;

    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;

        // Glass effect when scrolled past 4px
        if (glassOnScroll) {
          setScrolled(currentY > 4);
        }

        // Hide on scroll down (only after 100px)
        if (hideOnScroll) {
          const goingDown = currentY > lastY;
          if (currentY > 100 && goingDown) {
            setIsHidden(true);
          } else {
            setIsHidden(false);
          }
        }

        lastY = currentY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [glassOnScroll, hideOnScroll]);

  const height = compact ? 'h-12' : 'h-14 md:h-16';

  return (
    <header
      ref={ref}
      className={cn(
        // Sticky positioning
        'sticky top-0 z-30',
        // Safe area top (iOS notch)
        'pt-[env(safe-area-inset-top)]',
        // Surface — transitions from solid to glass on scroll
        'transition-all duration-(--duration)',
        scrolled && glassOnScroll
          ? 'bg-bg-base/80 backdrop-blur-xl'
          : 'bg-bg-base',
        // Border
        bordered && 'border-b border-border-subtle',
        // Hide animation
        hideOnScroll && 'transition-transform duration-(--duration-slow)',
        isHidden && '-translate-y-full',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'flex items-center gap-3 px-4 md:px-6',
          height,
          containerClassName
        )}
      >
        {/* Leading slot */}
        {leading && <div className="shrink-0 flex items-center">{leading}</div>}

        {/* Title block */}
        {(title || subtitle) && (
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {title && (
              <div
                className={cn(
                  'text-text-primary font-semibold truncate',
                  compact ? 'text-body font-medium' : 'text-h4'
                )}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div className="text-body-sm text-text-muted truncate">
                {subtitle}
              </div>
            )}
          </div>
        )}

        {/* Center slot (search, breadcrumbs) — usually desktop-only */}
        {center && (
          <div
            className={cn(
              'flex-1 min-w-0 max-w-2xl mx-auto',
              !centerOnMobile && 'hidden md:flex md:justify-center'
            )}
          >
            {center}
          </div>
        )}

        {/* Spacer when no title and center is hidden on mobile */}
        {!title && !subtitle && center && !centerOnMobile && (
          <div className="flex-1 md:hidden" />
        )}

        {/* Right actions */}
        {actions && (
          <div className="shrink-0 flex items-center gap-1">{actions}</div>
        )}
      </div>
    </header>
  );
});

export default TopBar;