// components/providers/ThemeProvider.tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (pref: ThemePreference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'gdv-theme';
const DEFAULT_PREFERENCE: ThemePreference = 'dark';

// ─────────────────────────────────────────────────────────────
//  External store: localStorage subscription
//  useSyncExternalStore handles the SSR/hydration safely.
// ─────────────────────────────────────────────────────────────

function subscribeToStorage(callback: () => void): () => void {
  // Listen for changes from OTHER tabs
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage blocked
  }
  return DEFAULT_PREFERENCE;
}

// Server snapshot — what to use during SSR (no localStorage available)
function getServerSnapshot(): ThemePreference {
  return DEFAULT_PREFERENCE;
}

// ─────────────────────────────────────────────────────────────
//  External store: system preference media query
// ─────────────────────────────────────────────────────────────

function subscribeToSystemTheme(callback: () => void): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getServerSystemTheme(): ResolvedTheme {
  return 'dark';
}

// ─────────────────────────────────────────────────────────────
//  DOM application
// ─────────────────────────────────────────────────────────────

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved;
}

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Subscribe to localStorage as an external store
  const preference = useSyncExternalStore(
    subscribeToStorage,
    getStoredPreference,
    getServerSnapshot
  );

  // Subscribe to system theme preference as an external store
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    getServerSystemTheme
  );

  // Resolve the actual theme to apply
  const resolved: ResolvedTheme =
    preference === 'system' ? systemTheme : preference;

  // Sync DOM whenever resolved theme changes
  // This effect is fine — it's syncing React state TO an external system (DOM)
  // which is exactly what effects are for
  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  // Setter — writes to localStorage which triggers the store subscriber
  const setPreference = useCallback((pref: ThemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, pref);
      // Dispatch storage event manually so SAME-tab updates trigger
      // (the 'storage' event only fires for OTHER tabs by default)
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: pref,
      }));
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setPreference]);

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
//  Hooks
// ─────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() must be used inside <ThemeProvider>');
  }
  return ctx;
}

export function useIsDark(): boolean {
  return useTheme().resolved === 'dark';
}

export function useIsLight(): boolean {
  return useTheme().resolved === 'light';
}