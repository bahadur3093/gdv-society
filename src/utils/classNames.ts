import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with conditional logic
 * 
 * This function combines clsx for conditional class names with tailwind-merge
 * to handle Tailwind CSS class conflicts intelligently.
 * 
 * @param inputs - Class values (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 * 
 * @example
 * ```tsx
 * cn('px-2 py-1', isActive && 'bg-blue-500', {
 *   'text-white': isActive,
 *   'text-gray-500': !isActive
 * })
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Utility for creating variant-based class name functions
 * 
 * @param base - Base classes that are always applied
 * @param variants - Object mapping variant keys to their class strings
 * @returns Function that accepts variant and additional classes
 * 
 * @example
 * ```tsx
 * const buttonVariants = createVariants(
 *   'px-4 py-2 rounded font-medium',
 *   {
 *     primary: 'bg-blue-500 text-white',
 *     secondary: 'bg-gray-200 text-gray-900'
 *   }
 * );
 * 
 * const className = buttonVariants('primary', 'hover:bg-blue-600');
 * ```
 */
export function createVariants<T extends Record<string, string>>(
  base: string,
  variants: T
) {
  return function(
    variant: keyof T,
    ...additionalClasses: ClassValue[]
  ): string {
    return cn(base, variants[variant], ...additionalClasses);
  };
}

/**
 * Utility for conditional classes based on component state
 * 
 * @param condition - Boolean condition
 * @param trueClasses - Classes to apply when condition is true
 * @param falseClasses - Classes to apply when condition is false
 * @returns Appropriate class string
 * 
 * @example
 * ```tsx
 * const className = conditionalClasses(
 *   isLoading,
 *   'opacity-50 cursor-not-allowed',
 *   'opacity-100 cursor-pointer'
 * );
 * ```
 */
export function conditionalClasses(
  condition: boolean,
  trueClasses: ClassValue,
  falseClasses?: ClassValue
): string {
  return cn(condition ? trueClasses : falseClasses);
}