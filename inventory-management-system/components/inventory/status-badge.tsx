// components/inventory/status-badge.tsx

'use client';

import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'inStock' | 'lowStock' | 'outOfStock';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    inStock: {
      label: 'موجود',
      className: 'bg-green-100 text-green-700 border-green-200',
      icon: CheckCircle,
    },
    lowStock: {
      label: 'کم‌موجود',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: AlertTriangle,
    },
    outOfStock: {
      label: 'تمام‌شده',
      className: 'bg-red-100 text-red-700 border-red-200',
      icon: XCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}