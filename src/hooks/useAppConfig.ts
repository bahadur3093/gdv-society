'use client';

import { useState, useEffect } from 'react';
import type { AppConfigItem } from '@/types';

interface UseAppConfigResult {
  config: AppConfigItem[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch app configuration from the API
 * @param configKey - The configuration key to fetch
 * @returns Configuration data, loading state, error, and refetch function
 */
export function useAppConfig(configKey: string): UseAppConfigResult {
  const [config, setConfig] = useState<AppConfigItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/config?key=${encodeURIComponent(configKey)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch configuration');
      }

      if (data.success && data.data) {
        setConfig(data.data.config_value);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching configuration');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (configKey) {
      fetchConfig();
    }
  }, [configKey]);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
  };
}

/**
 * Update app configuration
 * @param configKey - The configuration key
 * @param configValue - The configuration value to save
 * @returns Promise with the updated configuration
 */
export async function updateAppConfig(
  configKey: string,
  configValue: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config_key: configKey,
        config_value: configValue,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update configuration',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'An error occurred while updating configuration',
    };
  }
}
