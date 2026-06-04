'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  variant = 'info',
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const variantStyles = {
    success: {
      bg: 'bg-green-900/90 border-green-500/50',
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      text: 'text-green-100',
    },
    error: {
      bg: 'bg-red-900/90 border-red-500/50',
      icon: <XCircle className="w-5 h-5 text-red-400" />,
      text: 'text-red-100',
    },
    warning: {
      bg: 'bg-yellow-900/90 border-yellow-500/50',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      text: 'text-yellow-100',
    },
    info: {
      bg: 'bg-blue-900/90 border-blue-500/50',
      icon: <Info className="w-5 h-5 text-blue-400" />,
      text: 'text-blue-100',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-sm min-w-[300px] max-w-md ${style.bg}`}
      >
        <div className="flex-shrink-0">{style.icon}</div>
        <p className={`flex-1 text-sm font-medium ${style.text}`}>{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-white/70 hover:text-white" />
        </button>
      </div>
    </div>
  );
}