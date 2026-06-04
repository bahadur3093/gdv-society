'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'jsoneditor/dist/jsoneditor.css';

interface JSONEditorComponentProps {
  value: Record<string, unknown>;
  onChange: (json: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
}

// Dynamically import JSONEditor to avoid SSR issues
const JSONEditorComponent = dynamic<JSONEditorComponentProps>(
  () => import('../molecules/JSONEditorWrapper').then(mod => mod.default),
  { ssr: false }
);

interface ValidationError {
  field: string;
  message: string;
}

export default function ConfigManagement() {
  const [configKey, setConfigKey] = useState('');
  const [configValue, setConfigValue] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isJsonValid, setIsJsonValid] = useState(true);
  const [jsonError, setJsonError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingConfigs, setExistingConfigs] = useState<string[]>([]);

  // Fetch existing config keys on mount
  useEffect(() => {
    const fetchExistingConfigs = async () => {
      try {
        const response = await fetch('/api/config/list');
        if (response.ok) {
          const data = await response.json();
          setExistingConfigs(data.configs || []);
        }
      } catch (error) {
        console.error('Failed to fetch existing configs:', error);
      }
    };
    
    fetchExistingConfigs();
  }, []); // Empty dependency array - only run on mount

  const loadConfig = async (key: string) => {
    if (!key) return;
    
    setIsLoading(true);
    setValidationErrors([]);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch(`/api/config?key=${encodeURIComponent(key)}`);
      
      if (response.ok) {
        const {data} = await response.json();
        setConfigValue(data.config_value as Record<string, unknown>);
        setIsJsonValid(true);
        setJsonError('');
      } else if (response.status === 404) {
        // Config doesn't exist, start with empty object
        setConfigValue({});
      } else {
        const errorData = await response.json();
        setValidationErrors([{
          field: 'general',
          message: errorData.error || 'Failed to load configuration'
        }]);
      }
    } catch (error) {
      setValidationErrors([{
        field: 'general',
        message: 'Network error: Unable to load configuration'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    // Validate config key
    if (!configKey.trim()) {
      errors.push({
        field: 'configKey',
        message: 'Configuration name is required. Please enter a name for this configuration.'
      });
    } else if (configKey.length > 100) {
      errors.push({
        field: 'configKey',
        message: 'Configuration name is too long. Please use 100 characters or less.'
      });
    } else if (!/^[a-zA-Z0-9_-]+$/.test(configKey)) {
      errors.push({
        field: 'configKey',
        message: 'Configuration name can only contain letters, numbers, hyphens, and underscores.'
      });
    }

    // Validate JSON
    if (!isJsonValid) {
      errors.push({
        field: 'configValue',
        message: jsonError || 'The JSON data contains errors. Please fix the syntax errors before submitting.'
      });
    }

    // Check if JSON is empty
    if (isJsonValid && (!configValue || Object.keys(configValue).length === 0)) {
      errors.push({
        field: 'configValue',
        message: 'Configuration data cannot be empty. Please add some JSON content.'
      });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous status
    setSubmitStatus('idle');
    setSubmitMessage('');

    // Validate form
    if (!validateForm()) {
      setSubmitStatus('error');
      setSubmitMessage('Please fix the errors below before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configKey,
          configValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Configuration saved successfully!');
        // Refresh the list of existing configs
        const refreshConfigs = async () => {
          try {
            const response = await fetch('/api/config/list');
            if (response.ok) {
              const data = await response.json();
              setExistingConfigs(data.configs || []);
            }
          } catch (error) {
            console.error('Failed to fetch existing configs:', error);
          }
        };
        refreshConfigs();
        // Clear form after 2 seconds
        setTimeout(() => {
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Failed to save configuration. Please try again.');
        
        // If there are field-specific errors, add them to validation errors
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors: ValidationError[] = data.details.map((detail: { path?: string[]; message: string }) => ({
            field: detail.path?.[0] || 'general',
            message: detail.message
          }));
          setValidationErrors(fieldErrors);
        }
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Network error: Unable to connect to the server. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJsonChange = (json: Record<string, unknown>) => {
    setConfigValue(json);
    // Clear JSON errors when valid JSON is entered
    setIsJsonValid(true);
    setJsonError('');
    // Clear validation errors when user makes changes
    setValidationErrors(prev => prev.filter(err => err.field !== 'configValue'));
  };

  const handleJsonError = useCallback((error: Error) => {
    // Use setTimeout to defer state updates and prevent cascading renders
    setTimeout(() => {
      console.log(error);
      setIsJsonValid(false);
      setJsonError(error.message || 'Invalid JSON format');
    }, 0);
  }, []);

  const getErrorsForField = (field: string): string[] => {
    return validationErrors
      .filter(err => err.field === field)
      .map(err => err.message);
  };

  const hasFieldError = (field: string): boolean => {
    return getErrorsForField(field).length > 0;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Configuration Management</h1>
        <p className="text-slate-400">Add or update application configurations using JSON format</p>
      </div>

      {/* Admin Warning */}
      <div className="mb-6 p-4 bg-amber-600/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-500">Admin Only Access</p>
          <p className="text-xs text-slate-400 mt-1">
            This page is restricted to administrators. Changes made here will affect the entire application.
          </p>
        </div>
      </div>

      {/* Existing Configs */}
      {existingConfigs.length > 0 && (
        <div className="mb-6 p-4 bg-slate-800/30 border border-slate-700/40 rounded-lg">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Existing Configurations</h3>
          <div className="flex flex-wrap gap-2">
            {existingConfigs.map((key) => (
              <button
                key={key}
                onClick={() => {
                  setConfigKey(key);
                  loadConfig(key);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-md hover:bg-indigo-600/30 transition-colors"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global Status Messages */}
        {submitStatus === 'success' && (
          <div className="p-4 bg-green-600/10 border border-green-500/30 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-500">Success!</p>
              <p className="text-xs text-slate-400 mt-1">{submitMessage}</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && submitMessage && (
          <div className="p-4 bg-red-600/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-500">Error</p>
              <p className="text-xs text-slate-400 mt-1">{submitMessage}</p>
            </div>
          </div>
        )}

        {/* General Errors */}
        {getErrorsForField('general').length > 0 && (
          <div className="p-4 bg-red-600/10 border border-red-500/30 rounded-lg">
            {getErrorsForField('general').map((error, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ))}
          </div>
        )}

        {/* Config Key Input */}
        <div>
          <label htmlFor="configKey" className="block text-sm font-medium text-slate-300 mb-2">
            Configuration Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="configKey"
            value={configKey}
            onChange={(e) => {
              setConfigKey(e.target.value);
              setValidationErrors(prev => prev.filter(err => err.field !== 'configKey'));
            }}
            onBlur={() => {
              if (configKey && existingConfigs.includes(configKey)) {
                loadConfig(configKey);
              }
            }}
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              hasFieldError('configKey')
                ? 'border-red-500/50 focus:ring-red-500/50'
                : 'border-slate-700/40 focus:ring-indigo-500/50'
            }`}
            placeholder="e.g., request_types, feature_flags, app_settings"
            disabled={isSubmitting || isLoading}
          />
          <p className="text-xs text-slate-500 mt-1.5">
            Use lowercase letters, numbers, hyphens, or underscores only (max 100 characters)
          </p>
          {getErrorsForField('configKey').map((error, idx) => (
            <p key={idx} className="text-sm text-red-400 mt-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </p>
          ))}
        </div>

        {/* JSON Editor */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Configuration Data (JSON) <span className="text-red-500">*</span>
          </label>
          
          {isLoading ? (
            <div className="w-full h-96 bg-slate-800/50 border border-slate-700/40 rounded-lg flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className={`border rounded-lg overflow-hidden ${
              hasFieldError('configValue')
                ? 'border-red-500/50'
                : 'border-slate-700/40'
            }`}>
              <JSONEditorComponent
                value={configValue}
                onChange={handleJsonChange}
                onError={handleJsonError}
              />
            </div>
          )}
          
          <p className="text-xs text-slate-500 mt-1.5">
            Enter valid JSON data. The editor will highlight any syntax errors.
          </p>
          {getErrorsForField('configValue').map((error, idx) => (
            <p key={idx} className="text-sm text-red-400 mt-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </p>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Configuration
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setConfigKey('');
              setConfigValue({});
              setValidationErrors([]);
              setSubmitStatus('idle');
              setSubmitMessage('');
              setIsJsonValid(true);
              setJsonError('');
            }}
            disabled={isSubmitting || isLoading}
            className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-lg font-medium hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Clear Form
          </button>
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-8 p-6 bg-slate-800/20 border border-slate-700/30 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">How to Use</h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">1.</span>
            <span>Enter a unique configuration name (e.g., "request_types" or "feature_flags")</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">2.</span>
            <span>Add your JSON data in the editor. The editor will validate the syntax automatically.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">3.</span>
            <span>Click "Save Configuration" to store the data. All errors must be fixed before submission.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 font-bold">4.</span>
            <span>To edit an existing configuration, click on its name in the "Existing Configurations" section above.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}