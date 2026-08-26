// invoice-management-system/services/api.ts

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptorها
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// 📌 توابع کمکی برای تشخیص نقش
// ============================================

export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isSalesAdmin() {
  const user = getCurrentUser();
  return user?.role === 'sales_admin';
}

export function isRegularSales() {
  const user = getCurrentUser();
  return user?.role === 'sales';
}

// ============== Auth ==============
export async function login(phone: string, password: string) {
  try {
    const res = await api.post('/auth/login', { phone, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    }
    return res.data;
  } catch (error) {
    console.error('❌ خطا در ورود:', error);
    throw error;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

// ============== Products ==============
export async function getProducts(search?: string) {
  try {
    const res = await api.get('/products', { params: { search } });
    const user = getCurrentUser();
    const isSalesAdminUser = user?.role === 'sales_admin';
    const isRegularSalesUser = user?.role === 'sales';

    console.log('📦 محصولات دریافتی از بک‌اند:', res.data.data);

    return res.data.data.map((p: any) => {
      const stock = Number(p.stock) || 0;
      
      // 🔥 فروشندگان عادی: فقط موجود/ناموجود و تعداد در کارتن
      if (isRegularSalesUser && !isSalesAdminUser) {
        return {
          id: p.id,
          name: p.name,
          price: Number(p.unitPrice),
          stock: stock,  // 🔥 stock واقعی را نگه می‌داریم
          isAvailable: stock > 0,  // 🔥 موجود/ناموجود بر اساس stock
          cartonSize: p.cartonSize || null,
          unitType: p.unitType || 'single',
        };
      }

      // فروش(ادمین): دسترسی کامل به تعداد
      return {
        id: p.id,
        name: p.name,
        price: Number(p.unitPrice),
        stock: stock,
        cartonSize: p.cartonSize || null,
        unitType: p.unitType || 'single',
        barcode: p.barcode,
        costPrice: Number(p.costPrice),
        minStock: p.minStock,
        isAvailable: stock > 0,
      };
    });
  } catch (error) {
    console.error('❌ خطا در دریافت محصولات:', error);
    return [];
  }
}

// ============== Customers ==============
export async function getCustomers(search?: string) {
  try {
    const res = await api.get('/customers', { params: { search } });
    return res.data.data.map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || '',
      nationalId: c.nationalId || '',
      address: c.address || '',
    }));
  } catch (error) {
    console.error('❌ خطا در دریافت مشتریان:', error);
    return [];
  }
}

export async function suggestCustomers(query: string) {
  try {
    const res = await api.get('/customers/suggest', { params: { q: query } });
    return res.data.map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || '',
      nationalId: c.nationalId || '',
      address: c.address || '',
    }));
  } catch (error) {
    console.error('❌ خطا در جستجوی مشتریان:', error);
    return [];
  }
}

// ============== Invoices ==============
export async function createInvoice(data: any) {
  try {
    const res = await api.post('/invoices', data);
    return res.data;
  } catch (error) {
    console.error('❌ خطا در ایجاد فاکتور:', error);
    throw error;
  }
}

export async function getInvoiceNumber() {
  try {
    const res = await api.get('/invoices/next-number');
    return res.data;
  } catch (error) {
    console.error('❌ خطا در دریافت شماره فاکتور:', error);
    return { invoiceNumber: 'INV-2026-0001' };
  }
}

export default api;