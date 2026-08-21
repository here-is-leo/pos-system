// src/services/api.ts

import axios from 'axios';

// ============================================
// 📌 تایپ‌ها
// ============================================

export interface User {
  id: number;
  fullName: string;
  phone: string;
  role: 'admin' | 'sales' | 'warehouse' | 'sales_admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  barcode?: string;
  unitType: 'single' | 'carton';
  cartonSize?: number;
  unitPrice: number;
  costPrice: number;
  stock: number;
  warehouse: string;
  minStock: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  nationalId?: string;
  address?: string;
  totalPurchases: number;
  lastPurchaseDate?: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: Customer;
  salesUser: User;
  totalAmount: number;
  totalDiscount: number;
  finalAmount: number;
  totalPaid: number;
  remainingDebt: number;
  isSettled: boolean;
  previousDebt: number;
  status: 'draft' | 'final' | 'paid' | 'settled';
  createdAt: string;
  items: any[];
}

export interface Inventory {
  id: number;
  productId: number;
  product: Product;
  warehouseId: number;
  quantity: number;
  lastUpdated: string;
  updatedBy: number;
  updatedByUser?: User;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ============================================
// 📌 تایپ‌های تسویه حساب
// ============================================

export interface PaymentTransaction {
  id: number;
  invoiceId: number;
  customerId: number;
  amount: number;
  paymentDate: string;
  paymentType: 'cash' | 'card' | 'transfer' | 'check';
  description?: string;
  createdBy: number;
  createdAt: string;
  invoice?: {
    invoiceNumber: string;
    finalAmount: number;
  };
  customer?: Customer;
  user?: {
    fullName: string;
  };
}

export interface CustomerDebt {
  id: number;
  name: string;
  phone: string;
  totalDebt: number;
  invoices: {
    id: number;
    invoiceNumber: string;
    finalAmount: number;
    totalPaid: number;
    remainingDebt: number;
    createdAt: string;
    salesUser: {
      fullName: string;
    };
  }[];
}

// ============================================
// 📌 تنظیمات axios
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ============================================
// 🔥 Interceptor توکن
// ============================================

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

// ============================================
// 🔥 Interceptor خطای 401
// ============================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// 📌 AUTH
// ============================================

export const login = async (phone: string, password: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { phone, password });
  const { token, user } = response.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return { token, user };
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// ============================================
// 📌 PRODUCTS
// ============================================

export const getProducts = async (search?: string): Promise<Product[]> => {
  const response = await api.get('/products', { params: { search: search || '' } });
  return response.data.data || [];
};

export const createProduct = async (data: any) => {
  const response = await api.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: number, data: any) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  await api.delete(`/products/${id}`);
};

// ============================================
// 📌 CUSTOMERS
// ============================================

export const getCustomers = async (search?: string): Promise<Customer[]> => {
  const response = await api.get('/customers', { params: { search: search || '' } });
  return response.data.data || [];
};

export const createCustomer = async (data: any) => {
  const response = await api.post('/customers', data);
  return response.data;
};

export const updateCustomer = async (id: number, data: any) => {
  const response = await api.put(`/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id: number) => {
  await api.delete(`/customers/${id}`);
};

// ============================================
// 📌 INVOICES
// ============================================

export const getInvoices = async (params?: any): Promise<Invoice[]> => {
  const response = await api.get('/invoices', { params });
  return response.data.data || [];
};

export const getInvoiceById = async (id: number): Promise<Invoice> => {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

export const createInvoice = async (data: any) => {
  const response = await api.post('/invoices', data);
  return response.data;
};

export const updateInvoice = async (id: number, data: any) => {
  const response = await api.put(`/invoices/${id}`, data);
  return response.data;
};

export const finalizeInvoice = async (id: number) => {
  const response = await api.post(`/invoices/${id}/finalize`);
  return response.data;
};

export const deleteInvoice = async (id: number) => {
  await api.delete(`/invoices/${id}`);
};

export const getInvoiceNumber = async () => {
  const response = await api.get('/invoices/next-number');
  return response.data;
};

// ============================================
// 📌 INVENTORY
// ============================================

export const getInventory = async (): Promise<Inventory[]> => {
  try {
    const response = await api.get('/inventory');
    console.log('📦 موجودی دریافتی:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('❌ خطا در دریافت موجودی:', error);
    return [];
  }
};

export const getLowStock = async (): Promise<Inventory[]> => {
  try {
    const response = await api.get('/inventory/low-stock');
    return response.data || [];
  } catch (error) {
    console.error('❌ خطا در دریافت محصولات کم‌موجود:', error);
    return [];
  }
};

export const addInventory = async (data: { productId: number; quantity: number; reason?: string }) => {
  const response = await api.post('/inventory/add', data);
  return response.data;
};

export const getNegativeStock = async (): Promise<Inventory[]> => {
  try {
    const response = await api.get('/inventory/negative-stock');
    return response.data || [];
  } catch (error) {
    console.error('❌ خطا در دریافت موجودی منفی:', error);
    return [];
  }
};

// ============================================
// 📌 USERS
// ============================================

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data || [];
  } catch (error) {
    console.error('❌ خطا در دریافت کاربران:', error);
    return [];
  }
};

export const createUser = async (data: {
  fullName: string;
  phone: string;
  password: string;
  role: 'admin' | 'sales' | 'warehouse' | 'sales_admin';
  isActive?: boolean;
}) => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUser = async (id: number, data: any) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  await api.delete(`/users/${id}`);
};

// ============================================
// 📌 SALES INVOICES
// ============================================

export const getSalesStats = async () => {
  try {
    const response = await api.get('/invoices/sales-stats');
    return response.data || [];
  } catch (error) {
    console.error('❌ خطا در دریافت آمار فروشندگان:', error);
    return [];
  }
};

export const getSalesInvoices = async (userId: number) => {
  try {
    const response = await api.get(`/invoices/sales/${userId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('❌ خطا در دریافت فاکتورهای فروشنده:', error);
    return [];
  }
};

// ============================================
// 📌 PAYMENT TRANSACTIONS - تسویه حساب
// ============================================

/**
 * دریافت مشتریان با بدهی
 * GET /api/customers/with-debt
 */
export const getCustomersWithDebt = async (): Promise<CustomerDebt[]> => {
  try {
    const response = await api.get('/customers/with-debt');
    console.log('📊 مشتریان با بدهی:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('❌ خطا در دریافت مشتریان با بدهی:', error);
    return [];
  }
};

/**
 * دریافت بدهی یک مشتری
 * GET /api/customers/:id/debt
 */
export const getCustomerDebt = async (customerId: number): Promise<{ totalDebt: number }> => {
  try {
    const response = await api.get(`/customers/${customerId}/debt`);
    return response.data || { totalDebt: 0 };
  } catch (error) {
    console.error('❌ خطا در دریافت بدهی مشتری:', error);
    return { totalDebt: 0 };
  }
};

/**
 * دریافت تراکنش‌های یک مشتری
 * GET /api/customers/:id/payments
 */
export const getCustomerPayments = async (customerId: number): Promise<PaymentTransaction[]> => {
  try {
    const response = await api.get(`/customers/${customerId}/payments`);
    return response.data || [];
  } catch (error) {
    console.error('❌ خطا در دریافت تراکنش‌های مشتری:', error);
    return [];
  }
};

/**
 * دریافت همه تراکنش‌ها (با فیلتر)
 * GET /api/payments
 */
export const getAllPayments = async (filters?: {
  customerId?: number;
  startDate?: string;
  endDate?: string;
  paymentType?: string;
}): Promise<PaymentTransaction[]> => {
  try {
    const response = await api.get('/payments', { params: filters });
    return response.data || [];
  } catch (error) {
    console.error('❌ خطا در دریافت تراکنش‌ها:', error);
    return [];
  }
};

/**
 * ثبت پرداخت جدید
 * POST /api/payments
 */
export const createPayment = async (data: {
  invoiceId: number;
  amount: number;
  paymentType: 'cash' | 'card' | 'transfer' | 'check';
  description?: string;
}) => {
  try {
    console.log('📤 ثبت پرداخت جدید:', data);
    const response = await api.post('/payments', data);
    console.log('✅ پرداخت ثبت شد:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ خطا در ثبت پرداخت:', error);
    console.error('📋 پاسخ:', error.response?.data);
    throw error;
  }
};

// ============================================
// 📌 REPORTS
// ============================================

export const getReports = async () => {
  try {
    const [invoices, products, inventory] = await Promise.all([
      getInvoices(),
      getProducts(),
      getInventory(),
    ]);
    
    return {
      invoices,
      products,
      inventory,
      totalSales: invoices.reduce((sum, inv) => sum + (inv.finalAmount || 0), 0),
      totalInvoices: invoices.length,
    };
  } catch (error) {
    console.error('❌ خطا در دریافت گزارشات:', error);
    return {
      invoices: [],
      products: [],
      inventory: [],
      totalSales: 0,
      totalInvoices: 0,
    };
  }
};

// ============================================
// 📌 NOTIFICATIONS
// ============================================

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data || [];
  } catch (error) {
    console.error('❌ خطا در دریافت نوتیفیکیشن‌ها:', error);
    return [];
  }
};

// ============================================
// 📌 کسر موجودی
// ============================================

export const subtractInventory = async (data: { 
  productId: number; 
  quantity: number; 
  reason?: string 
}) => {
  try {
    const response = await api.post('/inventory/subtract', data);
    return response.data;
  } catch (error) {
    console.error('❌ خطا در کسر موجودی:', error);
    throw error;
  }
};

// ============================================
// 📌 مدیریت خطاها
// ============================================

export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    if (response) {
      if (response.data?.message) {
        return response.data.message;
      }
      if (response.data?.errors) {
        return response.data.errors.join(', ');
      }
      return `خطا: ${response.status} - ${response.statusText}`;
    }
    return 'خطا در ارتباط با سرور';
  }
  return error.message || 'خطای ناشناخته';
};

// ============================================
// 📌 EXPORT DEFAULT
// ============================================

export default {
  // Auth
  login,
  logout,
  
  // Products
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  
  // Customers
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  
  // Invoices
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  finalizeInvoice,
  deleteInvoice,
  getInvoiceNumber,
  
  // Inventory
  getInventory,
  getLowStock,
  addInventory,
  getNegativeStock,
  
  // Users
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  
  // Sales
  getSalesStats,
  getSalesInvoices,
  
  // 🔥 Payment / Settlement
  getCustomersWithDebt,
  getCustomerDebt,
  getCustomerPayments,
  getAllPayments,
  createPayment,
  
  // Reports
  getReports,
  
  // Notifications
  getNotifications,
  
  // Error Handling
  handleApiError,
};