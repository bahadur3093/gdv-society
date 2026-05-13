import React, { forwardRef } from 'react';
import { cn } from '@/utils/classNames';

// Typography variant types
export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'small' | 'caption' | 'label' | 'code';
export type TypographyWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';
export type TypographyColor = 'default' | 'muted' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'white';

// Typography component props interface
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /** Typography variant determines the HTML element and styling */
  variant?: TypographyVariant;
  /** Font weight */
  weight?: TypographyWeight;
  /** Text alignment */
  align?: TypographyAlign;
  /** Text color */
  color?: TypographyColor;
  /** Whether text should be truncated with ellipsis */
  truncate?: boolean;
  /** Whether text should wrap or not */
  noWrap?: boolean;
  /** Custom HTML element to render as */
  as?: keyof JSX.IntrinsicElements;
  /** Custom className for additional styling */
  className?: string;
  /** Typography content */
  children: React.ReactNode;
}

// Element mapping for each variant
const variantElements: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  small: 'small',
  caption: 'span',
  label: 'label',
  code: 'code'
};

// Variant styles mapping
const variantStyles: Record<TypographyVariant, string> = {
  h1: 'text-4xl lg:text-5xl font-bold tracking-tight leading-tight',
  h2: 'text-3xl lg:text-4xl font-bold tracking-tight leading-tight',
  h3: 'text-2xl lg:text-3xl font-semibold tracking-tight leading-snug',
  h4: 'text-xl lg:text-2xl font-semibold tracking-tight leading-snug',
  h5: 'text-lg lg:text-xl font-semibold leading-snug',
  h6: 'text-base lg:text-lg font-semibold leading-normal',
  body: 'text-base leading-relaxed',
  small: 'text-sm leading-normal',
  caption: 'text-xs leading-normal',
  label: 'text-sm font-medium leading-normal',
  code: 'text-sm font-mono bg-surface px-1.5 py-0.5 rounded border border-border'
};

// Weight styles mapping
const weightStyles: Record<TypographyWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

// Alignment styles mapping
const alignStyles: Record<TypographyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify'
};

// Color styles mapping
const colorStyles: Record<TypographyColor, string> = {
  default: 'text-text-main',
  muted: 'text-text-muted',
  primary: 'text-brand-primary',
  secondary: 'text-brand-secondary',
  accent: 'text-brand-accent',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  white: 'text-white'
};

/**
 * Typography component - A flexible text component with semantic HTML elements
 * 
 * Features:
 * - Semantic HTML elements based on variant
 * - Responsive font sizes for headings
 * - Multiple font weights and colors
 * - Text alignment options
 * - Truncation and wrapping controls
 * - Custom element override with 'as' prop
 * - Accessibility support with proper heading hierarchy
 * 
 * @example
 * ```tsx
 * <Typography variant="h1" color="primary">
 *   Main Heading
 * </Typography>
 * 
 * <Typography variant="body" color="muted" truncate>
 *   This is a long body text that will be truncated with ellipsis
 * </Typography>
 * 
 * <Typography variant="label" weight="semibold">
 *   Form Label
 * </Typography>
 * 
 * <Typography variant="code">
 *   const example = 'code snippet';
 * </Typography>
 * ```
 */
export const Typography = forwardRef<any, TypographyProps>((
  {
    variant = 'body',
    weight,
    align = 'left',
    color = 'default',
    truncate = false,
    noWrap = false,
    as,
    className,
    children,
    ...props
  },
  ref
) => {
  // Determine the HTML element to render
  const Element = as || variantElements[variant];
  
  // Get default weight for variant if not specified
  const getDefaultWeight = (): TypographyWeight => {
    switch (variant) {
      case 'h1':
      case 'h2':
        return 'bold';
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'label':
        return 'semibold';
      default:
        return 'normal';
    }
  };
  
  const finalWeight = weight || getDefaultWeight();

  // Combine all styles
  const typographyClasses = cn(
    // Base styles
    'font-sans',
    
    // Variant styles (includes default weight for some variants)
    variantStyles[variant],
    
    // Override weight if specified
    weight && weightStyles[finalWeight],
    
    // Alignment styles
    alignStyles[align],
    
    // Color styles
    colorStyles[color],
    
    // Truncation and wrapping
    truncate && 'truncate',
    noWrap && 'whitespace-nowrap',
    
    // Custom className
    className
  );

  return React.createElement(
    Element as any,
    {
      ref,
      className: typographyClasses,
      ...props
    },
    children
  );
});

Typography.displayName = 'Typography';

// Convenience components for common use cases
export const Heading = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'> & { level: 1 | 2 | 3 | 4 | 5 | 6 }>((
  { level, ...props },
  ref
) => {
  const variant = `h${level}` as TypographyVariant;
  return <Typography ref={ref} variant={variant} {...props} />;
});

Heading.displayName = 'Heading';

export const Text = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>((
  props,
  ref
) => {
  return <Typography ref={ref} variant="body" {...props} />;
});

Text.displayName = 'Text';

export const Label = forwardRef<HTMLLabelElement, Omit<TypographyProps, 'variant'>>((
  props,
  ref
) => {
  return <Typography ref={ref} variant="label" {...props} />;
});

Label.displayName = 'Label';

export const Code = forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>((
  props,
  ref
) => {
  return <Typography ref={ref} variant="code" {...props} />;
});

Code.displayName = 'Code';

// Types are already exported above