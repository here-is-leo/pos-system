// components/inventory/add-stock-modal.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    barcode?: string;
    price: number;
  };
  currentStock: number;
  onSuccess: (quantity: number) => void;
}

export default function AddStockModal({
  isOpen,
  onClose,
  product,
  currentStock,
  onSuccess,
}: AddStockModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<'production' | 'adjustment'>('adjustment');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🔥 فوکوس روی input هنگام باز شدن مودال
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  // 🔥 تابع اعتبارسنجی و تنظیم مقدار
  const handleQuantityChange = (value: string) => {
    // حذف کاراکترهای غیرعددی
    const cleaned = value.replace(/[^0-9]/g, '');
    
    if (cleaned === '') {
      setQuantity(0);
      return;
    }

    const numValue = parseInt(cleaned, 10);
    
    if (isNaN(numValue) || numValue < 0) {
      setQuantity(0);
      return;
    }

    // محدودیت حداکثر ۱۰۰۰۰
    if (numValue > 10000) {
      setQuantity(10000);
      return;
    }

    setQuantity(numValue);
    setError(null);
  };

  const handleIncrement = () => {
    setQuantity((prev) => {
      const newValue = prev + 1;
      return newValue > 10000 ? 10000 : newValue;
    });
    setError(null);
  };

  const handleDecrement = () => {
    setQuantity((prev) => {
      const newValue = prev - 1;
      return newValue < 0 ? 0 : newValue;
    });
    setError(null);
  };

  // 🔥 تابع بررسی و ارسال
  const handleSubmit = () => {
    if (quantity <= 0) {
      setError('تعداد باید بیشتر از صفر باشد');
      inputRef.current?.focus();
      return;
    }
    if (quantity > 10000) {
      setError('تعداد وارد شده بسیار زیاد است (حداکثر ۱۰۰۰۰)');
      inputRef.current?.focus();
      return;
    }
    setError(null);
    onSuccess(quantity);
  };

  // 🔥 پردازش کلید Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1A2332]">افزودن به موجودی</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Product Info */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs text-gray-500">محصول</p>
            <p className="font-semibold text-gray-800 text-lg">{product.name}</p>
            <div className="flex gap-4 mt-1">
              <span className="text-sm text-gray-500">
                بارکد: {product.barcode || '---'}
              </span>
              <span className="text-sm text-gray-500">
                موجودی فعلی: {currentStock.toLocaleString('fa-IR')} عدد
              </span>
            </div>
          </div>

          {/* 🔥 Quantity Selector با قابلیت ورود کیبورد */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تعداد افزایش موجودی
            </label>
            
            <div className="flex items-center justify-center gap-3">
              {/* دکمه کاهش */}
              <button
                onClick={handleDecrement}
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95"
                type="button"
              >
                <Minus className="h-5 w-5 text-gray-600" />
              </button>

              {/* 🔥 فیلد ورود عدد با کیبورد */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quantity === 0 ? '' : quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-28 h-12 text-center text-2xl font-bold rounded-xl border-2 border-blue-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  style={{
                    color: '#1A2332',
                    backgroundColor: '#FFFFFF',
                    direction: 'ltr',
                  }}
                  placeholder="۰"
                  autoComplete="off"
                />
                {/* راهنمای کوچک برای کیبورد */}
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">
                  (عدد را تایپ کنید)
                </span>
              </div>

              {/* دکمه افزایش */}
              <button
                onClick={handleIncrement}
                className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors active:scale-95"
                type="button"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* 🔥 نمایش موجودی جدید */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                موجودی جدید:{' '}
                <span className="font-bold text-blue-600">
                  {(currentStock + (quantity || 0)).toLocaleString('fa-IR')}
                </span>
                {' '}عدد
              </p>
              {quantity === 0 && (
                <p className="text-xs text-red-400 mt-1">
                  لطفاً تعداد را وارد کنید
                </p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              دلیل افزایش موجودی
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="production"
                  checked={reason === 'production'}
                  onChange={() => setReason('production')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">تولید جدید</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value="adjustment"
                  checked={reason === 'adjustment'}
                  onChange={() => setReason('adjustment')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">ورود کالا به انبار / اصلاح موجودی</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: quantity > 0 ? '#2563EB' : '#94A3B8' }}
            disabled={quantity <= 0}
          >
            تأیید و افزودن
          </button>

          {/* 🔥 کلیدهای میانبر */}
          <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-3">
            <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd>
            {' '}برای تأیید
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}