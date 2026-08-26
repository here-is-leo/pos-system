// lib/invoice-types.ts

export interface Customer {
  id: number;
  name: string;
  phone: string;
  nationalId: string;
  address: string;
  salesUser?: {
    fullName: string;
  };
}

export interface Product {
  id: number;
  name: string;
  productCode?: string;
  price: number;
  stock: number;
  cartonSize?: number;
  unitType?: string;
  barcode?: string;
}

export interface InvoiceItem {
  id: string;
  product: Product;
  quantity: number;      // تعداد کارتن (برای کارتن‌ها) یا تعداد واحد (برای بطری‌ها)
  cartonCount: number;   // تعداد کارتن (برای کارتن‌ها)
  discount: number;
  discountType: 'percent' | 'amount';
}

// ============================================
// 📌 توابع فرمت
// ============================================

export function formatPrice(price: number): string {
  return price.toLocaleString('fa-IR');
}

export function formatNumber(num: number): string {
  return num.toLocaleString('fa-IR');
}

// ============================================
// 📌 توابع محاسباتی
// ============================================

/**
 * محاسبه تعداد سفارش (تعداد کل واحدها)
 * - برای بطری: همان quantity
 * - برای کارتن: quantity × cartonSize
 */
export function calcOrderQuantity(item: InvoiceItem): number {
  if (item.product.unitType === 'carton' && item.product.cartonSize) {
    return item.quantity * item.product.cartonSize;
  }
  return item.quantity;
}

/**
 * محاسبه تعداد کارتن
 * - برای کارتن: quantity
 * - برای غیر کارتن: 0
 */
export function calcCartonCount(item: InvoiceItem): number {
  if (item.product.unitType === 'carton' && item.product.cartonSize) {
    return item.quantity;
  }
  return 0;
}

/**
 * محاسبه قیمت کل آیتم (قیمت هر واحد × تعداد سفارش)
 * قیمت واحد = price (همیشه قیمت هر واحد است)
 * برای کارتن‌ها: price = قیمت هر عدد داخل کارتن
 */
export function calcItemTotalPrice(item: InvoiceItem): number {
  const orderQty = calcOrderQuantity(item);
  return item.product.price * orderQty;
}

/**
 * محاسبه مبلغ تخفیف
 */
export function calcItemDiscountAmount(item: InvoiceItem): number {
  const total = calcItemTotalPrice(item);
  if (item.discountType === 'percent') {
    return (total * item.discount) / 100;
  }
  return Math.min(item.discount, total);
}

/**
 * محاسبه قیمت نهایی آیتم
 */
export function calcItemFinalPrice(item: InvoiceItem): number {
  const total = calcItemTotalPrice(item);
  const discount = calcItemDiscountAmount(item);
  return total - discount;
}

/**
 * محاسبه جمع کل فاکتور
 */
export function calcInvoiceTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + calcItemFinalPrice(item), 0);
}

/**
 * بررسی اینکه محصول کارتن است
 */
export function isCartonProduct(product: Product): boolean {
  return product.unitType === 'carton' && (product.cartonSize || 0) > 0;
}

/**
 * دریافت برچسب نوع واحد
 */
export function getUnitTypeLabel(unitType?: string): string {
  const labels: Record<string, string> = {
    piece: 'بطری',
    carton: 'کارتن',
    liter: 'لیتر',
  };
  return labels[unitType || 'piece'] || 'واحد';
}

/**
 * دریافت قیمت واحد برای نمایش
 * - برای کارتن: قیمت هر کارتن (قیمت واحد × تعداد در کارتن)
 * - برای غیر کارتن: قیمت واحد
 */
export function getUnitPriceForDisplay(product: Product): number {
  if (product.unitType === 'carton' && product.cartonSize) {
    return product.price * product.cartonSize;
  }
  return product.price;
}

/**
 * دریافت قیمت نهایی محصول (برای کارتن‌ها قیمت کارتن)
 */
export function getProductFinalPrice(product: Product): number {
  if (product.unitType === 'carton' && product.cartonSize && product.cartonSize > 0) {
    return product.price * product.cartonSize;
  }
  return product.price;
}

/**
 * دریافت نام محصول با نوع واحد
 */
export function getProductDisplayName(product: Product): string {
  const unitLabel = getUnitTypeLabel(product.unitType);
  return `${product.name} (${unitLabel})`;
}