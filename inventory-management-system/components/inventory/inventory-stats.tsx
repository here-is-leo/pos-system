// components/inventory/inventory-stats.tsx

'use client';

import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface InventoryStatsProps {
  stats: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
}

export default function InventoryStats({ stats }: InventoryStatsProps) {
  const cards = [
    {
      label: 'کل محصولات',
      value: stats.total,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'موجود',
      value: stats.inStock,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
    },
    {
      label: 'کم‌موجود',
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
    },
    {
      label: 'تمام‌شده',
      value: stats.outOfStock,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`${card.bg} ${card.border} border rounded-2xl p-4 transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[#1A2332]">{card.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bg} border ${card.border}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}