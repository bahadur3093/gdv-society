"use client";

import React from 'react';
import { Provider } from 'react-redux';
import { store } from './index';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Redux Store Provider Component
 * Wraps the application with Redux Provider to enable state management
 */
export default function StoreProvider({ children }: StoreProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
