'use client';

import { ReactNode } from 'react';
import { XCircle } from 'lucide-react';
import { useEffect } from 'react';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export default function RequestDetailsModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '3xl',
}: RequestDetailsModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-slate-900 border border-slate-800 rounded-lg ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200`}
      >
        {/* Fixed Header */}
        <div className="p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 id="modal-title" className="text-2xl font-bold text-slate-100">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 transition-colors shrink-0"
              aria-label="Close modal"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Body with Modern Scroll Styles */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="p-6 border-t border-slate-800 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
