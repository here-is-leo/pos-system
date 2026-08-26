// components/invoice/InvoicePage.tsx

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Plus, Printer, Save, FileText, LogOut, Percent, X, User, Menu, 
  ShoppingCart, TrendingUp, Clock, CheckCircle, AlertCircle, 
  Sparkles, Shield, Award, Layers, Gift, CreditCard, Receipt,
  ChevronLeft, ChevronRight, Settings, Bell, HelpCircle,
  ChevronDown
} from 'lucide-react';
import {
  Customer,
  InvoiceItem,
  Product,
  formatNumber,
  calcItemDiscountAmount,
  calcOrderQuantity,
  calcCartonCount,
  getProductFinalPrice,
  getProductDisplayName,
  calcInvoiceTotal,
  isCartonProduct,
  getUnitPriceForDisplay,
  calcItemTotalPrice,
  getUnitTypeLabel
} from '@/lib/invoice-types';
import { formatToman, formatTomanNumber, toRial } from '@/lib/utils';
import CustomerSection from './CustomerSection';
import InvoiceItemCard from './InvoiceItemCard';
import AddItemModal from './AddItemModal';
import DiscountModal from './DiscountModal';
import InvoiceToast from './InvoiceToast';
import InvoicePrint from './InvoicePrint';
import MobileSidebar from './MobileSidebar';
import HistoryTab from './HistoryTab';
import StatsTab from './StatsTab';
import { getProducts, getCustomers, createInvoice, getInvoiceNumber, getCurrentUser } from '@/services/api';

export default function InvoicePage() {
  const [customer, setCustomer] = useState<Customer>({
    id: 0,
    name: '',
    phone: '',
    nationalId: '',
    address: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [discountItemId, setDiscountItemId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0001');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<number>(0);

  const [previousDebt, setPreviousDebt] = useState<number>(0);
  const [isLoadingDebt, setIsLoadingDebt] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'invoice' | 'history' | 'stats'>('invoice');

  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [globalDiscountType, setGlobalDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [showGlobalDiscount, setShowGlobalDiscount] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState<'draft' | 'final' | 'paid'>('draft');

  const printRef = useRef<HTMLDivElement>(null);

  // 🔥 ایجاد یک کپی از items با productCode تضمینی برای پرینت
  const printItems = items.map(item => ({
    ...item,
    product: {
      ...item.product,
      productCode: item.product.productCode || '-',
      barcode: item.product.barcode || '',
      unitType: item.product.unitType || 'piece',
      cartonSize: item.product.cartonSize || undefined,
      price: item.product.price || 0,
      stock: item.product.stock || 0,
    }
  }));

  const fetchPreviousDebt = useCallback(async (customerId: number) => {
    if (customerId <= 0) {
      setPreviousDebt(0);
      return;
    }

    try {
      setIsLoadingDebt(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/customers/${customerId}/debt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت بدهی');
      }

      const data = await response.json();
      setPreviousDebt(data.totalDebt || 0);
    } catch (error) {
      console.error('خطا در دریافت بدهی قبلی:', error);
      setPreviousDebt(0);
    } finally {
      setIsLoadingDebt(false);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const user = getCurrentUser();
        if (user) {
          setUserName(user.fullName || 'کاربر گرامی');
          setUserRole(user.role || 'sales');
          setUserId(user.id || 0);
          
          setWelcomeMessage(`سلام ${user.fullName || 'کاربر گرامی'} 👋 خوش آمدید`);
          setTimeout(() => {
            setWelcomeMessage(null);
          }, 2000);
        }

        const [productsData, customersData, numData] = await Promise.all([
          getProducts(),
          getCustomers(),
          getInvoiceNumber(),
        ]);

        setProducts(productsData || []);
        setCustomers(customersData || []);
        setInvoiceNumber(numData?.invoiceNumber || 'INV-2026-0001');
      } catch (error: any) {
        console.error('خطا در بارگذاری داده‌ها:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setToast('خطا در ارتباط با سرور');
        }
      } finally {
        setIsDataLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (customer.id > 0) {
      fetchPreviousDebt(customer.id);
    } else {
      setPreviousDebt(0);
    }
  }, [customer.id, fetchPreviousDebt]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const subtotalAll = items.reduce((sum, item) => {
    const orderQty = calcOrderQuantity(item);
    return sum + (item.product.price * orderQty);
  }, 0);

  const itemDiscounts = items.reduce((sum, i) => sum + calcItemDiscountAmount(i), 0);

  let globalDiscountAmount = 0;
  const baseAmount = subtotalAll - itemDiscounts;
  if (globalDiscountType === 'percent') {
    globalDiscountAmount = (baseAmount * globalDiscount) / 100;
  } else {
    globalDiscountAmount = Math.min(globalDiscount, baseAmount);
  }

  const invoiceTotal = baseAmount - globalDiscountAmount;
  const payable = invoiceTotal + previousDebt;

  const totalOrderQuantity = items.reduce((sum, item) => {
    return sum + calcOrderQuantity(item);
  }, 0);

  const totalCartonCount = items.reduce((sum, item) => {
    return sum + calcCartonCount(item);
  }, 0);

  const cartonItems = items.filter(item => isCartonProduct(item.product));
  const totalCartonPrice = cartonItems.reduce((sum, item) => {
    const cartonPrice = getUnitPriceForDisplay(item.product);
    return sum + (cartonPrice * item.quantity);
  }, 0);

  const handleAddItem = useCallback((product: Product, quantity: number, cartonCount: number) => {
    const existing = items.find(i => i.product.id === product.id);
    const isCarton = isCartonProduct(product);
    
    if (existing) {
      setItems(prev =>
        prev.map(i =>
          i.product.id === product.id
            ? { 
                ...i, 
                quantity: i.quantity + quantity,
                cartonCount: isCarton ? i.cartonCount + cartonCount : 0,
              }
            : i
        )
      );
    } else {
      setItems(prev => [...prev, {
        id: `${product.id}-${Date.now()}`,
        product,
        quantity: quantity,
        cartonCount: isCarton ? cartonCount : 0,
        discount: 0,
        discountType: 'percent',
      }]);
    }
  }, [items]);

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleApplyDiscount = (discount: number, type: 'percent' | 'amount') => {
    setItems(prev =>
      prev.map(i =>
        i.id === discountItemId ? { ...i, discount, discountType: type } : i
      )
    );
    setDiscountItemId(null);
  };

  const handleSubmit = async () => {
    if (!customer.name) {
      setToast('لطفاً اطلاعات مشتری را وارد کنید');
      return;
    }
    if (items.length === 0) {
      setToast('لطفاً حداقل یک کالا اضافه کنید');
      return;
    }

    setIsLoading(true);
    try {
      const invoiceData = {
        customerId: customer.id || 1,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: calcOrderQuantity(item),
          unitPrice: getUnitPriceForDisplay(item.product),
          discountType: item.discountType === 'percent' ? 'percentage' : 'fixed',
          discountValue: item.discount,
        })),
      };

      const result = await createInvoice(invoiceData);
      setToast(`✅ فاکتور ${result.invoiceNumber} با موفقیت ثبت شد`);

      setItems([]);
      setCustomer({ id: 0, name: '', phone: '', nationalId: '', address: '' });
      setGlobalDiscount(0);
      setGlobalDiscountType('percent');
      setPreviousDebt(0);
      const numData = await getInvoiceNumber();
      setInvoiceNumber(numData.invoiceNumber);
    } catch (error: any) {
      console.error('خطا در ثبت فاکتور:', error);
      const msg = error.response?.data?.message || error.response?.data?.errors?.[0] || 'خطا در ثبت فاکتور';
      setToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (items.length === 0) {
      setToast('❌ هیچ کالایی برای چاپ وجود ندارد');
      return;
    }

    const printContent = printRef.current?.innerHTML;
    if (!printContent) {
      setToast('خطا در آماده‌سازی چاپ');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      setToast('لطفاً pop-up را مجاز کنید');
      return;
    }

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>فاکتور ${invoiceNumber}</title>
          <style>
            body { 
              font-family: 'Vazirmatn', Tahoma, sans-serif; 
              padding: 20px; 
              background: white;
              direction: rtl;
            }
            .invoice-table td, .invoice-table th {
              border: 1px solid #000;
              padding: 6px 8px;
              text-align: center;
              font-size: 13px;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() { 
              window.print(); 
              window.close();
            }
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const discountItem = items.find(i => i.id === discountItemId) ?? null;

  const renderContent = () => {
    switch (activeTab) {
      case 'history':
        return <HistoryTab userId={userId} />;
      case 'stats':
        return <StatsTab userId={userId} />;
      case 'invoice':
      default:
        return renderInvoiceContent();
    }
  };

  const renderInvoiceContent = () => (
    <>
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-700">اطلاعات مشتری</span>
            <span className="flex-1" />
            {customer.name && (
              <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                ✅ انتخاب شد
              </span>
            )}
          </div>
          <CustomerSection
            customer={customer}
            onChange={setCustomer}
            customers={customers}
          />
        </div>
      </div>

      {previousDebt > 0 && (
        <div className="mx-4 mb-3 p-3 rounded-xl animate-in slide-in-from-right-2 duration-500" 
             style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              <span className="text-sm font-semibold" style={{ color: '#92400E' }}>
                بدهی قبلی مشتری:
              </span>
            </div>
            <span className="text-sm font-bold" style={{ color: '#B91C1C' }}>
              {formatToman(previousDebt)}
            </span>
          </div>
          <p className="text-[10px] text-amber-600 mt-0.5">
            این مبلغ به فاکتور فعلی اضافه خواهد شد
          </p>
        </div>
      )}

      {isLoadingDebt && (
        <div className="mx-4 mb-3 flex items-center justify-center p-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-gray-500 mr-2">دریافت بدهی مشتری...</span>
        </div>
      )}

      <div className="flex items-center justify-between px-5 mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-gray-400" />
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: '#ECF0F1', color: '#7F8C8D' }}
          >
            {items.length} کالا
          </span>
          {items.length > 0 && (
            <span className="text-[10px] text-gray-400">
              {formatNumber(totalOrderQuantity)} عدد
            </span>
          )}
        </div>
        <h2 className="font-bold text-sm" style={{ color: '#2C3E50' }}>لیست کالاها</h2>
      </div>

      <div className="px-4 space-y-3">
        {items.length === 0 ? (
          <div
            className="rounded-2xl py-16 flex flex-col items-center gap-4 transition-all duration-500 hover:scale-[1.02]"
            style={{ backgroundColor: '#FFFFFF', border: '2px dashed #E5E7EB' }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50"
            >
              <ShoppingCart size={32} className="text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">هنوز کالایی اضافه نشده</p>
              <p className="text-[10px] text-gray-400 mt-0.5">برای شروع، دکمه افزودن کالا را بزنید</p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <InvoiceItemCard
              key={item.id}
              item={item}
              onRemove={handleRemoveItem}
              onDiscount={setDiscountItemId}
              status={invoiceStatus}
              userRole={userRole}
            />
          ))
        )}
      </div>

      <div className="px-4 mt-4">
        <button
          onClick={() => setShowAddItem(true)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-lg transition-all duration-500 hover:scale-[1.02] active:scale-95 hover:shadow-xl"
          style={{ 
            background: 'linear-gradient(135deg, #2C3E50, #1a2634)',
            color: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(44,62,80,0.25)',
          }}
        >
          <Plus size={20} className="transition-transform duration-500 group-hover:rotate-90" />
          افزودن کالا
        </button>
      </div>

      <footer
        className="fixed bottom-0 right-0 left-0 z-30 transition-all duration-500"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 -8px 30px rgba(44,62,80,0.08)',
          maxWidth: '100vw',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="px-4 pt-3 pb-2 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold" style={{ color: '#2C3E50' }}>
              {formatToman(subtotalAll)}
            </span>
            <span className="text-xs" style={{ color: '#7F8C8D' }}>
              جمع کل (بدون تخفیف)
            </span>
          </div>

          {itemDiscounts > 0 && (
            <div className="flex justify-between items-center text-sm animate-in slide-in-from-right-2 duration-300">
              <span className="font-semibold" style={{ color: '#E74C3C' }}>
                -{formatToman(itemDiscounts)}
              </span>
              <span className="text-xs" style={{ color: '#7F8C8D' }}>تخفیف کالاها</span>
            </div>
          )}

          {globalDiscount > 0 && (
            <div className="flex justify-between items-center text-sm animate-in slide-in-from-right-2 duration-500">
              <span className="font-semibold" style={{ color: '#E74C3C' }}>
                -{formatToman(globalDiscountAmount)}
              </span>
              <span className="text-xs" style={{ color: '#7F8C8D' }}>
                تخفیف کل {globalDiscountType === 'percent' ? `(${globalDiscount}%)` : ''}
              </span>
            </div>
          )}

          {previousDebt > 0 && (
            <div className="flex justify-between items-center text-sm py-1 px-2 rounded-lg animate-in slide-in-from-right-2 duration-700" 
                 style={{ backgroundColor: '#FEF3C7' }}>
              <span className="font-semibold" style={{ color: '#B91C1C' }}>
                +{formatToman(previousDebt)}
              </span>
              <span className="text-xs" style={{ color: '#92400E' }}>بدهی قبلی</span>
            </div>
          )}

          <div style={{ height: 1, backgroundColor: '#ECF0F1', margin: '6px 0' }} />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {totalCartonCount > 0 && (
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                  <Layers size={12} className="text-amber-500" />
                  <span className="text-[10px] font-bold" style={{ color: '#E67E22' }}>
                    {formatNumber(totalCartonCount)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-[10px]" style={{ color: '#7F8C8D' }}>سفارش:</span>
                <span className="text-xs font-bold" style={{ color: '#1a5276' }}>
                  {formatNumber(totalOrderQuantity)}
                </span>
              </div>
              {items.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px]" style={{ color: '#7F8C8D' }}>اقلام:</span>
                  <span className="text-xs font-bold" style={{ color: '#2C3E50' }}>
                    {items.length}
                  </span>
                </div>
              )}
            </div>
            
            {cartonItems.length > 0 && (
              <div className="text-[8px] text-gray-400 truncate max-w-[150px]">
                {cartonItems.map((item, index) => (
                  <span key={item.id}>
                    {item.product.name}: {formatNumber(item.quantity)} کارتن
                    {index < cartonItems.length - 1 ? ' | ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-1 border-t-2" 
               style={{ borderColor: previousDebt > 0 ? '#F59E0B' : '#E5E7EB' }}>
            <div className="flex items-center gap-2">
              <CreditCard size={16} className={previousDebt > 0 ? 'text-amber-500' : 'text-gray-400'} />
              <span className="text-sm font-bold" style={{ color: previousDebt > 0 ? '#92400E' : '#2C3E50' }}>
                {previousDebt > 0 ? 'قابل پرداخت (با بدهی)' : 'مبلغ قابل پرداخت'}
              </span>
            </div>
            <span className="text-xl font-extrabold transition-all duration-500" 
                  style={{ color: previousDebt > 0 ? '#B91C1C' : '#2C3E50' }}>
              {formatToman(payable)}
            </span>
          </div>

          {cartonItems.length > 0 && (
            <div className="mt-1 pt-1 border-t border-dashed border-gray-200">
              <details className="group">
                <summary className="text-[9px] text-gray-400 cursor-pointer hover:text-gray-600 transition-colors list-none flex items-center gap-1">
                  <Layers size={10} className="text-amber-400" />
                  جزئیات کارتن‌ها
                  <ChevronDown size={10} className="group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="mt-1 space-y-0.5">
                  {cartonItems.map((item) => {
                    const cartonPrice = getUnitPriceForDisplay(item.product);
                    const itemTotal = cartonPrice * item.quantity;
                    return (
                      <div key={item.id} className="flex justify-between items-center text-[9px] text-gray-500 animate-in slide-in-from-right-2 duration-300">
                        <span>
                          {item.product.name}: {formatNumber(item.quantity)} کارتن × {formatToman(cartonPrice)}
                        </span>
                        <span className="font-semibold" style={{ color: '#1a5276' }}>
                          {formatToman(itemTotal)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center text-[9px] font-bold pt-0.5 border-t border-gray-100">
                    <span style={{ color: '#1a5276' }}>جمع کارتن‌ها:</span>
                    <span style={{ color: '#1a5276' }}>{formatToman(totalCartonPrice)}</span>
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>

        <div className="flex gap-2 px-4 pt-1 pb-4">
          <button
            onClick={() => setShowGlobalDiscount(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}
          >
            <Percent size={14} />
            تخفیف کل
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs flex-1 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            style={{ backgroundColor: '#ECF0F1', color: '#2C3E50' }}
          >
            <Printer size={14} />
            چاپ
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || items.length === 0}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs flex-[2] shadow-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
            style={{ 
              background: items.length > 0 
                ? 'linear-gradient(135deg, #2C3E50, #1a2634)' 
                : '#CBD5E1',
              color: '#FFFFFF',
              boxShadow: items.length > 0 
                ? '0 4px 16px rgba(44,62,80,0.25)' 
                : 'none',
            }}
          >
            <Save size={14} />
            {isLoading ? 'در حال ثبت...' : 'ثبت فاکتور'}
          </button>
        </div>
      </footer>
    </>
  );

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600 text-sm">در حال بارگذاری...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col min-h-screen"
      style={{ backgroundColor: '#F0F2F5', direction: 'rtl' }}
    >
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 backdrop-blur-xl"
        style={{
          backgroundColor: 'rgba(255,255,255,0.85)',
          boxShadow: '0 2px 20px rgba(44,62,80,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.5)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100/80 transition-all duration-300 hover:scale-105"
          >
            <Menu className="h-5 w-5" style={{ color: '#2C3E50' }} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Receipt size={16} className="text-white" />
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50/80 text-blue-700 border border-blue-200/50"
            >
              {invoiceNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50 shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <User size={12} className="text-white" />
            </div>
            <span className="text-xs font-medium" style={{ color: '#1A5276' }}>
              {userName}
            </span>
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50"
          >
            <FileText size={16} style={{ color: '#3498DB' }} />
          </div>
          <h1 className="text-sm font-extrabold hidden sm:block" style={{ color: '#2C3E50' }}>
            ثبت فاکتور جدید
          </h1>
        </div>
      </header>

      {welcomeMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
          <div
            className="px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #1A5276, #1a2634)',
              color: '#FFFFFF',
              boxShadow: '0 8px 40px rgba(26,82,118,0.3)',
            }}
          >
            <Sparkles size={16} className="text-yellow-300 animate-pulse" />
            <span className="text-sm font-medium">{welcomeMessage}</span>
          </div>
        </div>
      )}

      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto pb-56 pt-4">
        {renderContent()}
      </main>

      {showAddItem && (
        <AddItemModal
          onClose={() => setShowAddItem(false)}
          onAdd={handleAddItem}
          products={products}
        />
      )}

      {discountItem && (
        <DiscountModal
          item={discountItem}
          onClose={() => setDiscountItemId(null)}
          onApply={handleApplyDiscount}
        />
      )}

      {showGlobalDiscount && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[430px] rounded-t-3xl shadow-2xl p-5 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Percent size={16} className="text-white" />
                </div>
                <h2 className="text-lg font-bold" style={{ color: '#2C3E50' }}>
                  تخفیف روی کل خرید
                </h2>
              </div>
              <button 
                onClick={() => setShowGlobalDiscount(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all duration-300 hover:rotate-90"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>
                  نوع تخفیف
                </label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 p-0.5 bg-gray-50">
                  <button
                    onClick={() => setGlobalDiscountType('percent')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                      globalDiscountType === 'percent'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    درصدی (%)
                  </button>
                  <button
                    onClick={() => setGlobalDiscountType('fixed')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                      globalDiscountType === 'fixed'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    مبلغی (تومان)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#2C3E50' }}>
                  مقدار تخفیف
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                    placeholder={globalDiscountType === 'percent' ? 'مثال: ۱۰' : 'مثال: ۵۰۰۰۰'}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 text-right"
                    style={{
                      color: '#2C3E50',
                      backgroundColor: '#FFFFFF',
                      direction: 'ltr'
                    }}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {globalDiscountType === 'percent' ? '%' : 'تومان'}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {globalDiscountType === 'percent'
                    ? 'درصد تخفیف روی کل خرید'
                    : 'مبلغ تخفیف به تومان'}
                </p>
              </div>

              {globalDiscount > 0 && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-3 rounded-xl border border-gray-200 animate-in fade-in duration-300">
                  <div className="flex justify-between text-sm py-0.5">
                    <span className="text-gray-500">قیمت قبل از تخفیف:</span>
                    <span className="font-semibold" style={{ color: '#2C3E50' }}>
                      {formatToman(invoiceTotal - previousDebt)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm py-0.5">
                    <span className="text-gray-500">تخفیف:</span>
                    <span className="font-semibold" style={{ color: '#E74C3C' }}>
                      -{formatToman(globalDiscountAmount)}
                    </span>
                  </div>
                  {previousDebt > 0 && (
                    <div className="flex justify-between text-sm py-0.5">
                      <span className="text-gray-500">بدهی قبلی:</span>
                      <span className="font-semibold" style={{ color: '#B91C1C' }}>
                        +{formatToman(previousDebt)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-700">مبلغ قابل پرداخت:</span>
                    <span className="text-emerald-600">{formatToman(payable)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowGlobalDiscount(false)}
                className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20"
                style={{ background: 'linear-gradient(135deg, #2C3E50, #1a2634)' }}
              >
                اعمال تخفیف
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <InvoiceToast message={toast} onClose={() => setToast(null)} />
      )}

      {/* ========= بخش مخفی برای چاپ فاکتور ========= */}
      <div style={{ display: 'none' }}>
        <InvoicePrint
          ref={printRef}
          invoiceNumber={invoiceNumber}
          customer={customer}
          items={printItems}  // 🔥 استفاده از printItems
          subtotal={subtotalAll}
          totalDiscount={itemDiscounts + globalDiscountAmount}
          payable={payable}
          date={new Date().toLocaleDateString('fa-IR')}
          sellerName="شرکت حس شیمی"
          status={invoiceStatus}
          userRole={userRole}
          previousDebt={previousDebt}
        />
      </div>
    </div>
  );
}