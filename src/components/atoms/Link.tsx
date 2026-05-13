'use client';

import React, { forwardRef } from 'react';
import NextLink from 'next/link';
import { cn } from '@/utils/classNames';

// Link variant types
export type LinkVariant = 'default' | 'button' | 'subtle' | 'brand';
export type LinkSize = 'sm' | 'md' | 'lg';
export type LinkTarget = '_self' | '_blank' | '_parent' | '_top';

// Base link props interface
interface BaseLinkProps {
  /** Link variant determines the visual style */
  variant?: LinkVariant;
  /** Link size */
  size?: LinkSize;
  /** Whether the link is disabled */
  disabled?: boolean;
  /** Whether to show external link indicator */
  showExternalIcon?: boolean;
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Position of the icon relative to text */
  iconPosition?: 'leading' | 'trailing';
  /** Custom className for additional styling */
  className?: string;
  /** Link content */
  children?: React.ReactNode;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA describedby for additional context */
  'aria-describedby'?: string;
}

// Internal link props (using Next.js Link)
export interface InternalLinkProps extends BaseLinkProps {
  /** Internal route path */
  href: string;
  /** Whether to replace the current history entry */
  replace?: boolean;
  /** Whether to scroll to top after navigation */
  scroll?: boolean;
  /** Prefetch behavior */
  prefetch?: boolean;
  /** Additional Next.js Link props */
  shallow?: boolean;
}

// External link props (using regular anchor)
export interface ExternalLinkProps extends BaseLinkProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children' | 'className'> {
  /** External URL */
  href: string;
  /** Link target */
  target?: LinkTarget;
  /** Relationship attribute for external links */
  rel?: string;
}

// Union type for all link props
export type LinkProps = InternalLinkProps | ExternalLinkProps;

// Type guard to check if link is external
const isExternalLink = (href: string): boolean => {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
};

// Type guard to check if props are for external link
const isExternalLinkProps = (props: LinkProps): props is ExternalLinkProps => {
  return isExternalLink(props.href);
};

// Variant styles mapping
const variantStyles: Record<LinkVariant, string> = {
  default: [
    'text-brand-primary',
    'hover:text-brand-primary/80',
    'focus-visible:text-brand-primary/80',
    'active:text-brand-primary/90',
    'underline decoration-brand-primary/30',
    'hover:decoration-brand-primary/60',
    'transition-colors duration-200'
  ].join(' '),
  
  button: [
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium',
    'bg-brand-primary text-white border border-brand-primary',
    'hover:bg-brand-primary/90 hover:border-brand-primary/90',
    'focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2',
    'active:bg-brand-primary/95',
    'transition-all duration-200',
    'no-underline'
  ].join(' '),
  
  subtle: [
    'text-text-muted',
    'hover:text-text-main',
    'focus-visible:text-text-main',
    'active:text-brand-primary',
    'transition-colors duration-200',
    'no-underline'
  ].join(' '),
  
  brand: [
    'text-brand-accent font-medium',
    'hover:text-brand-accent/80',
    'focus-visible:text-brand-accent/80',
    'active:text-brand-accent/90',
    'underline decoration-brand-accent/30',
    'hover:decoration-brand-accent/60',
    'transition-colors duration-200'
  ].join(' ')
};

// Size styles mapping
const sizeStyles: Record<LinkSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

// Icon size mapping based on link size
const iconSizes: Record<LinkSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
};

// External link icon component
const ExternalLinkIcon: React.FC<{ size: LinkSize }> = ({ size }) => {
  return (
    <svg
      className={cn('inline', iconSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
};

/**
 * Link component - A versatile link component for both internal and external navigation
 * 
 * Features:
 * - Automatic detection of internal vs external links
 * - Multiple variants (default, button, subtle, brand)
 * - Configurable sizes (sm, md, lg)
 * - Icon support with flexible positioning
 * - External link indicators
 * - Full accessibility support with proper ARIA attributes
 * - Next.js Link integration for internal navigation
 * - Disabled state handling
 * 
 * @example
 * ```tsx
 * // Internal link
 * <Link href="/dashboard" variant="default">
 *   Go to Dashboard
 * </Link>
 * 
 * // External link with icon
 * <Link href="https://example.com" variant="button" showExternalIcon>
 *   Visit External Site
 * </Link>
 * 
 * // Link with custom icon
 * <Link href="/settings" icon={<SettingsIcon />} iconPosition="leading">
 *   Settings
 * </Link>
 * ```
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>((
  {
    variant = 'default',
    size = 'md',
    disabled = false,
    showExternalIcon = true,
    icon,
    iconPosition = 'leading',
    className,
    children,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) => {
  const isExternal = isExternalLink(props.href);
  
  // Handle click events for disabled state
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    
    // Call original onClick if it exists
    if (isExternalLinkProps(props) && 'onClick' in props && props.onClick) {
      props.onClick(event);
    }
  };

  // Combine all styles
  const linkClasses = cn(
    // Base styles
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'transition-colors duration-200',
    
    // Variant styles
    variantStyles[variant],
    
    // Size styles
    sizeStyles[size],
    
    // Disabled state
    disabled && [
      'opacity-50',
      'cursor-not-allowed',
      'pointer-events-none'
    ],
    
    // Custom className
    className
  );

  // Render icon with appropriate styling
  const renderIcon = (iconElement: React.ReactNode, position: 'leading' | 'trailing') => {
    if (!iconElement) return null;
    
    return (
      <span 
        className={cn(
          'inline-flex items-center justify-center',
          iconSizes[size],
          position === 'leading' ? 'mr-1.5' : 'ml-1.5'
        )}
        aria-hidden="true"
      >
        {iconElement}
      </span>
    );
  };

  // Common content to render
  const linkContent = (
    <>
      {/* Leading icon */}
      {icon && iconPosition === 'leading' && renderIcon(icon, 'leading')}
      
      {/* Link text */}
      <span>{children}</span>
      
      {/* Trailing icon */}
      {icon && iconPosition === 'trailing' && renderIcon(icon, 'trailing')}
      
      {/* External link indicator */}
      {isExternal && showExternalIcon && (
        <ExternalLinkIcon size={size} />
      )}
    </>
  );

  // Render external link
  if (isExternalLinkProps(props)) {
    const {
      href,
      target = '_blank',
      rel = 'noopener noreferrer',
      variant: _variant,
      size: _size,
      disabled: _disabled,
      showExternalIcon: _showExternalIcon,
      icon: _icon,
      iconPosition: _iconPosition,
      className: _className,
      children: _children,
      'aria-label': _ariaLabel,
      'aria-describedby': _ariaDescribedBy,
      ...externalProps
    } = props;

    return (
      <a
        ref={ref}
        href={disabled ? undefined : href}
        target={target}
        rel={rel}
        className={linkClasses}
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled}
        {...externalProps}
      >
        {linkContent}
      </a>
    );
  }

  // Render internal link using Next.js Link
  const {
    href,
    replace = false,
    scroll = true,
    prefetch = true,
    shallow = false,
    variant: _variant,
    size: _size,
    disabled: _disabled,
    showExternalIcon: _showExternalIcon,
    icon: _icon,
    iconPosition: _iconPosition,
    className: _className,
    children: _children,
    'aria-label': _ariaLabel,
    'aria-describedby': _ariaDescribedBy,
    ...internalProps
  } = props as InternalLinkProps;

  if (disabled) {
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={linkClasses}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled}
      >
        {linkContent}
      </span>
    );
  }

  return (
    <NextLink
      href={href}
      replace={replace}
      scroll={scroll}
      prefetch={prefetch}
      shallow={shallow}
      ref={ref}
      className={linkClasses}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {...internalProps}
    >
      {linkContent}
    </NextLink>
  );
});

Link.displayName = 'Link';

// Types are already exported above