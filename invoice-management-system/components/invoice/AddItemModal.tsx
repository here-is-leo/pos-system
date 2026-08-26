// components/invoice/AddItemModal.tsx

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, Search, Plus, Minus, Package, Box, AlertCircle, 
  CheckCircle2, XCircle, ShoppingBag, Filter, 
  ChevronDown, Grid3x3, List, Zap, TrendingUp 
} from 'lucide-react';
import { Product, isCartonProduct, getProductFinalPrice, getProductDisplayName, getUnitTypeLabel } from '@/lib/invoice-types';
import { formatToman } from '@/lib/utils';
import { getCurrentUser } from '@/services/api';

interface AddItemModalProps {
  onClose: () => void;
  onAdd: (product: Product, quantity: number, cartonCount: number) => void;
  products: Product[];
}

export default function AddItemModal({ onClose, onAdd, products }: AddItemModalProps) {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'unavailable'>('all');
  const searchRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const user = getCurrentUser();
  const isSalesAdminUser = user?.role === 'sales_admin';

  // ============================================
  // 🔥 توابع محاسباتی
  // ============================================

  const getStatusBadge = (stock: number) => {
    if (stock > 10) return { label: 'موجود', color: '#10B981', bg: '#D1FAE5' };
    if (stock > 0) return { label: 'کم‌موجود', color: '#F59E0B', bg: '#FEF3C7' };
    return { label: 'ناموجود', color: '#EF4444', bg: '#FEE2E2' };
  };

  // ============================================
  // 🔥 لیست محصولات با فیلتر
  // ============================================

  const filtered = useMemo(() => {
    let result = products.filter(p =>
      p.name.includes(search) || 
      (p.productCode && p.productCode.includes(search)) || 
      search.length === 0
    );

    // فیلتر بر اساس موجودی
    if (filterStatus === 'available') {
      result = result.filter(p => p.stock > 0);
    } else if (filterStatus === 'unavailable') {
      result = result.filter(p => p.stock === 0);
    }

    // مرتب‌سازی: اول موجود، سپس ناموجود
    result = result.sort((a, b) => {
      if ((a.stock > 0 && b.stock > 0) || (a.stock === 0 && b.stock === 0)) {
        return a.name.localeCompare(b.name);
      }
      if (a.stock > 0) return -1;
      if (b.stock > 0) return 1;
      return 0;
    });

    return result;
  }, [products, search, filterStatus]);

  // ============================================
  // 🔥 هندلرها
  // ============================================

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [search, filterStatus]);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearch(product.name);
    setQuantity(1);
  };

  const handleAdd = () => {
    if (!selectedProduct) return;
    const isCarton = isCartonProduct(selectedProduct);
    const qty = quantity;
    const cartonCount = isCarton ? quantity : 0;
    onAdd(selectedProduct, qty, cartonCount);
    onClose();
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    const max = selectedProduct?.stock || 999999;
    setQuantity(Math.min(Math.max(1, val), max));
  };

  const handleQuickAdd = (product: Product) => {
    const isCarton = isCartonProduct(product);
    onAdd(product, 1, isCarton ? 1 : 0);
    onClose();
  };

  const isStockAvailable = selectedProduct ? selectedProduct.stock > 0 : false;
  const canAddToCart = selectedProduct && quantity > 0 && isStockAvailable;
  const showQuantitySelector = selectedProduct && isStockAvailable;

  const availableCount = filtered.filter(p => p.stock > 0).length;
  const selectedProductFinalPrice = selectedProduct ? getProductFinalPrice(selectedProduct) : 0;
  const isCarton = selectedProduct ? isCartonProduct(selectedProduct) : false;
  const totalPrice = selectedProduct ? selectedProductFinalPrice * quantity : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ====== Header ====== */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShoppingBag size={18} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">افزودن کالا</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 flex-1 overflow-hidden flex flex-col">
          {/* ====== Search & Filters ====== */}
          <div className="flex-shrink-0 space-y-3">
            {/* نوار جستجو */}
            <div className="relative">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="جستجوی نام، کد کالا یا بارکد..."
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                style={{ color: '#2C3E50' }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* فیلترها */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filterStatus === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  همه
                </button>
                <button
                  onClick={() => setFilterStatus('available')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    filterStatus === 'available' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle2 size={12} />
                  موجود
                </button>
                <button
                  onClick={() => setFilterStatus('unavailable')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    filterStatus === 'unavailable' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <XCircle size={12} />
                  ناموجود
                </button>
              </div>
              
              <span className="text-xs text-gray-400">
                {filtered.length} محصول
                {availableCount > 0 && (
                  <span className="text-green-600 mr-1">({availableCount} موجود)</span>
                )}
              </span>
            </div>
          </div>

          {/* ====== لیست محصولات ====== */}
          <div 
            ref={listRef}
            className="mt-3 flex-1 overflow-y-auto -mx-1 px-1"
            style={{ maxHeight: 'calc(90vh - 320px)' }}
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Package size={40} className="mb-2 text-gray-300" />
                <p className="text-sm">محصولی یافت نشد</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filtered.map(product => {
                  const isAvailable = product.stock > 0;
                  const status = getStatusBadge(product.stock);
                  const finalPrice = getProductFinalPrice(product);
                  const isSelected = selectedProduct?.id === product.id;
                  const isCarton = isCartonProduct(product);
                  const unitLabel = getUnitTypeLabel(product.unitType);

                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-right ${
                        isSelected 
                          ? 'bg-blue-50 border-2 border-blue-400 shadow-sm' 
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      } ${!isAvailable ? 'opacity-60' : ''}`}
                      disabled={!isAvailable}
                    >
                      {/* آیکون محصول */}
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 relative">
                        <Package size={18} className="text-gray-600" />
                        {isCarton && (
                          <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-yellow-100 text-yellow-700 px-1 rounded">
                            {unitLabel}
                          </span>
                        )}
                      </div>

                      {/* اطلاعات محصول */}
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-sm font-semibold truncate text-gray-800">
                          {product.name}
                        </p>
                        {product.productCode && (
                          <span className="text-[10px] text-gray-400 font-mono">کد: {product.productCode}</span>
                        )}
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span 
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: status.bg, color: status.color }}
                          >
                            {isAvailable ? '' : ''} {status.label}
                          </span>
                          {isCarton && product.cartonSize && (
                            <span className="text-[10px] text-gray-400">📦 {product.cartonSize} عدد/کارتن</span>
                          )}
                          <span className="text-xs font-semibold text-blue-600">
                            {formatToman(finalPrice)}
                          </span>
                        </div>
                      </div>

                      {/* دکمه افزودن سریع */}
                      {isAvailable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAdd(product);
                          }}
                          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0 active:scale-95"
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ====== بخش انتخاب محصول ====== */}
          {selectedProduct && (
            <div className="flex-shrink-0 mt-3 pt-3 border-t border-gray-100 animate-in slide-in-from-bottom-2">
              {/* محصول انتخاب شده */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-200 flex items-center justify-center flex-shrink-0 relative">
                    <Package size={20} className="text-blue-700" />
                    {isCarton && (
                      <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-yellow-200 text-yellow-800 px-1 rounded">
                        {getUnitTypeLabel(selectedProduct.unitType)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate text-gray-800">
                      {getProductDisplayName(selectedProduct)}
                    </p>
                    {selectedProduct.productCode && (
                      <span className="text-[10px] text-gray-500 font-mono">کد: {selectedProduct.productCode}</span>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-blue-600">
                        {formatToman(selectedProductFinalPrice)}
                      </span>
                      {isCarton && selectedProduct.cartonSize && (
                        <span className="text-[10px] text-gray-400">
                          (هر عدد: {formatToman(selectedProduct.price)})
                        </span>
                      )}
                      <span className="text-[10px] text-green-600"> موجود: {selectedProduct.stock}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* انتخاب تعداد */}
              {showQuantitySelector && (
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {isCarton ? 'تعداد کارتن' : 'تعداد'}
                    </label>
                    {isCarton && selectedProduct.cartonSize && (
                      <span className="text-[10px] text-gray-400">
                        هر کارتن {selectedProduct.cartonSize} عدد
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-1.5">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95"
                    >
                      <Minus size={18} className="text-gray-600" />
                    </button>

                    <div className="relative w-20">
                      <input
                        ref={quantityInputRef}
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-full h-10 text-center text-xl font-bold rounded-xl border-2 border-blue-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                        style={{ color: '#2C3E50' }}
                        min={1}
                        max={selectedProduct.stock}
                      />
                    </div>

                    <button
                      onClick={() => setQuantity(prev => Math.min(prev + 1, selectedProduct.stock))}
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors active:scale-95"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* 🔥 نمایش تعداد کل برای کارتن‌ها */}
                  {isCarton && selectedProduct.cartonSize && (
                    <p className="text-[10px] text-center text-gray-400 mt-1">
                      تعداد کل واحدها: {quantity * selectedProduct.cartonSize} عدد
                    </p>
                  )}

                  {/* جمع کل */}
                  <div className="mt-2 rounded-xl p-2.5 text-center bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200">
                    <p className="text-[10px] text-gray-500">جمع کل</p>
                    <p className="text-base font-bold text-blue-700">
                      {formatToman(totalPrice)}
                    </p>
                    {isCarton && selectedProduct.cartonSize && (
                      <p className="text-[10px] text-gray-400">
                        {quantity} کارتن × {formatToman(selectedProductFinalPrice)}
                      </p>
                    )}
                    {!isCarton && (
                      <p className="text-[10px] text-gray-400">
                        {quantity} عدد × {formatToman(selectedProduct.price)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* دکمه افزودن */}
              <button
                onClick={handleAdd}
                disabled={!canAddToCart}
                className="w-full mt-3 py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: canAddToCart 
                    ? 'linear-gradient(135deg, #2C3E50, #1a2634)' 
                    : '#CBD5E1'
                }}
              >
                {!isStockAvailable && selectedProduct 
                  ? ' ناموجود' 
                  : ` افزودن به فاکتور (${formatToman(totalPrice)})`
                }
              </button>
            </div>
          )}
        </div>

        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}