'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/utils/classNames';

// Card variant types
export type CardVariant = 'basic' | 'interactive' | 'media' | 'statistics';
export type CardElevation = 'none' | 'low' | 'medium' | 'high';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

// Card component props interface
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant determines the visual style and behavior */
  variant?: CardVariant;
  /** Elevation level controls shadow depth */
  elevation?: CardElevation;
  /** Padding size for card content */
  padding?: CardPadding;
  /** Whether the card should be clickable (adds hover effects) */
  clickable?: boolean;
  /** Whether the card is in a selected state */
  selected?: boolean;
  /** Whether the card is in a disabled state */
  disabled?: boolean;
  /** Custom className for additional styling */
  className?: string;
  /** Card content */
  children: React.ReactNode;
  /** Optional click handler for interactive cards */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA role for semantic meaning */
  role?: string;
}

// Compound components for Card structure
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

// Variant styles mapping
const variantStyles: Record<CardVariant, string> = {
  basic: 'bg-surface border border-border',
  interactive: 'bg-surface border border-border transition-all duration-200 hover:border-brand-primary/50 hover:shadow-lg cursor-pointer',
  media: 'bg-surface border border-border overflow-hidden',
  statistics: 'bg-gradient-to-br from-surface to-surface/80 border border-brand-primary/20 backdrop-blur-sm'
};

// Elevation styles mapping
const elevationStyles: Record<CardElevation, string> = {
  none: '',
  low: 'shadow-sm',
  medium: 'shadow-md',
  high: 'shadow-tactical'
};

// Padding styles mapping
const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

/**
 * Card component - A flexible container for grouping related content
 * 
 * Features:
 * - Multiple variants (basic, interactive, media, statistics)
 * - Configurable elevation and padding
 * - Accessibility support with proper ARIA attributes
 * - Keyboard navigation for interactive cards
 * - Compound components for structured content (Header, Body, Footer)
 * 
 * @example
 * ```tsx
 * <Card variant="interactive" elevation="medium" padding="lg" onClick={handleClick}>
 *   <Card.Header>
 *     <h3>Card Title</h3>
 *   </Card.Header>
 *   <Card.Body>
 *     <p>Card content goes here</p>
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button>Action</Button>
 *   </Card.Footer>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>((
  {
    variant = 'basic',
    elevation = 'low',
    padding = 'md',
    clickable = false,
    selected = false,
    disabled = false,
    className,
    children,
    onClick,
    'aria-label': ariaLabel,
    role,
    ...props
  },
  ref
) => {
  // Determine if card should be interactive
  const isInteractive = clickable || onClick || variant === 'interactive';
  
  // Handle keyboard events for accessibility
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isInteractive && !disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(event as any);
    }
  };

  // Combine all styles
  const cardClasses = cn(
    // Base styles
    'rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    
    // Variant styles
    variantStyles[variant],
    
    // Elevation styles
    elevationStyles[elevation],
    
    // Padding styles
    paddingStyles[padding],
    
    // Interactive states
    isInteractive && !disabled && [
      'focus-visible:outline-none',
      'hover:shadow-lg',
      variant === 'interactive' && 'hover:border-brand-primary/50'
    ],
    
    // Selected state
    selected && [
      'border-brand-primary',
      'ring-2 ring-brand-primary/20'
    ],
    
    // Disabled state
    disabled && [
      'opacity-50',
      'cursor-not-allowed',
      'pointer-events-none'
    ],
    
    // Custom className
    className
  );

  return (
    <div
      ref={ref}
      className={cardClasses}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={!disabled ? handleKeyDown : undefined}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      role={role || (isInteractive ? 'button' : undefined)}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      aria-pressed={selected}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card Header component
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>((
  { className, children, ...props },
  ref
) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5 p-6 pb-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

// Card Body component
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>((
  { className, children, ...props },
  ref
) => {
  return (
    <div
      ref={ref}
      className={cn(
        'p-6 pt-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardBody.displayName = 'CardBody';

// Card Footer component
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>((
  { className, children, ...props },
  ref
) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center p-6 pt-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

// Create compound component with proper TypeScript typing
type CardComponent = React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

// Attach compound components to main Card component
(Card as CardComponent).Header = CardHeader;
(Card as CardComponent).Body = CardBody;
(Card as CardComponent).Footer = CardFooter;

// Types are already exported above