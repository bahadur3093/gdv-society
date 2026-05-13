import React, { forwardRef } from 'react';
import { cn } from '@/utils/classNames';

// Icon size types
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconColor = 'current' | 'primary' | 'secondary' | 'accent' | 'muted' | 'white' | 'success' | 'warning' | 'error';

// Icon component props interface
export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'size' | 'color'> {
  /** Icon name from the icon registry */
  name: string;
  /** Icon size */
  size?: IconSize;
  /** Icon color */
  color?: IconColor;
  /** Custom className for additional styling */
  className?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** Whether the icon is decorative (hidden from screen readers) */
  decorative?: boolean;
}

// Icon registry interface
export interface IconDefinition {
  /** SVG path or content */
  path: string | React.ReactNode;
  /** ViewBox for the SVG */
  viewBox?: string;
  /** Default size if different from standard */
  defaultSize?: IconSize;
  /** Whether this icon has fill or stroke styling */
  type?: 'fill' | 'stroke';
}

// Size styles mapping
const sizeStyles: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10'
};

// Color styles mapping
const colorStyles: Record<IconColor, string> = {
  current: 'text-current',
  primary: 'text-brand-primary',
  secondary: 'text-brand-secondary',
  accent: 'text-brand-accent',
  muted: 'text-text-muted',
  white: 'text-white',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500'
};

// Default icon registry with common icons
const defaultIconRegistry: Record<string, IconDefinition> = {
  // Navigation icons
  'arrow-left': {
    path: 'M15.75 19.5L8.25 12l7.5-7.5',
    type: 'stroke'
  },
  'arrow-right': {
    path: 'M8.25 4.5l7.5 7.5-7.5 7.5',
    type: 'stroke'
  },
  'arrow-up': {
    path: 'M4.5 15.75l7.5-7.5 7.5 7.5',
    type: 'stroke'
  },
  'arrow-down': {
    path: 'M19.5 8.25l-7.5 7.5-7.5-7.5',
    type: 'stroke'
  },
  'chevron-left': {
    path: 'M15.75 19.5L8.25 12l7.5-7.5',
    type: 'stroke'
  },
  'chevron-right': {
    path: 'M8.25 4.5l7.5 7.5-7.5 7.5',
    type: 'stroke'
  },
  'chevron-up': {
    path: 'M4.5 15.75l7.5-7.5 7.5 7.5',
    type: 'stroke'
  },
  'chevron-down': {
    path: 'M19.5 8.25l-7.5 7.5-7.5-7.5',
    type: 'stroke'
  },
  
  // Action icons
  'plus': {
    path: 'M12 4.5v15m7.5-7.5h-15',
    type: 'stroke'
  },
  'minus': {
    path: 'M19.5 12h-15',
    type: 'stroke'
  },
  'x': {
    path: 'M6 18L18 6M6 6l12 12',
    type: 'stroke'
  },
  'check': {
    path: 'M4.5 12.75l6 6 9-13.5',
    type: 'stroke'
  },
  'edit': {
    path: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
    type: 'stroke'
  },
  'trash': {
    path: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
    type: 'stroke'
  },
  'copy': {
    path: 'M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75',
    type: 'stroke'
  },
  
  // Interface icons
  'search': {
    path: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
    type: 'stroke'
  },
  'filter': {
    path: 'M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z',
    type: 'stroke'
  },
  'sort': {
    path: 'M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5',
    type: 'stroke'
  },
  'menu': {
    path: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
    type: 'stroke'
  },
  'dots-vertical': {
    path: 'M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z',
    type: 'fill'
  },
  'dots-horizontal': {
    path: 'M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
    type: 'fill'
  },
  
  // Status icons
  'info': {
    path: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
    type: 'stroke'
  },
  'warning': {
    path: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    type: 'stroke'
  },
  'error': {
    path: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    type: 'stroke'
  },
  'success': {
    path: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    type: 'stroke'
  },
  
  // Common UI icons
  'home': {
    path: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
    type: 'stroke'
  },
  'user': {
    path: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    type: 'stroke'
  },
  'settings': {
    path: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    type: 'stroke'
  },
  'heart': {
    path: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
    type: 'stroke'
  },
  'star': {
    path: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    type: 'fill'
  }
};

// Icon registry for managing custom icons
class IconRegistry {
  private static instance: IconRegistry;
  private registry: Record<string, IconDefinition> = { ...defaultIconRegistry };

  static getInstance(): IconRegistry {
    if (!IconRegistry.instance) {
      IconRegistry.instance = new IconRegistry();
    }
    return IconRegistry.instance;
  }

  register(name: string, definition: IconDefinition): void {
    this.registry[name] = definition;
  }

  registerBatch(icons: Record<string, IconDefinition>): void {
    Object.entries(icons).forEach(([name, definition]) => {
      this.register(name, definition);
    });
  }

  get(name: string): IconDefinition | undefined {
    return this.registry[name];
  }

  has(name: string): boolean {
    return name in this.registry;
  }

  list(): string[] {
    return Object.keys(this.registry);
  }

  remove(name: string): boolean {
    if (this.has(name)) {
      delete this.registry[name];
      return true;
    }
    return false;
  }
}

// Get the singleton instance
const iconRegistry = IconRegistry.getInstance();

/**
 * Icon component - A flexible SVG icon system with registry support
 * 
 * Features:
 * - Comprehensive icon registry with common icons
 * - Multiple sizes (xs, sm, md, lg, xl, 2xl)
 * - Color variants aligned with design tokens
 * - Accessibility support with proper ARIA attributes
 * - Support for both fill and stroke icon types
 * - Extensible registry for custom icons
 * - TypeScript support with icon name validation
 * 
 * @example
 * ```tsx
 * <Icon name="search" size="md" color="primary" />
 * 
 * <Icon name="user" size="lg" aria-label="User profile" />
 * 
 * <Icon name="heart" color="error" decorative />
 * ```
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>((
  {
    name,
    size = 'md',
    color = 'current',
    className,
    'aria-label': ariaLabel,
    decorative = false,
    ...props
  },
  ref
) => {
  const iconDefinition = iconRegistry.get(name);

  if (!iconDefinition) {
    // Development warning for missing icons
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Icon "${name}" not found in registry. Available icons: ${iconRegistry.list().join(', ')}`);
    }
    
    // Return a placeholder icon for missing icons
    return (
      <svg
        ref={ref}
        className={cn(
          sizeStyles[size],
          colorStyles[color],
          className
        )}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label={ariaLabel || (decorative ? undefined : `Missing icon: ${name}`)}
        aria-hidden={decorative}
        role={decorative ? 'presentation' : 'img'}
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  const { path, viewBox = '0 0 24 24', type = 'stroke' } = iconDefinition;
  
  // Combine all styles
  const iconClasses = cn(
    sizeStyles[size],
    colorStyles[color],
    className
  );

  return (
    <svg
      ref={ref}
      className={iconClasses}
      viewBox={viewBox}
      fill={type === 'fill' ? 'currentColor' : 'none'}
      stroke={type === 'stroke' ? 'currentColor' : 'none'}
      strokeWidth={type === 'stroke' ? '1.5' : undefined}
      strokeLinecap={type === 'stroke' ? 'round' : undefined}
      strokeLinejoin={type === 'stroke' ? 'round' : undefined}
      aria-label={ariaLabel || (decorative ? undefined : name)}
      aria-hidden={decorative}
      role={decorative ? 'presentation' : 'img'}
      {...props}
    >
      {typeof path === 'string' ? (
        <path d={path} />
      ) : (
        path
      )}
    </svg>
  );
});

Icon.displayName = 'Icon';

// Export the registry for external use
export { iconRegistry };

// Types are already exported above

// Utility functions for icon management
export const registerIcon = (name: string, definition: IconDefinition) => {
  iconRegistry.register(name, definition);
};

export const registerIcons = (icons: Record<string, IconDefinition>) => {
  iconRegistry.registerBatch(icons);
};

export const getAvailableIcons = () => {
  return iconRegistry.list();
};

export const hasIcon = (name: string) => {
  return iconRegistry.has(name);
};