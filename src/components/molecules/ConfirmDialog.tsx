'use client';

import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
}

const variantStyles = {
  danger: {
    icon: AlertCircle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/10',
    iconBorder: 'border-red-500/20',
    confirmBg: 'bg-red-600 hover:bg-red-500',
    confirmText: 'text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    iconBorder: 'border-orange-500/20',
    confirmBg: 'bg-orange-600 hover:bg-orange-500',
    confirmText: 'text-white',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    iconBorder: 'border-blue-500/20',
    confirmBg: 'bg-blue-600 hover:bg-blue-500',
    confirmText: 'text-white',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10',
    iconBorder: 'border-green-500/20',
    confirmBg: 'bg-green-600 hover:bg-green-500',
    confirmText: 'text-white',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800/40 rounded-lg shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-800/50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`inline-flex p-3 rounded-lg ${styles.iconBg} border ${styles.iconBorder} mb-4`}>
            <Icon className={`w-6 h-6 ${styles.iconColor}`} />
          </div>

          {/* Title */}
          <h3 id="dialog-title" className="text-xl font-bold text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <p id="dialog-description" className="text-slate-300 text-sm leading-relaxed mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 ${styles.confirmBg} ${styles.confirmText} rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-violet-500`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                confirmText
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}