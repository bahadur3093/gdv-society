'use client';

import { useEffect, useRef } from 'react';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';

interface JSONEditorWrapperProps {
  value: Record<string, unknown>;
  onChange: (json: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
}

export default function JSONEditorWrapper({ value, onChange, onError }: JSONEditorWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JSONEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const options: JSONEditorOptions = {
      mode: 'tree',
      modes: ['tree', 'code', 'form', 'text', 'view'],
      search: true,
      history: true,
      navigationBar: true,
      statusBar: true,
      onChange: () => {
        try {
          if (editorRef.current) {
            const json = editorRef.current.get();
            onChange(json);
            // Don't call onError to clear - let the parent component handle clearing
          }
        } catch (err) {
          // JSON is invalid, notify parent
          if (onError && err instanceof Error) {
            onError(err);
          }
        }
      },
      onValidationError: (errors) => {
        if (errors && errors.length > 0 && onError) {
          const errorMessages = errors.map(err => err.message).join(', ');
          onError(new Error(`JSON validation failed: ${errorMessages}`));
        }
      },
      onError: (error) => {
        if (onError) {
          onError(error);
        }
      },
    };

    // Create the editor
    editorRef.current = new JSONEditor(containerRef.current, options);

    // Set initial value
    if (value !== undefined) {
      editorRef.current.set(value);
    }

    // Cleanup
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - onChange and onError are callbacks that shouldn't trigger re-initialization

  // Update editor when value changes externally
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      try {
        const currentValue = editorRef.current.get();
        // Only update if the value is different to avoid infinite loops
        if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
          editorRef.current.set(value);
        }
      } catch (error) {
        // If getting current value fails, just set the new value
        editorRef.current.set(value);
      }
    }
  }, [value]);

  return (
    <div 
      ref={containerRef} 
      className="jsoneditor-wrapper"
      style={{ height: '400px' }}
    />
  );
}