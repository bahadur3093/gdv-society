'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/utils/classNames';

// Button variant types
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonIconPosition = 'leading' | 'trailing' | 'only';

// Button component props interface
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Button variant determines the visual style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Position of the icon relative to text */
  iconPosition?: ButtonIconPosition;
  /** Custom className for additional styling */
  className?: string;
  /** Button content */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Form type for the button */
  type?: 'button' | 'submit' | 'reset';
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA describedby for additional context */
  'aria-describedby'?: string;
}

// Variant styles mapping
const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand-primary text-white',
    'border border-brand-primary',
    'hover:bg-brand-primary/90 hover:border-brand-primary/90',
    'focus-visible:ring-brand-primary/50',
    'active:bg-brand-primary/95',
    'disabled:bg-brand-primary/50 disabled:border-brand-primary/50'
  ].join(' '),
  
  secondary: [
    'bg-brand-secondary text-white',
    'border border-brand-secondary',
    'hover:bg-brand-secondary/90 hover:border-brand-secondary/90',
    'focus-visible:ring-brand-secondary/50',
    'active:bg-brand-secondary/95',
    'disabled:bg-brand-secondary/50 disabled:border-brand-secondary/50'
  ].join(' '),
  
  tertiary: [
    'bg-surface text-text-main',
    'border border-border',
    'hover:bg-surface/80 hover:border-brand-primary/50',
    'focus-visible:ring-brand-primary/50',
    'active:bg-surface/90',
    'disabled:bg-surface/50 disabled:text-text-muted disabled:border-border/50'
  ].join(' '),
  
  danger: [
    'bg-red-600 text-white',
    'border border-red-600',
    'hover:bg-red-700 hover:border-red-700',
    'focus-visible:ring-red-500/50',
    'active:bg-red-800',
    'disabled:bg-red-600/50 disabled:border-red-600/50'
  ].join(' '),
  
  ghost: [
    'bg-transparent text-text-main',
    'border border-transparent',
    'hover:bg-surface/50 hover:text-brand-primary',
    'focus-visible:ring-brand-primary/50',
    'active:bg-surface/70',
    'disabled:text-text-muted disabled:bg-transparent'
  ].join(' ')
};

// Size styles mapping
const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs font-medium min-h-[24px]',
  sm: 'px-3 py-1.5 text-sm font-medium min-h-[32px]',
  md: 'px-4 py-2 text-sm font-medium min-h-[40px]',
  lg: 'px-6 py-2.5 text-base font-medium min-h-[48px]',
  xl: 'px-8 py-3 text-lg font-medium min-h-[56px]'
};

// Icon size mapping based on button size
const iconSizes: Record<ButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6'
};

// Loading spinner component
const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  return (
    <svg
      className={cn('animate-spin', iconSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

/**
 * Button component - A versatile button with multiple variants and states
 * 
 * Features:
 * - Multiple variants (primary, secondary, tertiary, danger, ghost)
 * - Configurable sizes (xs, sm, md, lg, xl)
 * - Loading state with spinner
 * - Icon support with flexible positioning
 * - Full accessibility support with proper ARIA attributes
 * - Keyboard navigation and focus management
 * - Disabled state handling
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * 
 * <Button variant="secondary" icon={<Icon name="plus" />} iconPosition="leading">
 *   Add Item
 * </Button>
 * 
 * <Button variant="danger" loading disabled>
 *   Deleting...
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    iconPosition = 'leading',
    className,
    children,
    onClick,
    type = 'button',
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) => {
  // Determine if button should be disabled
  const isDisabled = disabled || loading;
  
  // Determine if this is an icon-only button
  const isIconOnly = iconPosition === 'only' || (!children && icon);
  
  // Handle click events
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  // Combine all styles
  const buttonClasses = cn(
    // Base styles
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    
    // Variant styles
    variantStyles[variant],
    
    // Size styles
    sizeStyles[size],
    
    // Full width
    fullWidth && 'w-full',
    
    // Icon-only button adjustments
    isIconOnly && {
      xs: 'px-1',
      sm: 'px-1.5',
      md: 'px-2',
      lg: 'px-2.5',
      xl: 'px-3'
    }[size],
    
    // Custom className
    className
  );

  // Render icon with appropriate styling
  const renderIcon = (iconElement: React.ReactNode, position: 'leading' | 'trailing') => {
    if (!iconElement) return null;
    
    return (
      <span 
        className={cn(
          'flex items-center justify-center',
          iconSizes[size],
          // Add margin for spacing when there's text
          !isIconOnly && position === 'leading' && 'mr-1',
          !isIconOnly && position === 'trailing' && 'ml-1'
        )}
        aria-hidden="true"
      >
        {iconElement}
      </span>
    );
  };

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={handleClick}
      aria-label={ariaLabel || (isIconOnly ? 'Button' : undefined)}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <LoadingSpinner size={size} />
      )}
      
      {/* Leading icon */}
      {!loading && icon && (iconPosition === 'leading' || iconPosition === 'only') && 
        renderIcon(icon, 'leading')
      }
      
      {/* Button text */}
      {!isIconOnly && children && (
        <span className={loading ? 'opacity-0' : undefined}>
          {children}
        </span>
      )}
      
      {/* Trailing icon */}
      {!loading && icon && iconPosition === 'trailing' && 
        renderIcon(icon, 'trailing')
      }
    </button>
  );
});

Button.displayName = 'Button';

// Types are already exported above