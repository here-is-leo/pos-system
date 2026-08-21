import { useState, useCallback, useEffect } from 'react';
import { Plus, Printer, Save, FileText } from 'lucide-react';
import {
  Customer,
  InvoiceItem,
  Product,
  formatPrice,
  calcItemFinalPrice,
  calcItemDiscountAmount,
  formatNumber,
} from '@/types/invoice';
import CustomerSection from '@/components/CustomerSection';
import InvoiceItemCard from '@/components/InvoiceItemCard';
import AddItemModal from '@/components/AddItemModal';
import DiscountModal from '@/components/DiscountModal';
import InvoiceToast from '@/components/InvoiceToast';
import { getProducts, getCustomers, createInvoice, getInvoiceNumber } from '@/services/api';

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

  // بارگذاری داده‌ها از بک‌اند
  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, customersData, numData] = await Promise.all([
          getProducts(),
          getCustomers(),
          getInvoiceNumber(),
        ]);
        setProducts(productsData);
        setCustomers(customersData);
        setInvoiceNumber(numData.invoiceNumber);
      } catch (error) {
        console.error('خطا در بارگذاری داده‌ها:', error);
        setToast('خطا در ارتباط با سرور');
      }
    }
    loadData();
  }, []);

  /* ---- محاسبات ---- */
  const subtotalAll = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discountAll = items.reduce((sum, i) => sum + calcItemDiscountAmount(i), 0);
  const payable = subtotalAll - discountAll;

  /* ---- هندلرها ---- */
  const handleAddItem = useCallback((product: Product, quantity: number) => {
    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      setItems(prev =>
        prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      setItems(prev => [...prev, {
        id: `${product.id}-${Date.now()}`,
        product,
        quantity,
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
          quantity: item.quantity,
          unitPrice: item.product.price,
          discountType: item.discountType,
          discountValue: item.discount,
        })),
      };

      const result = await createInvoice(invoiceData);
      setToast(`فاکتور ${result.invoiceNumber} با موفقیت ثبت شد`);
      
      // ریست کردن فرم
      setItems([]);
      setCustomer({ id: 0, name: '', phone: '', nationalId: '', address: '' });
      
      // دریافت شماره فاکتور جدید
      const numData = await getInvoiceNumber();
      setInvoiceNumber(numData.invoiceNumber);
    } catch (error: any) {
      console.error('خطا در ثبت فاکتور:', error);
      setToast(error.response?.data?.message || 'خطا در ثبت فاکتور');
    } finally {
      setIsLoading(false);
    }
  };

  const discountItem = items.find(i => i.id === discountItemId) ?? null;

  return (
    <div
      className="relative flex flex-col min-h-screen"
      style={{ backgroundColor: '#F0F2F5', direction: 'rtl' }}
    >
      {/* ========= HEADER ========= */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-4"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 12px rgba(44,62,80,0.08)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: '#EBF5FB', color: '#3498DB' }}
          >
            {invoiceNumber}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#EBF5FB' }}
          >
            <FileText size={18} style={{ color: '#3498DB' }} />
          </div>
          <h1 className="text-base font-extrabold" style={{ color: '#2C3E50' }}>
            ثبت فاکتور جدید
          </h1>
        </div>
      </header>

      {/* ========= SCROLLABLE CONTENT ========= */}
      <main className="flex-1 overflow-y-auto pb-64 pt-4">
        {/* Customer Section */}
        <CustomerSection 
          customer={customer} 
          onChange={setCustomer}
          customers={customers}
        />

        {/* Items Section Header */}
        <div className="flex items-center justify-between px-5 mb-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: '#ECF0F1', color: '#7F8C8D' }}
          >
            {items.length} کالا
          </span>
          <h2 className="font-bold text-sm" style={{ color: '#2C3E50' }}>لیست کالاها</h2>
        </div>

        {/* Items List */}
        <div className="px-4 space-y-3">
          {items.length === 0 ? (
            <div
              className="rounded-2xl py-12 flex flex-col items-center gap-3"
              style={{ backgroundColor: '#FFFFFF', border: '1.5px dashed #BDC3C7' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: '#F8F9FA' }}
              >
                <Plus size={28} style={{ color: '#BDC3C7' }} />
              </div>
              <p className="text-sm" style={{ color: '#BDC3C7' }}>هنوز کالایی اضافه نشده</p>
            </div>
          ) : (
            items.map(item => (
              <InvoiceItemCard
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onDiscount={setDiscountItemId}
              />
            ))
          )}
        </div>

        {/* Add Item Button */}
        <div className="px-4 mt-4">
          <button
            onClick={() => setShowAddItem(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: '#2C3E50', color: '#FFFFFF' }}
          >
            <Plus size={20} />
            افزودن کالا
          </button>
        </div>
      </main>

      {/* ========= STICKY FOOTER SUMMARY ========= */}
      <footer
        className="fixed bottom-0 right-0 left-0 z-30"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 -4px 20px rgba(44,62,80,0.1)',
          maxWidth: '100vw',
        }}
      >
        <div className="px-5 pt-4 pb-2 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold" style={{ color: '#2C3E50' }}>
              {formatPrice(subtotalAll)}
            </span>
            <span className="text-sm" style={{ color: '#7F8C8D' }}>
              جمع کل (بدون تخفیف):
            </span>
          </div>

          {discountAll > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold" style={{ color: '#E74C3C' }}>
                -{formatPrice(discountAll)}
              </span>
              <span className="text-sm" style={{ color: '#7F8C8D' }}>مجموع تخفیف‌ها:</span>
            </div>
          )}

          <div style={{ height: 1.5, backgroundColor: '#ECF0F1', margin: '8px 0' }} />

          <div className="flex justify-between items-center">
            <span className="text-xl font-extrabold" style={{ color: '#2C3E50' }}>
              {formatPrice(payable)}
            </span>
            <span className="text-sm font-bold" style={{ color: '#2C3E50' }}>
              مبلغ قابل پرداخت:
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 px-4 pt-2 pb-5">
          <button
            onClick={() => setToast('در حال آماده‌سازی پرینت...')}
            className="flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-2xl font-bold text-sm flex-1"
            style={{ backgroundColor: '#ECF0F1', color: '#2C3E50' }}
          >
            <Printer size={17} />
            چاپ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl font-bold text-sm flex-[2] shadow-sm transition-transform active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: '#2C3E50', color: '#FFFFFF' }}
          >
            <Save size={17} />
            {isLoading ? 'در حال ثبت...' : 'ثبت نهایی'}
          </button>
        </div>
      </footer>

      {/* ========= MODALS ========= */}
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

      {/* ========= TOAST ========= */}
      {toast && (
        <InvoiceToast message={toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
}