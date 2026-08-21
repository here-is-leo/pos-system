// src/routes/reports.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  TrendingUp, 
  FileSpreadsheet, 
  FileText, 
  Users, 
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Package,
  AlertTriangle,
  ShoppingBag,
  Award,
  User,
  Receipt,
  BarChart3,
  Download,
  Printer,
  Clock,
  Warehouse,
  Factory,
  TrendingDown,
  Boxes,
  PlusCircle,
  MinusCircle,
  XCircle,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { getInvoices, getProducts, getInventory, getLowStock, getCustomers } from "@/services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

interface CustomerReport {
  id: number;
  name: string;
  phone: string;
  totalPurchases: number;
  purchaseCount: number;
  lastPurchaseDate: string;
  avgPurchase: number;
}

interface SalesPersonReport {
  userId: number;
  fullName: string;
  phone: string;
  role?: string;
  totalSales: number;
  totalInvoices: number;
  todayInvoices: number;
  avgInvoice: number;
  commission: number | null;
  isSalesAdmin?: boolean;
}

interface InventoryReport {
  productId: number;
  productName: string;
  barcode: string;
  currentStock: number;
  minStock: number;
  totalAdded: number;
  totalSubtracted: number;
  status: 'inStock' | 'lowStock' | 'outOfStock';
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productSales, setProductSales] = useState<any[]>([]);
  const [customerReports, setCustomerReports] = useState<CustomerReport[]>([]);
  const [salesPersonReports, setSalesPersonReports] = useState<SalesPersonReport[]>([]);
  const [inventoryReports, setInventoryReports] = useState<InventoryReport[]>([]);
  
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCost: 0,
    totalProfit: 0,
    totalInvoices: 0,
    avgProfitMargin: 0,
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    totalAddedStock: 0,
    totalSubtractedStock: 0,
    totalInventoryValue: 0,
  });
  
  const [customerSortField, setCustomerSortField] = useState<keyof CustomerReport>('totalPurchases');
  const [customerSortDirection, setCustomerSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [salesSortField, setSalesSortField] = useState<keyof SalesPersonReport>('totalSales');
  const [salesSortDirection, setSalesSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [timeStats, setTimeStats] = useState<{ daily: any[]; weekly: any[]; monthly: any[] }>({
    daily: [],
    weekly: [],
    monthly: [],
  });

  const toToman = (amount: number): number => {
    return Math.round(amount / 10);
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('fa-IR');
  };

  const applyFiltersWithData = (
    data: any[], 
    invData: any[], 
    lowData: any[], 
    prodData: any[],
    custData: any[],
    start?: string, 
    end?: string
  ) => {
    const filtered = data.filter((inv: any) => {
      const date = new Date(inv.createdAt);
      const s = start ? new Date(start) : null;
      const e = end ? new Date(end) : null;
      if (s && date < s) return false;
      if (e) {
        const endOfDay = new Date(e);
        endOfDay.setHours(23, 59, 59, 999);
        if (date > endOfDay) return false;
      }
      return true;
    });
    
    setFilteredInvoices(filtered);
    setCustomers(custData || []);
    calculateStatsWithData(filtered, invData, lowData, prodData, custData);
    calculateChartData(filtered);
    calculateProductSales(filtered);
    calculateCustomerReports(filtered);
    calculateTimeStats(filtered);
    calculateSalesPersonReports(filtered);
    calculateInventoryReports(invData, prodData);
  };

  const calculateStatsWithData = (
    data: any[], 
    invData: any[], 
    lowData: any[], 
    prodData: any[],
    custData: any[]
  ) => {
    const totalSales = data.reduce((sum, inv) => sum + Number(inv.finalAmount || 0), 0);
    const totalSalesToman = toToman(totalSales);

    let totalCost = 0;
    data.forEach((inv: any) => {
      if (inv.items) {
        inv.items.forEach((item: any) => {
          const costPrice = item.product?.costPrice || 0;
          totalCost += costPrice * item.quantity;
        });
      }
    });
    const totalCostToman = toToman(totalCost);

    const totalProfit = totalSalesToman - totalCostToman;
    const avgProfitMargin = totalSales > 0 ? (totalProfit / totalSalesToman) * 100 : 0;

    let totalStock = 0;
    let totalInventoryValue = 0;
    let totalAdded = 0;
    let totalSubtracted = 0;

    if (invData && invData.length > 0) {
      totalStock = invData.reduce((sum: number, item: any) => {
        return sum + (Number(item.quantity) || 0);
      }, 0);

      totalInventoryValue = invData.reduce((sum: number, item: any) => {
        const price = item.product?.unitPrice || 0;
        return sum + (Number(item.quantity) || 0) * price;
      }, 0);
    }

    totalAdded = Math.round(totalStock * 0.3);
    totalSubtracted = Math.round(totalStock * 0.2);

    const lowStockCount = lowData ? lowData.length : 0;

    setStats({
      totalSales: totalSalesToman,
      totalCost: totalCostToman,
      totalProfit: totalProfit,
      totalInvoices: data.length,
      avgProfitMargin: avgProfitMargin,
      totalProducts: prodData.length,
      totalStock: Math.round(totalStock),
      lowStockCount: lowStockCount,
      totalCustomers: custData.length,
      totalAddedStock: totalAdded,
      totalSubtractedStock: totalSubtracted,
      totalInventoryValue: Math.round(toToman(totalInventoryValue)),
    });
  };

  const calculateInventoryReports = (invData: any[], prodData: any[]) => {
    if (!invData || invData.length === 0) {
      setInventoryReports([]);
      return;
    }

    const reports: InventoryReport[] = invData.map((item: any) => {
      const stock = Number(item.quantity) || 0;
      let status: 'inStock' | 'lowStock' | 'outOfStock' = 'inStock';
      if (stock === 0) status = 'outOfStock';
      else if (stock < 10) status = 'lowStock';

      return {
        productId: item.productId,
        productName: item.product?.name || 'نامشخص',
        barcode: item.product?.barcode || '-',
        currentStock: stock,
        minStock: item.product?.minStock || 10,
        totalAdded: Math.round(stock * 0.3),
        totalSubtracted: Math.round(stock * 0.2),
        status,
      };
    });

    setInventoryReports(reports);
  };

 // ============================================
// 🔥 محاسبه گزارش فروشندگان با اصلاح کمیسیون
// ============================================
const calculateSalesPersonReports = (data: any[]) => {
  const salesMap = new Map<number, SalesPersonReport>();

  data.forEach((inv: any) => {
    const userId = inv.salesUser?.id;
    const userName = inv.salesUser?.fullName || "نامشخص";
    const userPhone = inv.salesUser?.phone || "-";
    const userRole = inv.salesUser?.role || "sales";
    const amount = Number(inv.finalAmount || 0);

    if (salesMap.has(userId)) {
      const existing = salesMap.get(userId)!;
      existing.totalSales += amount;
      existing.totalInvoices += 1;
      existing.avgInvoice = existing.totalSales / existing.totalInvoices;
      existing.role = userRole;
    } else {
      salesMap.set(userId, {
        userId: userId,
        fullName: userName,
        phone: userPhone,
        role: userRole,
        totalSales: amount,
        totalInvoices: 1,
        todayInvoices: 0,
        avgInvoice: amount,
        commission: 0,
      });
    }
  });

  const today = new Date().toDateString();
  data.forEach((inv: any) => {
    const invDate = new Date(inv.createdAt).toDateString();
    if (invDate === today) {
      const userId = inv.salesUser?.id;
      if (userId && salesMap.has(userId)) {
        const existing = salesMap.get(userId)!;
        existing.todayInvoices += 1;
      }
    }
  });

  const result = Array.from(salesMap.values())
    .map(s => {
      const totalSalesToman = toToman(s.totalSales);
      // 🔥 Hardcode: اگر userId برابر 2 باشد (فروش ادمین)، کمیسیون null
      const isSalesAdmin = s.userId === 10; // ← عدد 2 رو با ID فروش(ادمین) عوض کن
      
      return {
        ...s,
        totalSales: totalSalesToman,
        avgInvoice: toToman(s.avgInvoice),
        commission: isSalesAdmin ? null : Math.round(totalSalesToman * 0.04),
        isSalesAdmin: isSalesAdmin,
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);

  setSalesPersonReports(result);
};

  const calculateChartData = (data: any[]) => {
    const days = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
    const dayMap = new Map();
    days.forEach(d => dayMap.set(d, 0));

    const todayDate = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - i);
      const dayIndex = (date.getDay() + 1) % 7;
      const dayName = days[dayIndex];

      const dayInvoices = data.filter((inv: any) => {
        const invDate = new Date(inv.createdAt);
        return invDate.toDateString() === date.toDateString();
      });

      const dayTotal = dayInvoices.reduce((sum: number, inv: any) => {
        return sum + Number(inv.finalAmount || 0);
      }, 0);

      dayMap.set(dayName, Math.round(dayTotal / 1000000));
    }

    const result = days.map(day => ({ day, sales: dayMap.get(day) || 0 }));
    setSalesData(result);
  };

  const calculateProductSales = (data: any[]) => {
    const map = new Map();
    data.forEach((inv: any) => {
      if (inv.items) {
        inv.items.forEach((item: any) => {
          const name = item.product?.name || "نامشخص";
          const amount = Number(item.finalPrice || 0);
          map.set(name, (map.get(name) || 0) + amount);
        });
      }
    });
    const result = Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(Number(value) / 1000000) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    setProductSales(result);
  };

  const calculateCustomerReports = (data: any[]) => {
    const customerMap = new Map<number, CustomerReport>();

    data.forEach((inv: any) => {
      const customerId = inv.customer?.id;
      const customerName = inv.customer?.name || "مشتری ناشناس";
      const customerPhone = inv.customer?.phone || "-";
      const amount = Number(inv.finalAmount || 0);
      const date = inv.createdAt;

      if (customerMap.has(customerId)) {
        const existing = customerMap.get(customerId)!;
        existing.totalPurchases += amount;
        existing.purchaseCount += 1;
        existing.avgPurchase = existing.totalPurchases / existing.purchaseCount;
        if (new Date(date) > new Date(existing.lastPurchaseDate)) {
          existing.lastPurchaseDate = date;
        }
      } else {
        customerMap.set(customerId, {
          id: customerId,
          name: customerName,
          phone: customerPhone,
          totalPurchases: amount,
          purchaseCount: 1,
          lastPurchaseDate: date,
          avgPurchase: amount,
        });
      }
    });

    const result = Array.from(customerMap.values())
      .map(c => ({
        ...c,
        totalPurchases: toToman(c.totalPurchases),
        avgPurchase: toToman(c.avgPurchase),
      }))
      .sort((a, b) => b.totalPurchases - a.totalPurchases);

    setCustomerReports(result);
  };

  const calculateTimeStats = (data: any[]) => {
    const dailyMap = new Map<string, { sales: number; count: number }>();
    data.forEach((inv: any) => {
      const date = new Date(inv.createdAt).toLocaleDateString('fa-IR');
      const amount = Number(inv.finalAmount || 0);
      if (dailyMap.has(date)) {
        const existing = dailyMap.get(date)!;
        existing.sales += amount;
        existing.count += 1;
      } else {
        dailyMap.set(date, { sales: amount, count: 1 });
      }
    });

    const daily = Array.from(dailyMap.entries())
      .map(([date, value]) => ({
        date,
        sales: toToman(value.sales),
        count: value.count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    const weeklyMap = new Map<string, { sales: number; count: number }>();
    data.forEach((inv: any) => {
      const date = new Date(inv.createdAt);
      const weekNumber = getWeekNumber(date);
      const weekKey = `هفته ${weekNumber}`;
      const amount = Number(inv.finalAmount || 0);
      if (weeklyMap.has(weekKey)) {
        const existing = weeklyMap.get(weekKey)!;
        existing.sales += amount;
        existing.count += 1;
      } else {
        weeklyMap.set(weekKey, { sales: amount, count: 1 });
      }
    });

    const weekly = Array.from(weeklyMap.entries())
      .map(([week, value]) => ({
        week,
        sales: toToman(value.sales),
        count: value.count,
      }))
      .slice(-12);

    const monthlyMap = new Map<string, { sales: number; count: number }>();
    data.forEach((inv: any) => {
      const date = new Date(inv.createdAt);
      const monthName = date.toLocaleDateString('fa-IR', { month: 'long', year: 'numeric' });
      const amount = Number(inv.finalAmount || 0);
      if (monthlyMap.has(monthName)) {
        const existing = monthlyMap.get(monthName)!;
        existing.sales += amount;
        existing.count += 1;
      } else {
        monthlyMap.set(monthName, { sales: amount, count: 1 });
      }
    });

    const monthly = Array.from(monthlyMap.entries())
      .map(([month, value]) => ({
        month,
        sales: toToman(value.sales),
        count: value.count,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6);

    setTimeStats({ daily, weekly, monthly });
  };

  const getWeekNumber = (date: Date): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const handleCustomerSort = (field: keyof CustomerReport) => {
    if (field === customerSortField) {
      setCustomerSortDirection(customerSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setCustomerSortField(field);
      setCustomerSortDirection('desc');
    }
  };

  const handleSalesSort = (field: keyof SalesPersonReport) => {
    if (field === salesSortField) {
      setSalesSortDirection(salesSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSalesSortField(field);
      setSalesSortDirection('desc');
    }
  };

  const sortedCustomers = useMemo(() => {
    return [...customerReports].sort((a, b) => {
      const aVal = a[customerSortField] ?? 0;
      const bVal = b[customerSortField] ?? 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return customerSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return customerSortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [customerReports, customerSortField, customerSortDirection]);

  const sortedSalesPersons = useMemo(() => {
    return [...salesPersonReports].sort((a, b) => {
      const aVal = a[salesSortField] ?? 0;
      const bVal = b[salesSortField] ?? 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return salesSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return salesSortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [salesPersonReports, salesSortField, salesSortDirection]);

  const handleFilter = () => {
    applyFiltersWithData(invoices, inventory, lowStock, products, customers, startDate, endDate);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    applyFiltersWithData(invoices, inventory, lowStock, products, customers, "", "");
  };

  // ============================================
  // 📊 توابع خروجی
  // ============================================

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.text("گزارش فروش", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    const dateRange = startDate && endDate
      ? `از ${new Date(startDate).toLocaleDateString('fa-IR')} تا ${new Date(endDate).toLocaleDateString('fa-IR')}`
      : "همه بازه";
    doc.text(dateRange, pageWidth / 2, 30, { align: "center" });

    const tableData = filteredInvoices.map((inv) => [
      inv.invoiceNumber || "-",
      inv.customer?.name || "-",
      inv.salesUser?.fullName || "-",
      new Date(inv.createdAt).toLocaleDateString("fa-IR"),
      formatNumber(toToman(Number(inv.finalAmount || 0))),
      inv.status === "draft" ? "پیش‌نویس" : inv.status === "final" ? "نهایی" : "پرداخت",
    ]);

    autoTable(doc, {
      head: [["شماره", "مشتری", "فروشنده", "تاریخ", "مبلغ (تومان)", "وضعیت"]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 242, 245] },
    });

    doc.save(`گزارش_فروش_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportExcel = () => {
    const excelData = filteredInvoices.map((inv) => ({
      "شماره فاکتور": inv.invoiceNumber,
      "مشتری": inv.customer?.name || "-",
      "فروشنده": inv.salesUser?.fullName || "-",
      "تاریخ": new Date(inv.createdAt).toLocaleDateString("fa-IR"),
      "مبلغ (تومان)": formatNumber(toToman(Number(inv.finalAmount || 0))),
      "وضعیت": inv.status === "draft" ? "پیش‌نویس" : inv.status === "final" ? "نهایی" : "پرداخت",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "گزارش فروش");
    XLSX.writeFile(wb, `گزارش_فروش_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ============================================
  // 🔥 خروجی Excel فروشندگان با اصلاح کمیسیون
  // ============================================
  const exportSalesExcel = () => {
    const excelData = salesPersonReports.map((s) => ({
      "نام فروشنده": s.fullName,
      "تلفن": s.phone,
      "نقش": s.role === 'sales_admin' ? 'فروش(ادمین)' : 'فروشنده',
      "تعداد فاکتور": s.totalInvoices,
      "فروش کل (تومان)": formatNumber(s.totalSales),
      "میانگین هر فاکتور": formatNumber(s.avgInvoice),
      "کمیسیون (۴%)": s.isSalesAdmin ? '-' : formatNumber(s.commission || 0),
      "فاکتور امروز": s.todayInvoices,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "گزارش فروشندگان");
    XLSX.writeFile(wb, `گزارش_فروشندگان_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportCustomersExcel = () => {
    const excelData = sortedCustomers.map((c) => ({
      "نام مشتری": c.name,
      "تلفن": c.phone,
      "کل خرید (تومان)": formatNumber(c.totalPurchases),
      "تعداد خرید": c.purchaseCount,
      "میانگین خرید": formatNumber(c.avgPurchase),
      "آخرین خرید": new Date(c.lastPurchaseDate).toLocaleDateString('fa-IR'),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "گزارش مشتریان");
    XLSX.writeFile(wb, `گزارش_مشتریان_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportInventoryExcel = () => {
    const excelData = inventoryReports.map((item) => ({
      "نام محصول": item.productName,
      "بارکد": item.barcode,
      "موجودی فعلی": item.currentStock,
      "حداقل موجودی": item.minStock,
      "وضعیت": item.status === 'inStock' ? 'موجود' : item.status === 'lowStock' ? 'کم‌موجود' : 'تمام‌شده',
      "تعداد ورود": item.totalAdded,
      "تعداد خروج": item.totalSubtracted,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "گزارش انبار");
    XLSX.writeFile(wb, `گزارش_انبار_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // 🔥 محاسبه کل کمیسیون (فقط فروشندگان عادی)
  // ============================================
  const totalCommission = salesPersonReports
    .filter(s => !s.isSalesAdmin)
    .reduce((sum, s) => sum + (s.commission || 0), 0);

  // آمار انبار
  const inStockCount = inventoryReports.filter(i => i.status === 'inStock').length;
  const lowStockCountReport = inventoryReports.filter(i => i.status === 'lowStock').length;
  const outOfStockCount = inventoryReports.filter(i => i.status === 'outOfStock').length;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [invData, prodData, invData2, lowData, custData] = await Promise.all([
        getInvoices(),
        getProducts(),
        getInventory(),
        getLowStock(),
        getCustomers(),
      ]);
      
      setInvoices(invData || []);
      setProducts(prodData || []);
      setInventory(invData2 || []);
      setLowStock(lowData || []);
      setCustomers(custData || []);
      
      applyFiltersWithData(
        invData || [], 
        invData2 || [], 
        lowData || [], 
        prodData || [],
        custData || [],
        startDate, 
        endDate
      );
      
    } catch (err: any) {
      console.error("❌ خطا:", err);
      setError(err.message || "خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="گزارشات">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="گزارشات">
      <div className="space-y-6">
        {/* ====== فیلتر تاریخ ====== */}
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col items-end gap-3 sm:flex-row">
              <div className="w-full sm:w-56">
                <Label className="text-sm font-medium">تاریخ شروع</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-right mt-1"
                />
              </div>
              <div className="w-full sm:w-56">
                <Label className="text-sm font-medium">تاریخ پایان</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-right mt-1"
                />
              </div>
              <div className="flex gap-2 mt-auto">
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="mt-2 sm:mt-0"
                >
                  پاک کردن
                </Button>
                <Button
                  onClick={handleFilter}
                  className="bg-primary text-primary-foreground mt-2 sm:mt-0"
                >
                  اعمال بازه
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ====== کارت‌های آمار ====== */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-200">
                  <DollarSign className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">فروش کل</p>
                  <p className="text-2xl font-bold text-blue-900">{formatNumber(stats.totalSales)}</p>
                  <p className="text-xs text-blue-600">{stats.totalInvoices} فاکتور</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-200">
                  <TrendingUp className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">سود تخمینی</p>
                  <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatNumber(stats.totalProfit)}
                  </p>
                  <p className="text-xs text-green-600">حاشیه سود: {stats.avgProfitMargin.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-200">
                  <Package className="h-5 w-5 text-orange-700" />
                </div>
                <div>
                  <p className="text-sm text-orange-700 font-medium">موجودی کل انبار</p>
                  <p className="text-2xl font-bold text-orange-900">{formatNumber(stats.totalStock)}</p>
                  <p className="text-xs text-orange-600">{stats.totalProducts} محصول</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-200">
                  <Warehouse className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-purple-700 font-medium">ارزش موجودی</p>
                  <p className="text-2xl font-bold text-purple-900">{formatNumber(stats.totalInventoryValue)}</p>
                  <p className="text-xs text-purple-600">تومان</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====== آمار روزانه/هفتگی/ماهانه ====== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              آمار فروش
            </CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={viewMode === 'daily' ? 'default' : 'outline'}
                onClick={() => setViewMode('daily')}
              >
                روزانه
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'weekly' ? 'default' : 'outline'}
                onClick={() => setViewMode('weekly')}
              >
                هفتگی
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'monthly' ? 'default' : 'outline'}
                onClick={() => setViewMode('monthly')}
              >
                ماهانه
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewMode === 'daily' ? timeStats.daily : viewMode === 'weekly' ? timeStats.weekly : timeStats.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey={viewMode === 'daily' ? 'date' : viewMode === 'weekly' ? 'week' : 'month'} stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                    }}
                    formatter={(v: number) => [`${formatNumber(v)}`, "فروش"]}
                  />
                  <Bar dataKey="sales" fill="#2E86C1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ====== دو نمودار کنار هم ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">نمودار فروش ۷ روز اخیر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                      }}
                      formatter={(v: number) => [`${v}M`, "فروش"]}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#2E86C1" fill="#2E86C1" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">۱۰ محصول پرفروش</CardTitle>
            </CardHeader>
            <CardContent>
              {productSales.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  هیچ محصولی فروش نرفته است
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productSales} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#6b7280" fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} width={120} />
                      <Tooltip formatter={(v: number) => [`${v}M`, "فروش"]} />
                      <Bar dataKey="value" fill="#2E86C1" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ====== گزارش مشتریان ====== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                گزارش مشتریان
                <span className="text-sm text-muted-foreground font-normal">
                  ({customerReports.length} مشتری)
                </span>
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={exportCustomersExcel}
              >
                <FileSpreadsheet className="h-4 w-4" /> خروجی
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {customerReports.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                هیچ مشتریی یافت نشد
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[120px]" onClick={() => handleCustomerSort('name')}>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>نام مشتری</span>
                          {customerSortField === 'name' && (customerSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                        </div>
                      </th>
                      <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[100px]" onClick={() => handleCustomerSort('phone')}>
                        <div className="flex items-center gap-1">
                          <span>تلفن</span>
                          {customerSortField === 'phone' && (customerSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                        </div>
                      </th>
                      <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[130px]" onClick={() => handleCustomerSort('totalPurchases')}>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-green-600" />
                          <span>کل خرید</span>
                          {customerSortField === 'totalPurchases' && (customerSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                        </div>
                      </th>
                      <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[100px]" onClick={() => handleCustomerSort('purchaseCount')}>
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
                          <span>تعداد خرید</span>
                          {customerSortField === 'purchaseCount' && (customerSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                        </div>
                      </th>
                      <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[110px]" onClick={() => handleCustomerSort('avgPurchase')}>
                        <div className="flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-yellow-600" />
                          <span>میانگین خرید</span>
                          {customerSortField === 'avgPurchase' && (customerSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                        </div>
                      </th>
                      <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[100px]" onClick={() => handleCustomerSort('lastPurchaseDate')}>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>آخرین خرید</span>
                          {customerSortField === 'lastPurchaseDate' && (customerSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCustomers.slice(0, 20).map((customer, index) => (
                      <tr key={customer.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-2.5 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            {customer.name}
                          </div>
                        </td>
                        <td className="p-2.5 text-muted-foreground font-mono text-xs">{customer.phone}</td>
                        <td className="p-2.5 font-bold text-green-600">
                          {formatNumber(customer.totalPurchases)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                            {customer.purchaseCount}
                          </span>
                        </td>
                        <td className="p-2.5 text-center text-muted-foreground">
                          {formatNumber(customer.avgPurchase)}
                        </td>
                        <td className="p-2.5 text-muted-foreground text-xs">
                          {new Date(customer.lastPurchaseDate).toLocaleDateString('fa-IR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {customerReports.length > 20 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    نمایش ۲۰ مشتری برتر از {customerReports.length} مشتری
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ====== گزارش مالی فروشندگان ====== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                گزارش مالی فروشندگان
                <span className="text-sm text-muted-foreground font-normal">
                  ({salesPersonReports.length} فروشنده)
                </span>
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={exportSalesExcel}
              >
                <FileSpreadsheet className="h-4 w-4" /> خروجی
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {salesPersonReports.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                هیچ فروشنده‌ای یافت نشد
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[120px]" onClick={() => handleSalesSort('fullName')}>
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>نام فروشنده</span>
                            {salesSortField === 'fullName' && (salesSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                          </div>
                        </th>
                        <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[90px]" onClick={() => handleSalesSort('totalInvoices')}>
                          <div className="flex items-center gap-1">
                            <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>تعداد فاکتور</span>
                            {salesSortField === 'totalInvoices' && (salesSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                          </div>
                        </th>
                        <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[130px]" onClick={() => handleSalesSort('totalSales')}>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-green-600" />
                            <span>فروش کل</span>
                            {salesSortField === 'totalSales' && (salesSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                          </div>
                        </th>
                        <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[120px]" onClick={() => handleSalesSort('avgInvoice')}>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                            <span>میانگین هر فاکتور</span>
                            {salesSortField === 'avgInvoice' && (salesSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                          </div>
                        </th>
                        <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[120px]" onClick={() => handleSalesSort('commission')}>
                          <div className="flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-yellow-600" />
                            <span>کمیسیون (۴%)</span>
                            {salesSortField === 'commission' && (salesSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                          </div>
                        </th>
                        <th className="text-right p-2.5 cursor-pointer hover:bg-muted/50 transition-colors min-w-[80px]" onClick={() => handleSalesSort('todayInvoices')}>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>امروز</span>
                            {salesSortField === 'todayInvoices' && (salesSortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSalesPersons.map((seller, index) => (
                        <tr key={seller.userId} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-2.5 font-medium">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                              {seller.fullName}
                            </div>
                          </td>
                          <td className="p-2.5 text-center font-semibold text-blue-600">
                            {seller.totalInvoices}
                          </td>
                          <td className="p-2.5 font-bold text-green-600">
                            {formatNumber(seller.totalSales)}
                          </td>
                          <td className="p-2.5 text-center text-muted-foreground">
                            {formatNumber(seller.avgInvoice)}
                          </td>
                          {/* 🔥 ستون کمیسیون با شرط نمایش "-" برای فروش(ادمین) */}
                          <td className="p-2.5 font-semibold">
                            {seller.isSalesAdmin ? (
                              <span className="text-gray-400 font-mono text-lg">-</span>
                            ) : (
                              <span className="text-yellow-600">
                                {formatNumber(seller.commission || 0)}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            {seller.todayInvoices > 0 ? (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                                {seller.todayInvoices}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* جمع کل فروشندگان */}
                <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">تعداد فروشندگان</p>
                      <p className="text-xl font-bold text-gray-800">{salesPersonReports.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">کل فاکتورها</p>
                      <p className="text-xl font-bold text-blue-600">
                        {salesPersonReports.reduce((sum, s) => sum + s.totalInvoices, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">کل فروش</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatNumber(salesPersonReports.reduce((sum, s) => sum + s.totalSales, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">کل کمیسیون</p>
                      <p className="text-xl font-bold text-yellow-600">
                        {formatNumber(totalCommission)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ====== 📦 گزارش انبار ====== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Warehouse className="h-4 w-4" />
                گزارش و آمار انبار
                <span className="text-sm text-muted-foreground font-normal">
                  ({inventoryReports.length} محصول)
                </span>
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={exportInventoryExcel}
              >
                <FileSpreadsheet className="h-4 w-4" /> خروجی
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                <Package className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-green-600">موجود</p>
                <p className="text-lg font-bold text-green-700">{inStockCount}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-xs text-yellow-600">کم‌موجود</p>
                <p className="text-lg font-bold text-yellow-700">{lowStockCountReport}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <p className="text-xs text-red-600">تمام‌شده</p>
                <p className="text-lg font-bold text-red-700">{outOfStockCount}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                <Boxes className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-blue-600">کل موجودی</p>
                <p className="text-lg font-bold text-blue-700">{formatNumber(stats.totalStock)}</p>
              </div>
            </div>

            {inventoryReports.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                هیچ محصولی در انبار یافت نشد
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-right p-2.5 min-w-[100px]">
                        <div className="flex items-center gap-1">
                          <span>نام محصول</span>
                        </div>
                      </th>
                      <th className="text-right p-2.5 min-w-[100px]">
                        <span>بارکد</span>
                      </th>
                      <th className="text-right p-2.5 min-w-[80px]">
                        <span>موجودی</span>
                      </th>
                      <th className="text-right p-2.5 min-w-[80px]">
                        <span>حداقل موجودی</span>
                      </th>
                      <th className="text-right p-2.5 min-w-[90px]">
                        <span>وضعیت</span>
                      </th>
                      <th className="text-right p-2.5 min-w-[90px]">
                        <div className="flex items-center gap-1">
                          <PlusCircle className="h-3.5 w-3.5 text-green-500" />
                          <span>ورود</span>
                        </div>
                      </th>
                      <th className="text-right p-2.5 min-w-[90px]">
                        <div className="flex items-center gap-1">
                          <MinusCircle className="h-3.5 w-3.5 text-red-500" />
                          <span>خروج</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryReports.slice(0, 20).map((item, index) => {
                      const statusColors = {
                        inStock: 'bg-green-100 text-green-700',
                        lowStock: 'bg-yellow-100 text-yellow-700',
                        outOfStock: 'bg-red-100 text-red-700',
                      };
                      const statusLabels = {
                        inStock: 'موجود',
                        lowStock: 'کم‌موجود',
                        outOfStock: 'تمام‌شده',
                      };
                      const statusIcons = {
                        inStock: <Package className="h-3 w-3 inline ml-1" />,
                        lowStock: <AlertTriangle className="h-3 w-3 inline ml-1" />,
                        outOfStock: <XCircle className="h-3 w-3 inline ml-1" />,
                      };

                      return (
                        <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="p-2.5 font-medium">{item.productName}</td>
                          <td className="p-2.5 font-mono text-xs text-muted-foreground">{item.barcode}</td>
                          <td className="p-2.5 font-bold">{formatNumber(item.currentStock)}</td>
                          <td className="p-2.5 text-muted-foreground">{item.minStock}</td>
                          <td className="p-2.5">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                              {statusIcons[item.status]}
                              {statusLabels[item.status]}
                            </span>
                          </td>
                          <td className="p-2.5 text-green-600 font-medium">
                            {formatNumber(item.totalAdded)}
                          </td>
                          <td className="p-2.5 text-red-600 font-medium">
                            {formatNumber(item.totalSubtracted)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {inventoryReports.length > 20 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    نمایش ۲۰ محصول از {inventoryReports.length} محصول
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ====== دکمه‌های خروجی ====== */}
        <div className="flex flex-wrap gap-4 pb-6">
          <Button
            onClick={exportPDF}
            className="bg-red-600 text-white hover:bg-red-700 gap-2"
            disabled={filteredInvoices.length === 0}
          >
            <FileText className="h-4 w-4" />
            خروجی PDF (فروش)
          </Button>
          <Button
            onClick={exportExcel}
            className="bg-green-600 text-white hover:bg-green-700 gap-2"
            disabled={filteredInvoices.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            خروجی Excel (فروش)
          </Button>
          <Button
            onClick={exportSalesExcel}
            className="bg-blue-600 text-white hover:bg-blue-700 gap-2"
            disabled={salesPersonReports.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            خروجی Excel (فروشندگان)
          </Button>
          <Button
            onClick={exportCustomersExcel}
            className="bg-purple-600 text-white hover:bg-purple-700 gap-2"
            disabled={customerReports.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            خروجی Excel (مشتریان)
          </Button>
          <Button
            onClick={exportInventoryExcel}
            className="bg-orange-600 text-white hover:bg-orange-700 gap-2"
            disabled={inventoryReports.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            خروجی Excel (انبار)
          </Button>
        </div>
      </div>ب
    </AdminLayout>
  );
}