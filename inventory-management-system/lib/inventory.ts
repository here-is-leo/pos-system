// lib/inventory.ts

export interface Product {
  id: number;
  name: string;
  barcode?: string;
  price: number;
  unitPrice?: number;
  costPrice?: number;
  stock?: number;
}

export interface InventoryItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  lastUpdated: string;
  updatedBy?: number;
}

// ============================================
// 🔥 اتصال به بک‌اند واقعی
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * دریافت لیست موجودی از بک‌اند
 * GET /api/inventory
 */
export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    console.log('📦 درخواست دریافت موجودی به:', `${API_BASE_URL}/inventory`);
    
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ توکن منقضی شده');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return [];
      }
      throw new Error(`خطا در دریافت موجودی: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ موجودی دریافتی:', data);
    
    // 🔥 تبدیل داده‌های بک‌اند به فرمت مورد نیاز
    return data.map((item: any) => ({
      id: item.id,
      productId: item.productId || item.product?.id,
      product: {
        id: item.product?.id || item.productId,
        name: item.product?.name || 'نامشخص',
        barcode: item.product?.barcode,
        price: item.product?.unitPrice || item.product?.price || 0,
        unitPrice: item.product?.unitPrice,
        costPrice: item.product?.costPrice,
        stock: item.quantity,
      },
      quantity: item.quantity || 0,
      lastUpdated: item.lastUpdated || item.updatedAt || new Date().toISOString(),
      updatedBy: item.updatedBy,
    }));
  } catch (error) {
    console.error('❌ خطا در دریافت موجودی:', error);
    // 🔥 در صورت خطا، از داده‌های Mock استفاده کن
    console.warn('⚠️ استفاده از داده‌های Mock به جای بک‌اند');
    return getMockInventoryItems();
  }
}

/**
 * افزودن موجودی به محصول
 * POST /api/inventory/add
 */
export async function addStockToProduct(
  productId: number,
  quantity: number,
  reason: string
): Promise<InventoryItem> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    console.log(`📦 افزودن ${quantity} عدد به محصول ${productId}`);
    
    const response = await fetch(`${API_BASE_URL}/inventory/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ productId, quantity, reason }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ توکن منقضی شده');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        throw new Error('توکن منقضی شده');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'خطا در افزودن موجودی');
    }

    const data = await response.json();
    console.log('✅ موجودی افزوده شد:', data);
    
    return {
      id: data.id,
      productId: data.productId,
      product: {
        id: data.product?.id || data.productId,
        name: data.product?.name || 'نامشخص',
        barcode: data.product?.barcode,
        price: data.product?.unitPrice || data.product?.price || 0,
      },
      quantity: data.quantity || 0,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ خطا در افزودن موجودی:', error);
    throw error;
  }
}

// ============================================
// 📌 داده‌های Mock (فال‌بک در صورت خطا)
// ============================================

function getMockInventoryItems(): InventoryItem[] {
  return [
    {
      id: 1,
      productId: 1,
      product: {
        id: 1,
        name: 'لپ‌تاپ ایسوس X515',
        barcode: '6221031005001',
        price: 28500000,
        unitPrice: 28500000,
        costPrice: 25000000,
        stock: 12,
      },
      quantity: 12,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 2,
      productId: 2,
      product: {
        id: 2,
        name: 'کیبورد لاجیتک K380',
        barcode: '5099206088078',
        price: 1800000,
        unitPrice: 1800000,
        costPrice: 1400000,
        stock: 5,
      },
      quantity: 5,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 3,
      productId: 3,
      product: {
        id: 3,
        name: 'موس بی‌سیم HP',
        barcode: '0193808540327',
        price: 950000,
        unitPrice: 950000,
        costPrice: 700000,
        stock: 0,
      },
      quantity: 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 4,
      productId: 4,
      product: {
        id: 4,
        name: 'مانیتور سامسونگ ۲۴',
        barcode: '8806094803259',
        price: 9200000,
        unitPrice: 9200000,
        costPrice: 7900000,
        stock: 25,
      },
      quantity: 25,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 5,
      productId: 5,
      product: {
        id: 5,
        name: 'کابل HDMI ۲متری',
        barcode: '6971536924331',
        price: 250000,
        unitPrice: 250000,
        costPrice: 150000,
        stock: 45,
      },
      quantity: 45,
      lastUpdated: new Date().toISOString(),
    },
  ];
}