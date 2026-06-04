'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
}: ModalProps) {
  // Handle ESC key to close modal
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        onClose();
      }
    },
    [isOpen, closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`bg-slate-900 border border-slate-800 rounded-lg ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* Fixed Header */}
        {(title || showCloseButton) && (
          <div className="p-6 border-b border-slate-800 shrink-0">
            <div className="flex items-start justify-between">
              {title && (
                <div className="flex-1 pr-4">
                  <h2 id="modal-title" className="text-2xl font-bold text-slate-100">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
                  )}
                </div>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-100 transition-colors shrink-0 p-1 rounded-lg hover:bg-slate-800/50"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="ps-6 pe-4 overflow-y-auto flex-1 custom-scrollbar">
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
