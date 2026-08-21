// ============================================
// تایپ‌های اصلی
// ============================================

export interface Customer {
  id: number;
  name: string;
  phone: string;
  nationalId: string;
  address: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface InvoiceItem {
  id: string;
  product: Product;
  quantity: number;
  discount: number;
  discountType: 'percent' | 'amount';
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  salesUserId: number;
  totalAmount: number;
  totalDiscount: number;
  finalAmount: number;
  status: 'draft' | 'final' | 'paid';
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  items: InvoiceItem[];
}

// ============================================
// توابع کمکی
// ============================================

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fa-IR').format(n);
}

export function calcItemFinalPrice(item: InvoiceItem): number {
  const subtotal = item.product.price * item.quantity;
  if (item.discountType === 'percent') {
    return subtotal - (subtotal * item.discount) / 100;
  }
  return subtotal - item.discount;
}

export function calcItemDiscountAmount(item: InvoiceItem): number {
  const subtotal = item.product.price * item.quantity;
  if (item.discountType === 'percent') {
    return (subtotal * item.discount) / 100;
  }
  return item.discount;
}

export function getDiscountDisplay(item: InvoiceItem): string {
  if (!item.discount) return 'بدون تخفیف';
  
  if (item.discountType === 'percent') {
    return `${item.discount}%`;
  } else {
    const subtotal = item.product.price * item.quantity;
    const percent = subtotal > 0 ? Math.round((item.discount / subtotal) * 100) : 0;
    return `${item.discount.toLocaleString('fa-IR')} ریال (معادل ${percent}%)`;
  }
}