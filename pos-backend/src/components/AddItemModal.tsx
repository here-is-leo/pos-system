'use client'

import { useState, useRef, useEffect } from 'react';
import { X, Search, Plus, Minus, Package } from 'lucide-react';
import { Product, formatPrice, formatNumber } from '@/types/invoice';

interface AddItemModalProps {
  onClose: () => void;
  onAdd: (product: Product, quantity: number) => void;
  products: Product[];
}

export default function AddItemModal({ onClose, onAdd, products }: AddItemModalProps) {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = products.filter(p =>
    p.name.includes(search) && search.length > 0
  );

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearch(product.name);
    setShowDropdown(false);
    setQuantity(1);
  };

  const handleAdd = () => {
    if (!selectedProduct) return;
    onAdd(selectedProduct, quantity);
    onClose();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setShowDropdown(value.length > 0);
    if (selectedProduct && value !== selectedProduct.name) {
      setSelectedProduct(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div
        className="w-full rounded-t-3xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', maxWidth: 480 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #ECF0F1' }}>
          <h2 className="text-lg font-bold" style={{ color: '#2C3E50' }}>افزودن کالا</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#F8F9FA' }}
            aria-label="بستن"
          >
            <X size={18} style={{ color: '#7F8C8D' }} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <div
              className="flex items-center rounded-xl px-4 py-3 gap-3"
              style={{ backgroundColor: '#F8F9FA', border: '1.5px solid #ECF0F1' }}
            >
              <Search size={18} style={{ color: '#7F8C8D' }} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => search.length > 0 && setShowDropdown(true)}
                placeholder="جستجوی محصول..."
                className="flex-1 bg-transparent outline-none text-sm font-sans text-right"
                style={{ color: '#2C3E50', direction: 'rtl' }}
              />
            </div>

            {/* Dropdown */}
            {showDropdown && filtered.length > 0 && (
              <div
                className="absolute top-full right-0 left-0 rounded-xl shadow-lg z-10 overflow-hidden mt-1"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECF0F1' }}
              >
                {filtered.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center justify-between px-4 py-3 transition-colors text-right"
                    style={{ borderBottom: '1px solid #ECF0F1' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: '#2C3E50' }}>{product.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#7F8C8D' }}>
                        موجودی: {formatNumber(product.stock)} عدد
                      </p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: '#3498DB' }}>
                      {formatPrice(product.price)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Product Info */}
          {selectedProduct && (
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#F8F9FA', border: '1.5px solid #ECF0F1' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EBF5FB' }}
                >
                  <Package size={22} style={{ color: '#3498DB' }} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: '#2C3E50' }}>{selectedProduct.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs" style={{ color: '#7F8C8D' }}>
                      موجودی: {formatNumber(selectedProduct.stock)} عدد
                    </span>
                    <span className="text-xs font-semibold" style={{ color: '#3498DB' }}>
                      {formatPrice(selectedProduct.price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {selectedProduct && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-right" style={{ color: '#2C3E50' }}>
                تعداد
              </label>
              <div className="flex items-center justify-center gap-5">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm transition-colors"
                  style={{ backgroundColor: '#ECF0F1', color: '#2C3E50' }}
                  aria-label="کاهش تعداد"
                >
                  <Minus size={18} />
                </button>
                <span
                  className="text-2xl font-bold w-12 text-center"
                  style={{ color: '#2C3E50' }}
                >
                  {formatNumber(quantity)}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(selectedProduct.stock, q + 1))}
                  className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm transition-colors"
                  style={{ backgroundColor: '#3498DB', color: '#FFFFFF' }}
                  aria-label="افزایش تعداد"
                >
                  <Plus size={18} />
                </button>
              </div>

              {quantity >= selectedProduct.stock && (
                <p className="text-xs text-center mt-2" style={{ color: '#E74C3C' }}>
                  حداکثر موجودی انبار انتخاب شد
                </p>
              )}

              <div className="mt-3 rounded-xl p-3 text-center" style={{ backgroundColor: '#EBF5FB' }}>
                <p className="text-xs" style={{ color: '#7F8C8D' }}>جمع کل</p>
                <p className="text-base font-bold" style={{ color: '#2C3E50' }}>
                  {formatPrice(selectedProduct.price * quantity)}
                </p>
              </div>
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={handleAdd}
            disabled={!selectedProduct}
            className="w-full py-4 rounded-2xl font-bold text-base transition-opacity"
            style={{
              backgroundColor: selectedProduct ? '#2C3E50' : '#BDC3C7',
              color: '#FFFFFF',
              opacity: selectedProduct ? 1 : 0.7,
            }}
          >
            افزودن به فاکتور
          </button>
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
}