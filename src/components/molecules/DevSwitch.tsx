'use client';

import { UserRole } from '@/types';
import { RefreshCw } from 'lucide-react';

interface DevSwitchProps {
  currentRole: UserRole;
  onRoleSwitch: () => void;
}

export default function DevSwitch({ currentRole, onRoleSwitch }: DevSwitchProps) {
  return (
    <button
      onClick={onRoleSwitch}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out group"
      aria-label="Switch between admin and resident roles"
    >
      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
      <span className="text-sm font-medium">
        {currentRole === 'ADMIN' ? 'Switch to Resident' : 'Switch to Admin'}
      </span>
    </button>
  );
}
