import React, { forwardRef } from 'react';
import { cn } from '@/utils/classNames';

// Badge variant and size types
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeShape = 'rounded' | 'pill';

// Badge component props interface
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge variant determines the color scheme */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Badge shape */
  shape?: BadgeShape;
  /** Whether the badge can be removed */
  removable?: boolean;
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Position of the icon relative to text */
  iconPosition?: 'leading' | 'trailing';
  /** Custom className for additional styling */
  className?: string;
  /** Badge content */
  children?: React.ReactNode;
  /** Remove handler for removable badges */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

// Variant styles mapping
const variantStyles: Record<BadgeVariant, string> = {
  default: [
    'bg-surface text-text-main border border-border',
    'hover:bg-surface/80'
  ].join(' '),
  
  primary: [
    'bg-brand-primary text-white',
    'hover:bg-brand-primary/90'
  ].join(' '),
  
  secondary: [
    'bg-brand-secondary text-white',
    'hover:bg-brand-secondary/90'
  ].join(' '),
  
  success: [
    'bg-green-100 text-green-800 border border-green-200',
    'hover:bg-green-200'
  ].join(' '),
  
  warning: [
    'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'hover:bg-yellow-200'
  ].join(' '),
  
  error: [
    'bg-red-100 text-red-800 border border-red-200',
    'hover:bg-red-200'
  ].join(' '),
  
  info: [
    'bg-blue-100 text-blue-800 border border-blue-200',
    'hover:bg-blue-200'
  ].join(' ')
};

// Size styles mapping
const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs font-medium min-h-[20px]',
  md: 'px-2.5 py-1 text-xs font-medium min-h-[24px]',
  lg: 'px-3 py-1.5 text-sm font-medium min-h-[28px]'
};

// Shape styles mapping
const shapeStyles: Record<BadgeShape, string> = {
  rounded: 'rounded-md',
  pill: 'rounded-full'
};

// Icon size mapping based on badge size
const iconSizes: Record<BadgeSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4'
};

// Remove button styles
const removeButtonStyles = {
  sm: 'w-3 h-3 ml-1',
  md: 'w-3.5 h-3.5 ml-1.5',
  lg: 'w-4 h-4 ml-2'
};

// Remove icon component
const RemoveIcon: React.FC<{ size: BadgeSize }> = ({ size }) => {
  return (
    <svg
      className={cn('stroke-current', iconSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l8 8M6 14l8-8" />
    </svg>
  );
};

/**
 * Badge component - A flexible badge/tag component for labeling and categorization
 * 
 * Features:
 * - Multiple variants with semantic colors (default, primary, secondary, success, warning, error, info)
 * - Configurable sizes (sm, md, lg)
 * - Shape options (rounded, pill)
 * - Icon support with flexible positioning
 * - Removable functionality with close button
 * - Full accessibility support with proper ARIA attributes
 * - Keyboard navigation for removable badges
 * 
 * @example
 * ```tsx
 * <Badge variant="primary" size="md">
 *   New
 * </Badge>
 * 
 * <Badge variant="success" icon={<Icon name="check" />} iconPosition="leading">
 *   Completed
 * </Badge>
 * 
 * <Badge variant="warning" removable onRemove={handleRemove}>
 *   Removable Tag
 * </Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>((
  {
    variant = 'default',
    size = 'md',
    shape = 'rounded',
    removable = false,
    icon,
    iconPosition = 'leading',
    className,
    children,
    onRemove,
    'aria-label': ariaLabel,
    ...props
  },
  ref
) => {
  // Handle remove button click
  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove?.(event);
  };

  // Handle remove button keyboard events
  const handleRemoveKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onRemove?.(event as any);
    }
  };

  // Combine all styles
  const badgeClasses = cn(
    // Base styles
    'inline-flex items-center justify-center gap-1 font-medium transition-colors duration-200',
    'focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-primary/50 focus-within:ring-offset-2 focus-within:ring-offset-background',
    
    // Variant styles
    variantStyles[variant],
    
    // Size styles
    sizeStyles[size],
    
    // Shape styles
    shapeStyles[shape],
    
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
          iconSizes[size]
        )}
        aria-hidden="true"
      >
        {iconElement}
      </span>
    );
  };

  return (
    <span
      ref={ref}
      className={badgeClasses}
      aria-label={ariaLabel}
      {...props}
    >
      {/* Leading icon */}
      {icon && iconPosition === 'leading' && renderIcon(icon, 'leading')}
      
      {/* Badge text */}
      {children && (
        <span className="truncate">
          {children}
        </span>
      )}
      
      {/* Trailing icon */}
      {icon && iconPosition === 'trailing' && renderIcon(icon, 'trailing')}
      
      {/* Remove button */}
      {removable && (
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            'hover:bg-black/10 focus:bg-black/10 focus:outline-none',
            'transition-colors duration-200',
            removeButtonStyles[size]
          )}
          onClick={handleRemoveClick}
          onKeyDown={handleRemoveKeyDown}
          aria-label={`Remove ${children || 'badge'}`}
          tabIndex={0}
        >
          <RemoveIcon size={size} />
        </button>
      )}
    </span>
  );
});

Badge.displayName = 'Badge';

// Types are already exported above