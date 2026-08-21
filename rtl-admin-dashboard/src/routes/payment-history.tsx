// src/routes/payment-history.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Search, 
  Download, 
  FileSpreadsheet, 
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  X,
  CreditCard,
  Wallet,
  Landmark,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { DataPagination } from "@/components/admin/DataPagination";
import { getAllPayments, getCustomers, PaymentTransaction, Customer } from "@/services/api";
import { formatTomanNumber, formatDateTime } from "@/lib/utils";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Route = createFileRoute("/payment-history")({
  component: PaymentHistoryPage,
});

function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // فیلترها
  const [filters, setFilters] = useState({
    customerId: '',
    paymentType: 'all',
    startDate: '',
    endDate: '',
  });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState<'excel' | 'pdf' | null>(null);

  // آمار
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    avgAmount: 0,
    todayPayments: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [paymentsData, customersData] = await Promise.all([
        getAllPayments({
          customerId: filters.customerId ? Number(filters.customerId) : undefined,
          paymentType: filters.paymentType !== 'all' ? filters.paymentType : undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        }),
        getCustomers(),
      ]);

      setPayments(paymentsData);
      setCustomers(customersData);
      
      const total = paymentsData.length;
      const totalAmount = paymentsData.reduce((sum, p) => sum + p.amount, 0);
      const avg = total > 0 ? Math.round(totalAmount / total) : 0;
      
      const today = new Date().toDateString();
      const todayCount = paymentsData.filter(p => 
        new Date(p.createdAt).toDateString() === today
      ).length;

      setStats({
        totalPayments: total,
        totalAmount,
        avgAmount: avg,
        todayPayments: todayCount,
      });

      setTotalPages(Math.max(1, Math.ceil(paymentsData.length / 10)));
    } catch (err: any) {
      setError(err.message || "خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const filteredPayments = payments.filter(p => {
    const customerName = p.customer?.name || '';
    const invoiceNumber = p.invoice?.invoiceNumber || '';
    return customerName.includes(search) || invoiceNumber.includes(search);
  });

  const paginated = filteredPayments.slice((page - 1) * 10, page * 10);

  // ============================================
  // 📊 خروجی Excel
  // ============================================
  const exportToExcel = () => {
    try {
      setExportLoading('excel');
      
      const excelData = filteredPayments.map((p) => ({
        'تاریخ': formatDateTime(p.createdAt),
        'مشتری': p.customer?.name || '-',
        'شماره فاکتور': p.invoice?.invoiceNumber || '-',
        'مبلغ (ریال)': p.amount,
        'نوع پرداخت': p.paymentType === 'cash' ? 'نقدی' :
                      p.paymentType === 'card' ? 'کارت' :
                      p.paymentType === 'transfer' ? 'انتقال بانکی' :
                      p.paymentType === 'check' ? 'چک' : p.paymentType,
        'ثبت‌کننده': p.user?.fullName || '-',
        'توضیحات': p.description || '-',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // تنظیم عرض ستون‌ها
      const colWidths = [
        { wch: 20 }, // تاریخ
        { wch: 25 }, // مشتری
        { wch: 20 }, // شماره فاکتور
        { wch: 20 }, // مبلغ
        { wch: 15 }, // نوع پرداخت
        { wch: 20 }, // ثبت‌کننده
        { wch: 30 }, // توضیحات
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'پرداختی‌ها');
      
      const fileName = `پرداختی_مشتریان_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      setExportLoading(null);
    } catch (error) {
      console.error('خطا در خروجی Excel:', error);
      setError('خطا در ایجاد فایل Excel');
      setExportLoading(null);
    }
  };

  // ============================================
  // 📄 خروجی PDF
  // ============================================
  const exportToPDF = () => {
    try {
      setExportLoading('pdf');
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // تنظیم فونت (پشتیبانی از فارسی)
      // توجه: برای فونت فارسی باید از فونت مناسب استفاده کنید
      // اینجا از فونت پیش‌فرض استفاده می‌کنیم

      // هدر
      doc.setFontSize(18);
      doc.text('گزارش پرداختی مشتریان', 14, 20);
      
      doc.setFontSize(10);
      const dateStr = new Date().toLocaleDateString('fa-IR');
      doc.text(`تاریخ گزارش: ${dateStr}`, 14, 28);
      
      // اطلاعات خلاصه
      const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
      doc.setFontSize(10);
      doc.text(`تعداد تراکنش‌ها: ${filteredPayments.length}`, 14, 35);
      doc.text(`مجموع مبلغ: ${totalAmount.toLocaleString('fa-IR')} تومان`, 80, 35);

      // داده‌های جدول
      const tableData = filteredPayments.map((p) => [
        formatDateTime(p.createdAt),
        p.customer?.name || '-',
        p.invoice?.invoiceNumber || '-',
        p.amount.toLocaleString('fa-IR'),
        p.paymentType === 'cash' ? 'نقدی' :
        p.paymentType === 'card' ? 'کارت' :
        p.paymentType === 'transfer' ? 'انتقال' :
        p.paymentType === 'check' ? 'چک' : p.paymentType,
        p.user?.fullName || '-',
        p.description || '-',
      ]);

      autoTable(doc, {
        head: [[
          'تاریخ',
          'مشتری',
          'شماره فاکتور',
          'مبلغ (تومان)',
          'نوع پرداخت',
          'ثبت‌کننده',
          'توضیحات'
        ]],
        body: tableData,
        startY: 42,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          halign: 'right',
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 9,
          halign: 'right',
        },
        alternateRowStyles: {
          fillColor: [240, 245, 250],
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 35 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20 },
          5: { cellWidth: 30 },
          6: { cellWidth: 40 },
        },
        didDrawPage: function(data) {
          // فوتر
          doc.setFontSize(8);
          doc.text(
            `تولید شده در ${new Date().toLocaleString('fa-IR')}`,
            14,
            doc.internal.pageSize.height - 10
          );
        }
      });

      const fileName = `پرداختی_مشتریان_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      setExportLoading(null);
    } catch (error) {
      console.error('خطا در خروجی PDF:', error);
      setError('خطا در ایجاد فایل PDF');
      setExportLoading(null);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'cash': return <Wallet className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'transfer': return <Landmark className="h-4 w-4" />;
      case 'check': return <FileSpreadsheet className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case 'cash': return 'نقدی';
      case 'card': return 'کارت';
      case 'transfer': return 'انتقال بانکی';
      case 'check': return 'چک';
      default: return type;
    }
  };

  const resetFilters = () => {
    setFilters({
      customerId: '',
      paymentType: 'all',
      startDate: '',
      endDate: '',
    });
    setSearch('');
  };

  if (loading) {
    return (
      <AdminLayout title="پرداختی مشتریان">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="پرداختی مشتریان">
      {/* ====== کارت‌های آماری ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">تعداد تراکنش‌ها</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalPayments}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">مجموع پرداختی</p>
              <p className="text-2xl font-bold text-green-900">{formatTomanNumber(stats.totalAmount)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">میانگین هر تراکنش</p>
              <p className="text-2xl font-bold text-purple-900">{formatTomanNumber(stats.avgAmount)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 font-medium">پرداخت امروز</p>
              <p className="text-2xl font-bold text-amber-900">{stats.todayPayments}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ====== فیلترها و جستجو ====== */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجو در نام مشتری یا شماره فاکتور..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                فیلترها
                {Object.values(filters).some(v => v !== '' && v !== 'all') && (
                  <Badge className="bg-blue-600 text-white ml-1">!</Badge>
                )}
              </Button>
              <Button variant="outline" className="gap-1" onClick={loadData}>
                <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                بروزرسانی
              </Button>
            </div>
          </div>

          {/* پنل فیلترها */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">فیلترهای پیشرفته</h4>
                <button
                  onClick={resetFilters}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> پاک کردن همه
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <Label className="text-sm">مشتری</Label>
                  <Select
                    value={filters.customerId}
                    onValueChange={(v) => setFilters({ ...filters, customerId: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="همه مشتریان" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">همه مشتریان</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">نوع پرداخت</Label>
                  <Select
                    value={filters.paymentType}
                    onValueChange={(v) => setFilters({ ...filters, paymentType: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="همه" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه</SelectItem>
                      <SelectItem value="cash">نقدی</SelectItem>
                      <SelectItem value="card">کارت</SelectItem>
                      <SelectItem value="transfer">انتقال بانکی</SelectItem>
                      <SelectItem value="check">چک</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">از تاریخ</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">تا تاریخ</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ====== خلاصه اطلاعات ====== */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                تعداد تراکنش: <span className="font-bold text-gray-700">{filteredPayments.length}</span>
              </span>
              <span className="text-sm text-gray-500">
                مجموع: <span className="font-bold text-green-600">
                  {formatTomanNumber(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
                </span>
              </span>
            </div>
            <div className="flex gap-2">
              {/* 🔥 دکمه خروجی Excel */}
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                onClick={exportToExcel}
                disabled={exportLoading === 'excel' || filteredPayments.length === 0}
              >
                {exportLoading === 'excel' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                خروجی Excel
              </Button>
              
              {/* 🔥 دکمه خروجی PDF */}
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                onClick={exportToPDF}
                disabled={exportLoading === 'pdf' || filteredPayments.length === 0}
              >
                {exportLoading === 'pdf' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                خروجی PDF
              </Button>
            </div>
          </div>

          {/* ====== جدول تراکنش‌ها ====== */}
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">مشتری</TableHead>
                  <TableHead className="text-right">فاکتور</TableHead>
                  <TableHead className="text-right">مبلغ (تومان)</TableHead>
                  <TableHead className="text-right">نوع پرداخت</TableHead>
                  <TableHead className="text-right">ثبت‌کننده</TableHead>
                  <TableHead className="text-right">توضیحات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>هیچ تراکنشی یافت نشد</p>
                      <p className="text-sm mt-1">با تغییر فیلترها ممکن است نتیجه‌ای پیدا شود</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((p) => (
                    <TableRow key={p.id} className="hover:bg-gray-50/50">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{formatDateTime(p.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{p.customer?.name || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{p.invoice?.invoiceNumber || '-'}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatTomanNumber(p.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {getPaymentIcon(p.paymentType)}
                          {getPaymentLabel(p.paymentType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.user?.fullName || '-'}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-muted-foreground">
                        {p.description || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DataPagination page={page} onChange={setPage} totalPages={totalPages} />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}