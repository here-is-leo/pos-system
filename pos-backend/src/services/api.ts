// pos-backend/src/services/api.ts

import axios from 'axios';

// ============================================
// 📌 تایپ‌های مورد استفاده در API
// ============================================

export interface User {
  id: number;
  fullName: string;
  phone: string;
  role: 'admin' | 'sales' | 'warehouse';
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
  cartonPrice?: number;
  stock: number;
  warehouse: string;
  minStock: number;
  warehouseId?: number;
}

export interface CreateProductData {
  name: string;
  barcode?: string;
  unitType?: 'single' | 'carton';
  cartonSize?: number;
  unitPrice: number;
  costPrice?: number;
  warehouseId?: number;
  minStock?: number;
  stock?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  nationalId?: string;
  address?: string;
  totalPurchases: number;
  lastPurchaseDate?: string;
}

export interface CreateCustomerData {
  name: string;
  phone?: string;
  nationalId?: string;
  address?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export interface InvoiceItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountPercentage: number;
  finalPrice: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: Customer;
  salesUser: User;
  totalAmount: number;
  totalDiscount: number;
  finalAmount: number;
  status: 'draft' | 'final' | 'paid';
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
}

export interface CreateInvoiceItemData {
  productId: number;
  quantity: number;
  unitPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export interface CreateInvoiceData {
  customerId: number;
  items: CreateInvoiceItemData[];
}

export interface UpdateInvoiceData extends CreateInvoiceData {}

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

export interface AddStockData {
  productId: number;
  quantity: number;
  reason?: string;
}

export interface AdjustStockData {
  productId: number;
  quantity: number;
  reason?: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateUserData {
  fullName: string;
  phone: string;
  password: string;
  role: 'admin' | 'sales' | 'warehouse';
  isActive?: boolean;
}

export interface UpdateUserData {
  fullName?: string;
  role?: 'admin' | 'sales' | 'warehouse';
  isActive?: boolean;
  password?: string;
}

// ============================================
// 📌 Reports Types
// ============================================

export interface SalesReportResponse {
  summary: {
    totalInvoices: number;
    totalSales: number;
    totalDiscount: number;
    netSales: number;
    averageOrder: number;
  };
  productSales: Array<{
    name: string;
    quantity: number;
    total: number;
  }>;
  invoices: Array<{
    id: number;
    invoiceNumber: string;
    customer: string;
    salesUser: string;
    finalAmount: number;
    createdAt: string;
  }>;
}

export interface TopCustomersResponse {
  id: number;
  name: string;
  phone: string;
  totalPurchases: number;
  totalInvoices: number;
  lastPurchase: string | null;
  recentPurchases: number[];
}

export interface InventoryReportResponse {
  summary: {
    totalProducts: number;
    totalStock: number;
    totalValue: number;
    lowStockCount: number;
  };
  items: Array<{
    productId: number;
    productName: string;
    barcode: string;
    warehouse: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    minStock: number;
    status: 'low' | 'ok';
  }>;
  lowStockItems: Array<{
    productName: string;
    currentStock: number;
    minStock: number;
    deficit: number;
  }>;
}

export interface ProfitReportResponse {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
    totalItemsSold: number;
    totalInvoices: number;
  };
  dailyProfit: Array<{
    date: string;
    revenue: number;
    profit: number;
  }>;
}

export interface SalesPerformanceResponse {
  salesUsers: Array<{
    userId: number;
    fullName: string;
    totalInvoices: number;
    totalSales: number;
    totalItems: number;
    averageOrder: number;
    invoices: Array<{
      id: number;
      invoiceNumber: string;
      finalAmount: number;
      createdAt: string;
    }>;
  }>;
  summary: {
    totalSales: number;
    totalInvoices: number;
    averagePerUser: number;
  };
}

// ============================================
// 📌 تنظیمات پایه axios
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ============================================
// 🔥 Interceptor برای اضافه کردن توکن به درخواست‌ها
// ============================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// 🔥 Interceptor برای مدیریت خطاهای 401 (توکن منقضی)
// ============================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // توکن منقضی شده یا نامعتبر است
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // هدایت به صفحه لاگین (اگر در مرورگر باشد)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// 📌 AUTH API
// ============================================

export const authAPI = {
  login: async (phone: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { phone, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

// ============================================
// 📌 PRODUCTS API
// ============================================

export const productsAPI = {
  // دریافت لیست محصولات با جستجو
  getAll: async (search?: string): Promise<Product[]> => {
    const response = await api.get('/products', { 
      params: { search: search || '' } 
    });
    return response.data.data || [];
  },

  // دریافت یک محصول با شناسه
  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // ایجاد محصول جدید
  create: async (data: CreateProductData): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // ویرایش محصول
  update: async (id: number, data: UpdateProductData): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // حذف محصول
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // جستجوی محصولات برای Autocomplete
  suggest: async (query: string): Promise<Product[]> => {
    const response = await api.get('/products', { 
      params: { search: query } 
    });
    return response.data.data || [];
  },
};

// ============================================
// 📌 CUSTOMERS API
// ============================================

export const customersAPI = {
  // دریافت لیست مشتریان
  getAll: async (search?: string): Promise<Customer[]> => {
    const response = await api.get('/customers', { 
      params: { search: search || '' } 
    });
    return response.data.data || [];
  },

  // جستجوی مشتریان برای Autocomplete
  suggest: async (query: string): Promise<Customer[]> => {
    const response = await api.get('/customers/suggest', { 
      params: { q: query } 
    });
    return response.data || [];
  },

  // ایجاد مشتری جدید
  create: async (data: CreateCustomerData): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  // ویرایش مشتری
  update: async (id: number, data: UpdateCustomerData): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  // حذف مشتری
  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};

// ============================================
// 📌 INVOICES API
// ============================================

export const invoicesAPI = {
  // دریافت لیست فاکتورها
  getAll: async (params?: { status?: string; search?: string }): Promise<Invoice[]> => {
    const response = await api.get('/invoices', { params });
    return response.data.data || [];
  },

  // دریافت یک فاکتور با شناسه
  getById: async (id: number): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  // دریافت شماره فاکتور جدید
  getNextNumber: async (): Promise<string> => {
    const response = await api.get('/invoices/next-number');
    return response.data.invoiceNumber;
  },

  // ایجاد فاکتور جدید
  create: async (data: CreateInvoiceData): Promise<Invoice> => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  // ویرایش فاکتور (فقط draft)
  update: async (id: number, data: UpdateInvoiceData): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  // نهایی‌سازی فاکتور
  finalize: async (id: number): Promise<Invoice> => {
    const response = await api.post(`/invoices/${id}/finalize`);
    return response.data;
  },

  // حذف فاکتور
  delete: async (id: number): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },

  // دریافت فاکتورهای یک فروشنده
  getBySalesUser: async (userId: number): Promise<Invoice[]> => {
    const response = await api.get(`/invoices/sales/${userId}`);
    return response.data.data || [];
  },

  // جستجوی پیشرفته فاکتورها
  search: async (params: {
    query?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Invoice[]> => {
    const response = await api.get('/invoices/search', { params });
    return response.data.data || [];
  },
};

// ============================================
// 📌 INVENTORY API
// ============================================

export const inventoryAPI = {
  // دریافت موجودی همه محصولات
  getAll: async (): Promise<Inventory[]> => {
    const response = await api.get('/inventory');
    return response.data || [];
  },

  // دریافت محصولات کم‌موجود
  getLowStock: async (): Promise<Inventory[]> => {
    const response = await api.get('/inventory/low-stock');
    return response.data || [];
  },

  // اضافه کردن موجودی (کاربر انبار)
  addStock: async (data: AddStockData): Promise<Inventory> => {
    const response = await api.post('/inventory/add', data);
    return response.data;
  },

  // اصلاح موجودی (ادمین)
  adjustStock: async (data: AdjustStockData): Promise<{ 
    productId: number; 
    productName: string; 
    newQuantity: number; 
    adjustedBy: string; 
    timestamp: string;
  }> => {
    const response = await api.post('/inventory/adjust', data);
    return response.data;
  },
};

// ============================================
// 📌 USERS API
// ============================================

export const usersAPI = {
  // دریافت لیست کاربران
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data || [];
  },

  // ایجاد کاربر جدید (فقط ادمین)
  create: async (data: CreateUserData): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // ویرایش کاربر
  update: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // حذف کاربر
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // تغییر رمز عبور
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.post('/users/change-password', data);
  },
};

// ============================================
// 📌 NOTIFICATIONS API
// ============================================

export const notificationsAPI = {
  // دریافت لیست نوتیفیکیشن‌ها
  getAll: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data || [];
  },

  // دریافت آمار نوتیفیکیشن‌ها
  getStats: async (): Promise<{
    total: number;
    unread: number;
    danger: number;
    warning: number;
    info: number;
    success: number;
  }> => {
    const response = await api.get('/notifications/stats');
    return response.data;
  },

  // علامت‌گذاری یک نوتیفیکیشن به عنوان خوانده‌شده
  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  // علامت‌گذاری همه نوتیفیکیشن‌ها به عنوان خوانده‌شده
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  // حذف یک نوتیفیکیشن
  delete: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};

// ============================================
// 📌 REPORTS API
// ============================================

export const reportsAPI = {
  // گزارش فروش در بازه زمانی
  getSalesReport: async (params: {
    startDate?: string;
    endDate?: string;
    productId?: number;
  }): Promise<SalesReportResponse> => {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  },

  // گزارش برترین مشتریان
  getTopCustomers: async (limit: number = 10): Promise<TopCustomersResponse[]> => {
    const response = await api.get('/reports/top-customers', { 
      params: { limit } 
    });
    return response.data || [];
  },

  // گزارش موجودی
  getInventoryReport: async (): Promise<InventoryReportResponse> => {
    const response = await api.get('/reports/inventory');
    return response.data;
  },

  // گزارش سود
  getProfitReport: async (params: {
    startDate?: string;
    endDate?: string;
  }): Promise<ProfitReportResponse> => {
    const response = await api.get('/reports/profit', { params });
    return response.data;
  },

  // گزارش عملکرد فروشندگان
  getSalesPerformance: async (params: {
    startDate?: string;
    endDate?: string;
  }): Promise<SalesPerformanceResponse> => {
    const response = await api.get('/reports/sales-performance', { params });
    return response.data;
  },
};

// ============================================
// 📌 توابع کمکی برای استفاده در کامپوننت‌ها
// ============================================

// این توابع با کدهای موجود در DashboardPage همخوانی دارند
export const getProducts = productsAPI.getAll;
export const getCustomers = customersAPI.getAll;
export const getInvoices = invoicesAPI.getAll;
export const getInventory = inventoryAPI.getAll;
export const getLowStock = inventoryAPI.getLowStock;
export const getUsers = usersAPI.getAll;
export const getSalesStats = async () => {
  try {
    const response = await api.get('/invoices/sales-stats');
    return response.data || [];
  } catch (error) {
    console.error('خطا در دریافت آمار فروشندگان:', error);
    return [];
  }
};
export const getSalesInvoices = invoicesAPI.getBySalesUser;

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
    return 'خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.';
  }
  return error.message || 'خطای ناشناخته رخ داده است.';
};

// ============================================
// 📌 توابع کمکی برای فرمت‌کردن
// ============================================

export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount);
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatDateShort = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

// ============================================
// 📌 EXPORT DEFAULT
// ============================================

export default {
  auth: authAPI,
  products: productsAPI,
  customers: customersAPI,
  invoices: invoicesAPI,
  inventory: inventoryAPI,
  users: usersAPI,
  notifications: notificationsAPI,
  reports: reportsAPI,
  getProducts,
  getCustomers,
  getInvoices,
  getInventory,
  getLowStock,
  getUsers,
  getSalesStats,
  getSalesInvoices,
  handleApiError,
  formatPrice,
  formatNumber,
  formatDate,
  formatDateShort,
};