// components/invoice/DiscountModal.tsx

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { InvoiceItem, formatPrice, calcItemFinalPrice } from '@/lib/invoice-types';
import { formatToman } from '@/lib/utils';

interface DiscountModalProps {
  item: InvoiceItem;
  onClose: () => void;
  onApply: (discount: number, type: 'percent' | 'amount') => void;
}

export default function DiscountModal({ item, onClose, onApply }: DiscountModalProps) {
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>(
    item.discountType === 'percent' ? 'percent' : 'amount'
  );
  const [discountValue, setDiscountValue] = useState(item.discount || 0);

  const itemTotal = item.product.price * item.quantity;
  const finalPrice = calcItemFinalPrice({
    ...item,
    discount: discountValue,
    discountType: discountType,
  });

  const handleApply = () => {
    if (discountValue <= 0) {
      onApply(0, 'percent');
      return;
    }
    onApply(discountValue, discountType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl shadow-2xl p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#2C3E50' }}>
            تخفیف کالا
          </h2>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Product Info */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4">
          <p className="text-sm font-semibold" style={{ color: '#2C3E50' }}>
            {item.product.name}
          </p>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">تعداد: {item.quantity}</span>
            <span className="font-semibold" style={{ color: '#2C3E50' }}>
              {formatToman(itemTotal)}
            </span>
          </div>
        </div>

        {/* Discount Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>
            نوع تخفیف
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button
              onClick={() => setDiscountType('percent')}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                discountType === 'percent'
                  ? 'bg-[#2C3E50] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              درصدی (%)
            </button>
            <button
              onClick={() => setDiscountType('amount')}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                discountType === 'amount'
                  ? 'bg-[#2C3E50] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              مبلغی (تومان)
            </button>
          </div>
        </div>

        {/* Discount Value */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>
            مقدار تخفیف
          </label>
          <input
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(Number(e.target.value))}
            placeholder={discountType === 'percent' ? 'مثال: ۱۰' : 'مثال: ۵۰۰۰۰'}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            style={{
              color: '#2C3E50',
              backgroundColor: '#FFFFFF',
              direction: 'ltr'
            }}
          />
          <p className="text-xs text-gray-400 mt-1">
            {discountType === 'percent'
              ? 'درصد تخفیف از قیمت کل کالا'
              : 'مبلغ تخفیف به تومان'}
          </p>
        </div>

        {/* Result */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">قیمت قبل از تخفیف:</span>
            <span className="font-semibold" style={{ color: '#2C3E50' }}>
              {formatToman(itemTotal)}
            </span>
          </div>
          {discountValue > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">تخفیف:</span>
              <span className="font-semibold" style={{ color: '#E74C3C' }}>
                -{discountType === 'percent' ? `${discountValue}%` : formatToman(discountValue)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
            <span className="text-gray-700">قیمت نهایی:</span>
            <span style={{ color: '#27AE60' }}>{formatToman(finalPrice)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl font-bold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#2C3E50' }}
          >
            اعمال تخفیف
          </button>
        </div>
      </div>
    </div>
  );
}