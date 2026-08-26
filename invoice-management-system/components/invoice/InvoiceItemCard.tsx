// components/invoice/InvoiceItemCard.tsx

'use client';

import { Trash2, Percent, Package, Box, ShoppingBag, Wine, Droplet, Coffee, Monitor, Smartphone, Laptop, Headphones, Camera, Watch, Shirt, Book, Home, Utensils, Car, Gift, Star, Zap, Edit, Tag, X, ChevronDown, ChevronUp, Sparkles, Shield, Award, Layers, Grid, Maximize2, Minimize2 } from 'lucide-react';
import { 
  InvoiceItem, 
  formatNumber, 
  calcItemDiscountAmount, 
  calcItemFinalPrice, 
  calcOrderQuantity, 
  calcCartonCount,
  calcItemTotalPrice,
  getUnitPriceForDisplay,
  isCartonProduct,
  getUnitTypeLabel,
} from '@/lib/invoice-types';
import { formatToman, formatTomanNumber } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface InvoiceItemCardProps {
  item: InvoiceItem;
  onRemove: (id: string) => void;
  onDiscount: (id: string, discount: number, type: 'percent' | 'amount') => void;
  status?: 'draft' | 'final' | 'paid';
  userRole?: string;
}

// 🔥 تابع دریافت آیکون با آیکون‌های مناسب (بدون ایموجی)
const getProductIcon = (productName: string) => {
  const name = productName.toLowerCase();
  
  const icons: Record<string, { icon: any; gradient: string; glow: string; badge: string; color: string }> = {
    'لپ‌تاپ': { icon: Laptop, gradient: 'from-blue-500 via-blue-600 to-indigo-700', glow: 'shadow-blue-500/30', badge: 'الکترونیک', color: '#3B82F6' },
    'موبایل': { icon: Smartphone, gradient: 'from-indigo-500 via-indigo-600 to-purple-700', glow: 'shadow-indigo-500/30', badge: 'الکترونیک', color: '#6366F1' },
    'موس': { icon: Zap, gradient: 'from-yellow-400 via-amber-500 to-orange-600', glow: 'shadow-amber-500/30', badge: 'الکترونیک', color: '#F59E0B' },
    'کیبورد': { icon: Monitor, gradient: 'from-slate-500 via-slate-600 to-gray-700', glow: 'shadow-slate-500/30', badge: 'الکترونیک', color: '#64748B' },
    'مانیتور': { icon: Monitor, gradient: 'from-blue-600 via-blue-700 to-cyan-800', glow: 'shadow-blue-600/30', badge: 'الکترونیک', color: '#2563EB' },
    'هدفون': { icon: Headphones, gradient: 'from-purple-500 via-purple-600 to-pink-700', glow: 'shadow-purple-500/30', badge: 'صوتی', color: '#8B5CF6' },
    'دوربین': { icon: Camera, gradient: 'from-emerald-500 via-emerald-600 to-teal-700', glow: 'shadow-emerald-500/30', badge: 'تصویری', color: '#10B981' },
    'ساعت': { icon: Watch, gradient: 'from-amber-400 via-amber-500 to-yellow-600', glow: 'shadow-amber-400/30', badge: 'لوکس', color: '#FBBF24' },
    'قهوه': { icon: Coffee, gradient: 'from-amber-700 via-amber-800 to-stone-900', glow: 'shadow-amber-700/30', badge: 'نوشیدنی', color: '#92400E' },
    'آب': { icon: Droplet, gradient: 'from-cyan-400 via-cyan-500 to-blue-600', glow: 'shadow-cyan-400/30', badge: 'نوشیدنی', color: '#22D3EE' },
    'شراب': { icon: Wine, gradient: 'from-rose-500 via-rose-600 to-red-700', glow: 'shadow-rose-500/30', badge: 'نوشیدنی', color: '#F43F5E' },
    'غذا': { icon: Utensils, gradient: 'from-orange-400 via-orange-500 to-red-600', glow: 'shadow-orange-400/30', badge: 'غذایی', color: '#FB923C' },
    'لباس': { icon: Shirt, gradient: 'from-pink-500 via-pink-600 to-rose-700', glow: 'shadow-pink-500/30', badge: 'پوشاک', color: '#EC4899' },
    'خودرو': { icon: Car, gradient: 'from-gray-600 via-gray-700 to-slate-800', glow: 'shadow-gray-600/30', badge: 'خودرو', color: '#4B5563' },
    'کتاب': { icon: Book, gradient: 'from-amber-600 via-amber-700 to-stone-800', glow: 'shadow-amber-600/30', badge: 'فرهنگی', color: '#D97706' },
    'هدیه': { icon: Gift, gradient: 'from-pink-400 via-rose-500 to-red-600', glow: 'shadow-pink-400/30', badge: 'هدیه', color: '#F472B6' },
    'مایع دستشویی': { icon: Droplet, gradient: 'from-green-400 via-emerald-500 to-teal-600', glow: 'shadow-emerald-400/30', badge: 'بهداشتی', color: '#10B981' },
    'صابون': { icon: Droplet, gradient: 'from-blue-300 via-blue-400 to-cyan-500', glow: 'shadow-blue-300/30', badge: 'بهداشتی', color: '#0EA5E9' },
    'شامپو': { icon: Droplet, gradient: 'from-purple-400 via-purple-500 to-pink-600', glow: 'shadow-purple-400/30', badge: 'بهداشتی', color: '#8B5CF6' },
  };

  for (const [key, value] of Object.entries(icons)) {
    if (name.includes(key)) return value;
  }

  return { 
    icon: Package, 
    gradient: 'from-gray-400 via-gray-500 to-slate-600', 
    glow: 'shadow-gray-400/30',
    badge: 'محصول',
    color: '#64748B'
  };
};

// 🔥 تابع دریافت آیکون واحد
const getUnitInfo = (unitType?: string) => {
  const units = {
    carton: {
      color: '#E67E22',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      label: 'کارتن',
      icon: Layers,
      iconColor: '#E67E22',
      gradient: 'from-amber-400 to-orange-500',
      glow: 'shadow-amber-400/30',
      iconBg: 'bg-amber-100'
    },
    liter: {
      color: '#2E86C1',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      label: 'لیتر',
      icon: Droplet,
      iconColor: '#2E86C1',
      gradient: 'from-blue-400 to-cyan-500',
      glow: 'shadow-blue-400/30',
      iconBg: 'bg-blue-100'
    },
    piece: {
      color: '#27AE60',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      label: 'واحد',
      icon: Package,
      iconColor: '#27AE60',
      gradient: 'from-emerald-400 to-green-500',
      glow: 'shadow-emerald-400/30',
      iconBg: 'bg-emerald-100'
    }
  };
  return units[unitType as keyof typeof units] || units.piece;
};

// 🔥 کامپوننت دکمه تخفیف
const DiscountButton = ({ 
  hasDiscount, 
  discountValue, 
  discountType, 
  onClick 
}: { 
  hasDiscount: boolean; 
  discountValue: number; 
  discountType: string; 
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-500 hover:scale-105 active:scale-95 ${
        hasDiscount 
          ? 'bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-700 border border-amber-300/50 hover:shadow-lg hover:shadow-amber-500/20' 
          : 'bg-gradient-to-r from-gray-50 to-gray-100/80 text-gray-600 border border-gray-200/50 hover:shadow-lg hover:shadow-gray-400/20 hover:border-gray-300'
      }`}
    >
      <Percent size={14} className={`${hasDiscount ? 'text-amber-500' : 'text-gray-400'} group-hover:scale-110 transition-transform duration-300`} />
      <span>{hasDiscount ? 'تخفیف ویژه' : 'افزودن تخفیف'}</span>
      {hasDiscount && (
        <span className="flex items-center gap-1 bg-amber-100/80 px-2 py-0.5 rounded-full text-[9px] font-bold text-amber-700 border border-amber-200/50">
          <Sparkles size={8} className="text-amber-500" />
          {discountType === 'percent' ? `${discountValue}%` : formatToman(discountValue)}
        </span>
      )}
    </button>
  );
};

// 🔥 کامپوننت دکمه حذف
const RemoveButton = ({ onClick }: { onClick: () => void }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-500 hover:scale-105 active:scale-95 bg-gradient-to-r from-red-50 to-rose-50/80 text-red-600 border border-red-200/50 hover:shadow-lg hover:shadow-red-500/20 hover:border-red-300"
    >
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-red-400 to-rose-400 opacity-0 transition-opacity duration-500 ${isHovering ? 'opacity-10' : ''}`} />
      <Trash2 size={14} className={`transition-all duration-500 ${isHovering ? 'scale-110 rotate-6' : ''}`} />
      <span>حذف از فاکتور</span>
    </button>
  );
};

// 🔥 کامپوننت ورودی تخفیف
const DiscountInput = ({ 
  discountValue, 
  discountType, 
  onValueChange, 
  onTypeChange, 
  onApply, 
  onCancel 
}: { 
  discountValue: number; 
  discountType: 'percent' | 'amount'; 
  onValueChange: (value: number) => void; 
  onTypeChange: (type: 'percent' | 'amount') => void; 
  onApply: () => void; 
  onCancel: () => void;
}) => {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50/90 to-orange-50/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-amber-200/70 shadow-lg shadow-amber-500/10 animate-in slide-in-from-left-2 duration-300">
      <input
        type="number"
        value={discountValue}
        onChange={(e) => onValueChange(Number(e.target.value))}
        placeholder="مقدار"
        className="w-20 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-white/90"
        dir="ltr"
        autoFocus
      />
      
      <select
        value={discountType}
        onChange={(e) => onTypeChange(e.target.value as 'percent' | 'amount')}
        className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-white/90 appearance-none cursor-pointer"
      >
        <option value="percent">% درصد</option>
        <option value="amount">💰 تومان</option>
      </select>
      
      <button
        onClick={onApply}
        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300 active:scale-95"
      >
        اعمال
      </button>
      
      <button
        onClick={onCancel}
        className="p-1.5 rounded-lg hover:bg-amber-200/50 transition-all duration-300 group"
      >
        <X size={14} className="text-amber-600 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default function InvoiceItemCard({
  item,
  onRemove,
  onDiscount,
  status = 'draft',
  userRole = 'sales',
}: InvoiceItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountValue, setDiscountValue] = useState(item.discount || 0);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>(
    item.discountType === 'percent' || item.discountType === 'percentage' ? 'percent' : 'amount'
  );
  
  const orderQty = calcOrderQuantity(item);
  const cartonQty = calcCartonCount(item);
  const isCarton = isCartonProduct(item.product);
  const isLiter = item.product.unitType === 'liter';
  
  // 🔥 محاسبه قیمت‌ها
  const totalPrice = calcItemTotalPrice(item);
  const finalPrice = calcItemFinalPrice(item);
  const discountAmount = calcItemDiscountAmount(item);
  const displayUnitPrice = getUnitPriceForDisplay(item.product);
  const unitTypeLabel = getUnitTypeLabel(item.product.unitType);

  const isDraft = status === 'draft';
  const isSalesAdmin = userRole === 'sales_admin';
  const canModify = isDraft && (isSalesAdmin || userRole === 'sales');

  const productIcon = getProductIcon(item.product.name);
  const unitInfo = getUnitInfo(item.product.unitType);
  const hasDiscount = item.discount > 0;

  const handleApplyDiscount = () => {
    if (discountValue > 0) {
      onDiscount(item.id, discountValue, discountType);
    }
    setShowDiscountInput(false);
  };

  const handleCancelDiscount = () => {
    onDiscount(item.id, 0, 'amount');
    setDiscountValue(0);
    setShowDiscountInput(false);
  };

  return (
    <div
      className="group relative rounded-2xl transition-all duration-500"
      style={{ 
        backgroundColor: '#FFFFFF',
        border: isHovered ? '2px solid #3498DB' : '1px solid #ECF0F1',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 20px 60px rgba(52,152,219,0.12), 0 8px 24px rgba(0,0,0,0.06)' 
          : '0 2px 12px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!hasDiscount) setShowDiscountInput(false);
      }}
    >
      {/* حاشیه نورانی */}
      <div 
        className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 blur-xl transition-all duration-700 -z-10 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative p-4">
        <div className="flex items-start gap-4">
          {/* ====== آیکون ====== */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 bg-gradient-to-br ${productIcon.gradient}`}
              style={{
                boxShadow: isHovered ? `0 12px 40px ${productIcon.glow}` : '0 4px 16px rgba(0,0,0,0.08)',
                transform: isHovered ? 'scale(1.08) rotate(-6deg)' : 'scale(1) rotate(0)',
              }}
            >
              <productIcon.icon size={28} className="text-white" />
            </div>
            
            {/* نشانگر نوع واحد */}
            <div
              className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-xl ${unitInfo.bg} ${unitInfo.border} transition-all duration-500`}
              style={{
                transform: isHovered ? 'scale(1.15) rotate(12deg)' : 'scale(1) rotate(0)',
              }}
            >
              <unitInfo.icon size={14} style={{ color: unitInfo.color }} />
            </div>

            {/* نشانگر تخفیف */}
            {hasDiscount && (
              <div className="absolute -top-2 -right-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40 animate-bounce">
                  <Percent size={12} className="text-white" />
                </div>
              </div>
            )}

            {/* برچسب دسته‌بندی */}
            <div className="absolute -top-1 -left-1 text-[8px] font-bold px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg text-gray-600 border border-gray-200/50 flex items-center gap-1">
              <Shield size={8} className="text-blue-400" />
              {productIcon.badge}
            </div>
          </div>

          {/* ====== اطلاعات محصول ====== */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {/* نام محصول */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-base truncate" style={{ color: '#2C3E50' }}>
                    {item.product.name}
                  </h4>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${unitInfo.bg} ${unitInfo.text} border ${unitInfo.border} flex items-center gap-1.5 shadow-sm`}
                  >
                    <unitInfo.icon size={10} />
                    {unitTypeLabel}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 border border-amber-200/70 animate-pulse flex items-center gap-1">
                      <Sparkles size={10} className="text-amber-500" />
                      تخفیف ویژه
                    </span>
                  )}
                </div>

                {/* کد کالا */}
                {item.product.productCode && (
                  <div className="inline-flex items-center gap-1.5 mt-1 bg-gray-50/80 px-2.5 py-0.5 rounded-lg border border-gray-100/80">
                    <span className="text-[8px] font-bold text-gray-400">#</span>
                    <span className="text-[10px] text-gray-500 font-mono tracking-wider">
                      {item.product.productCode}
                    </span>
                    <span className="w-px h-3 bg-gray-200" />
                    <span className="text-[8px] text-gray-400">کد کالا</span>
                  </div>
                )}

                {/* اطلاعات سفارش */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-blue-50/60 px-3 py-1 rounded-xl border border-blue-100/60 shadow-sm">
                    <span className="text-[8px] text-blue-500 font-bold">سفارش</span>
                    <span className="text-sm font-bold text-blue-700">
                      {formatNumber(orderQty)}
                    </span>
                  </div>
                  
                  {isCarton && (
                    <div className="flex items-center gap-1.5 bg-amber-50/60 px-3 py-1 rounded-xl border border-amber-100/60 shadow-sm">
                      <Layers size={12} className="text-amber-500" />
                      <span className="text-[8px] text-amber-500 font-bold">کارتن</span>
                      <span className="text-sm font-bold text-amber-700">
                        {formatNumber(cartonQty)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 bg-gray-50/60 px-2.5 py-0.5 rounded-lg border border-gray-100/60">
                    <span className="text-[9px] text-gray-400">×</span>
                    <span className="text-xs font-medium text-gray-600">
                      {formatToman(displayUnitPrice)}
                    </span>
                  </div>

                  {isCarton && (
                    <span className="text-[8px] text-gray-400 bg-gray-50/80 px-2 py-0.5 rounded-full border border-gray-100/50">
                      هر عدد: {formatToman(item.product.price)}
                    </span>
                  )}
                </div>

                {/* 🔥 قیمت به تومان و ریال - اصلاح شده */}
                <div className="flex items-center gap-3 mt-1.5 text-[9px]">
                  <span className="text-gray-600"> {formatToman(totalPrice)}</span>
                  
                                  </div>
              </div>

              {/* ====== قیمت نهایی ====== */}
              <div className="text-right flex-shrink-0 min-w-[120px]">
                {hasDiscount ? (
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-400 line-through decoration-2 decoration-red-300">
                      {formatToman(totalPrice)}
                    </p>
                    <p className="text-lg font-extrabold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                      {formatToman(finalPrice)}
                    </p>
                    <p className="text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full inline-block border border-red-100/50">
                      -{formatToman(discountAmount)}
                    </p>
                    <p className="text-[8px] text-gray-400">
                      {formatTomanNumber(finalPrice)} ریال
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-extrabold" style={{ color: '#2C3E50' }}>
                      {formatToman(totalPrice)}
                    </p>
                                      </div>
                )}
              </div>
            </div>

            {/* ====== دکمه‌های اقدام ====== */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100/80">
              {canModify ? (
                <>
                  {showDiscountInput ? (
                    <DiscountInput
                      discountValue={discountValue}
                      discountType={discountType}
                      onValueChange={setDiscountValue}
                      onTypeChange={setDiscountType}
                      onApply={handleApplyDiscount}
                      onCancel={() => {
                        setShowDiscountInput(false);
                        if (hasDiscount) handleCancelDiscount();
                      }}
                    />
                  ) : (
                    <>
                      {/* 🔥 دکمه تخفیف */}
                      <DiscountButton
                        hasDiscount={hasDiscount}
                        discountValue={discountValue}
                        discountType={discountType}
                        onClick={() => setShowDiscountInput(true)}
                      />
                      
                      {/* 🔥 دکمه لغو تخفیف */}
                      {hasDiscount && (
                        <button
                          onClick={handleCancelDiscount}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 hover:scale-105 active:scale-95 bg-red-50 text-red-500 border border-red-200/50 hover:shadow-lg hover:shadow-red-500/20"
                        >
                          <X size={12} />
                          لغو
                        </button>
                      )}
                      
                      {/* 🔥 دکمه حذف از فاکتور */}
                      <button
                        onClick={() => onRemove(item.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-500 hover:scale-105 active:scale-95 bg-gradient-to-r from-red-50 to-rose-50/80 text-red-600 border border-red-200/50 hover:shadow-lg hover:shadow-red-500/20 hover:border-red-300"
                      >
                        <Trash2 size={14} />
                        حذف از فاکتور
                      </button>
                    </>
                  )}
                  
                  <span className={`text-[8px] text-gray-400 mr-auto transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    ✨ قابل ویرایش
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  {status === 'final' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 shadow-sm">
                      <Award size={14} className="text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium">نهایی شده</span>
                    </div>
                  )}
                  {status === 'paid' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-200/70 shadow-sm">
                      <Shield size={14} className="text-blue-500" />
                      <span className="text-xs text-blue-600 font-medium">پرداخت شده</span>
                    </div>
                  )}
                  
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* نوار پیشرفت تخفیف */}
      {hasDiscount && (
        <div className="h-1 w-full bg-gray-100/80 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-b-2xl transition-all duration-1000"
            style={{ 
              width: `${Math.min((discountAmount / totalPrice) * 100, 100)}%`,
              boxShadow: '0 0 20px rgba(251,191,36,0.2)',
            }}
          />
        </div>
      )}
    </div>
  );
}