// components/inventory/inventory-card.tsx

'use client';

import { Package, Plus } from 'lucide-react';
import StatusBadge from './status-badge';
import { formatToman, formatDate } from '@/lib/utils';
import { InventoryItem } from '@/lib/inventory';

interface InventoryCardProps {
  item: InventoryItem;
  onAddStock: () => void;
}

export default function InventoryCard({ item, onAddStock }: InventoryCardProps) {
  const { product, quantity, lastUpdated } = item;
  const status = quantity > 10 ? 'inStock' : quantity > 0 ? 'lowStock' : 'outOfStock';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1A2332]">{product.name}</h3>
            <p className="text-xs text-gray-400">{product.barcode || 'بدون بارکد'}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">موجودی:</span>
          <span className="font-semibold text-[#1A2332]">
            {quantity.toLocaleString('fa-IR')} عدد
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">قیمت:</span>
          <span className="font-medium text-blue-600">{formatToman(product.price)}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">آخرین بروزرسانی:</span>
          <span className="text-gray-600">{formatDate(lastUpdated)}</span>
        </div>
      </div>

      <button
        onClick={onAddStock}
        className="w-full mt-3 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <Plus className="h-4 w-4" />
        افزودن موجودی
      </button>
    </div>
  );
}