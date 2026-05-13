'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/utils/classNames';

// Input variant and size types
export type InputVariant = 'outlined' | 'filled';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success';

// Input component props interface
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input variant determines the visual style */
  variant?: InputVariant;
  /** Input size */
  size?: InputSize;
  /** Input state for validation feedback */
  state?: InputState;
  /** Whether the input has an error */
  error?: boolean;
  /** Whether the input is in a success state */
  success?: boolean;
  /** Icon element to display at the start */
  startIcon?: React.ReactNode;
  /** Icon element to display at the end */
  endIcon?: React.ReactNode;
  /** Helper text to display below the input */
  helperText?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Success message to display */
  successMessage?: string;
  /** Custom className for additional styling */
  className?: string;
  /** Custom className for the input wrapper */
  wrapperClassName?: string;
  /** ARIA describedby for additional context */
  'aria-describedby'?: string;
}

// Textarea component props interface
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Textarea variant determines the visual style */
  variant?: InputVariant;
  /** Textarea size */
  size?: InputSize;
  /** Textarea state for validation feedback */
  state?: InputState;
  /** Whether the textarea has an error */
  error?: boolean;
  /** Whether the textarea is in a success state */
  success?: boolean;
  /** Helper text to display below the textarea */
  helperText?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Success message to display */
  successMessage?: string;
  /** Whether the textarea should auto-resize */
  autoResize?: boolean;
  /** Custom className for additional styling */
  className?: string;
  /** Custom className for the textarea wrapper */
  wrapperClassName?: string;
  /** ARIA describedby for additional context */
  'aria-describedby'?: string;
}

// Variant styles mapping
const variantStyles: Record<InputVariant, string> = {
  outlined: [
    'bg-transparent border border-border',
    'focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
    'hover:border-brand-primary/50'
  ].join(' '),
  
  filled: [
    'bg-surface border border-transparent',
    'focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:bg-transparent',
    'hover:bg-surface/80'
  ].join(' ')
};

// Size styles mapping
const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[32px]',
  md: 'px-3 py-2 text-sm min-h-[40px]',
  lg: 'px-4 py-2.5 text-base min-h-[48px]'
};

// State styles mapping
const stateStyles: Record<InputState, string> = {
  default: '',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
};

// Icon size mapping based on input size
const iconSizes: Record<InputSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
};

/**
 * Input component - A flexible input field with validation states and icons
 * 
 * Features:
 * - Multiple variants (outlined, filled)
 * - Configurable sizes (sm, md, lg)
 * - Validation states (default, error, success)
 * - Start and end icon support
 * - Helper text and error messages
 * - Full accessibility support with proper ARIA attributes
 * - Keyboard navigation and focus management
 * 
 * @example
 * ```tsx
 * <Input
 *   placeholder="Enter your email"
 *   type="email"
 *   startIcon={<Icon name="user" />}
 *   helperText="We'll never share your email"
 * />
 * 
 * <Input
 *   value={value}
 *   onChange={handleChange}
 *   error={!!error}
 *   errorMessage={error}
 *   variant="filled"
 *   size="lg"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    variant = 'outlined',
    size = 'md',
    state = 'default',
    error = false,
    success = false,
    startIcon,
    endIcon,
    helperText,
    errorMessage,
    successMessage,
    className,
    wrapperClassName,
    disabled = false,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) => {
  // Determine the actual state based on props
  const actualState = error ? 'error' : success ? 'success' : state;
  
  // Generate unique IDs for helper text
  const helperId = React.useId();
  const helperTextId = `${helperId}-helper`;
  const errorId = `${helperId}-error`;
  const successId = `${helperId}-success`;
  
  // Determine which message to show
  const message = errorMessage || successMessage || helperText;
  const messageId = error && errorMessage ? errorId : 
                   success && successMessage ? successId : 
                   helperText ? helperTextId : undefined;
  
  // Combine ARIA describedby
  const combinedAriaDescribedBy = [ariaDescribedBy, messageId].filter(Boolean).join(' ') || undefined;

  // Combine all input styles
  const inputClasses = cn(
    // Base styles
    'w-full rounded-lg font-medium transition-all duration-200',
    'focus:outline-none focus:ring-offset-2 focus:ring-offset-background',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-text-muted',
    
    // Variant styles
    variantStyles[variant],
    
    // Size styles
    sizeStyles[size],
    
    // State styles
    stateStyles[actualState],
    
    // Icon padding adjustments
    startIcon && {
      sm: 'pl-9',
      md: 'pl-10',
      lg: 'pl-11'
    }[size],
    
    endIcon && {
      sm: 'pr-9',
      md: 'pr-10',
      lg: 'pr-11'
    }[size],
    
    // Custom className
    className
  );

  // Wrapper styles
  const wrapperClasses = cn(
    'relative',
    wrapperClassName
  );

  // Icon wrapper styles
  const iconWrapperClasses = (position: 'start' | 'end') => cn(
    'absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-text-muted',
    iconSizes[size],
    position === 'start' ? {
      sm: 'left-2.5',
      md: 'left-3',
      lg: 'left-3.5'
    }[size] : {
      sm: 'right-2.5',
      md: 'right-3',
      lg: 'right-3.5'
    }[size]
  );

  return (
    <div className={wrapperClasses}>
      <div className="relative">
        {/* Start icon */}
        {startIcon && (
          <div className={iconWrapperClasses('start')}>
            {startIcon}
          </div>
        )}
        
        {/* Input field */}
        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          aria-describedby={combinedAriaDescribedBy}
          aria-invalid={error}
          {...props}
        />
        
        {/* End icon */}
        {endIcon && (
          <div className={iconWrapperClasses('end')}>
            {endIcon}
          </div>
        )}
      </div>
      
      {/* Helper/Error/Success text */}
      {message && (
        <p
          id={messageId}
          className={cn(
            'mt-1.5 text-xs',
            error ? 'text-red-500' : success ? 'text-green-500' : 'text-text-muted'
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Textarea component - A flexible textarea field with validation states
 * 
 * Features:
 * - Multiple variants (outlined, filled)
 * - Configurable sizes (sm, md, lg)
 * - Validation states (default, error, success)
 * - Auto-resize functionality
 * - Helper text and error messages
 * - Full accessibility support with proper ARIA attributes
 * 
 * @example
 * ```tsx
 * <Textarea
 *   placeholder="Enter your message"
 *   rows={4}
 *   helperText="Maximum 500 characters"
 * />
 * 
 * <Textarea
 *   value={value}
 *   onChange={handleChange}
 *   autoResize
 *   error={!!error}
 *   errorMessage={error}
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((
  {
    variant = 'outlined',
    size = 'md',
    state = 'default',
    error = false,
    success = false,
    helperText,
    errorMessage,
    successMessage,
    autoResize = false,
    className,
    wrapperClassName,
    disabled = false,
    rows = 3,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) => {
  // Determine the actual state based on props
  const actualState = error ? 'error' : success ? 'success' : state;
  
  // Generate unique IDs for helper text
  const helperId = React.useId();
  const helperTextId = `${helperId}-helper`;
  const errorId = `${helperId}-error`;
  const successId = `${helperId}-success`;
  
  // Determine which message to show
  const message = errorMessage || successMessage || helperText;
  const messageId = error && errorMessage ? errorId : 
                   success && successMessage ? successId : 
                   helperText ? helperTextId : undefined;
  
  // Combine ARIA describedby
  const combinedAriaDescribedBy = [ariaDescribedBy, messageId].filter(Boolean).join(' ') || undefined;

  // Auto-resize functionality
  const handleAutoResize = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    props.onChange?.(event);
  };

  // Combine all textarea styles
  const textareaClasses = cn(
    // Base styles
    'w-full rounded-lg font-medium transition-all duration-200 resize-none',
    'focus:outline-none focus:ring-offset-2 focus:ring-offset-background',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'placeholder:text-text-muted',
    
    // Variant styles
    variantStyles[variant],
    
    // Size styles
    sizeStyles[size],
    
    // State styles
    stateStyles[actualState],
    
    // Auto-resize styles
    autoResize && 'overflow-hidden',
    
    // Custom className
    className
  );

  // Wrapper styles
  const wrapperClasses = cn(
    'relative',
    wrapperClassName
  );

  return (
    <div className={wrapperClasses}>
      <textarea
        ref={ref}
        className={textareaClasses}
        disabled={disabled}
        rows={rows}
        aria-describedby={combinedAriaDescribedBy}
        aria-invalid={error}
        onChange={handleAutoResize}
        {...props}
      />
      
      {/* Helper/Error/Success text */}
      {message && (
        <p
          id={messageId}
          className={cn(
            'mt-1.5 text-xs',
            error ? 'text-red-500' : success ? 'text-green-500' : 'text-text-muted'
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Types are already exported above