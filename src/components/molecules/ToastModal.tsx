'use client';

import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import Modal from '@/components/molecules/Modal';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: ToastVariant;
}

interface ToastModalProps extends ToastState {
  onClose: () => void;
  /** Auto-dismiss after this many ms. Set to 0 to disable. Default: 4000 */
  autoDismissMs?: number;
}

const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; iconColor: string; iconBg: string; titleColor: string }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10 border border-green-500/20',
    titleColor: 'text-green-400',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/10 border border-red-500/20',
    titleColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border border-orange-500/20',
    titleColor: 'text-orange-400',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border border-blue-500/20',
    titleColor: 'text-blue-400',
  },
};

export default function ToastModal({
  isOpen,
  title,
  message,
  variant,
  onClose,
  autoDismissMs = 4000,
}: ToastModalProps) {
  // Auto-dismiss
  useEffect(() => {
    if (!isOpen || !autoDismissMs) return;
    const timer = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(timer);
  }, [isOpen, autoDismissMs, onClose]);

  if (!isOpen) return null;

  const { icon: Icon, iconColor, iconBg, titleColor } = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnBackdropClick
      closeOnEscape
    >
      <div className="py-6 flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div className={`inline-flex p-4 rounded-full ${iconBg}`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>

        {/* Title */}
        <h3 className={`text-xl font-bold ${titleColor}`}>{title}</h3>

        {/* Message */}
        {message && (
          <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
        )}

        {/* Dismiss button */}
        <button
          onClick={onClose}
          className="mt-2 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500"
        >
          Dismiss
        </button>
      </div>
    </Modal>
  );
}

/** Helper to build the initial closed state */
export function closedToast(): ToastState {
  return { isOpen: false, title: '', message: '', variant: 'info' };
}

/** Helper to open a toast */
export function openToast(
  title: string,
  message: string,
  variant: ToastVariant = 'info'
): ToastState {
  return { isOpen: true, title, message, variant };
}
