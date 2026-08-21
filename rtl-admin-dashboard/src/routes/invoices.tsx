// src/routes/invoices.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Pencil, Loader2, AlertTriangle, CheckCircle2, X, Plus, Trash2, Printer } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataPagination } from "@/components/admin/DataPagination";
import { getInvoices, getInvoiceById, finalizeInvoice, updateInvoice, getProducts, getCustomers, deleteInvoice } from "@/services/api";
import InvoicePrint from "@/components/invoice/InvoicePrint"; // 🔥 اضافه شد

export const Route = createFileRoute("/invoices")({
  component: InvoicesPage,
});

type Status = "پیش‌نویس" | "نهایی" | "پرداخت" | "تسویه‌شده";

interface InvoiceRow {
  id: number;
  no: string;
  customer: string;
  customerId: number;
  seller: string;
  date: string;
  amount: string;
  status: Status;
}

const statusTone: Record<Status, string> = {
  "پیش‌نویس": "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  نهایی: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  پرداخت: "bg-green-100 text-green-700 hover:bg-green-100",
  "تسویه‌شده": "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
};

function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  // جزئیات فاکتور
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData] = useState<any>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // 🔥 چاپ فاکتور با InvoicePrint
  const [printOpen, setPrintOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);
  const [printLoading, setPrintLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // ویرایش فاکتور
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [editCustomerId, setEditCustomerId] = useState<number>(0);
  const [editItems, setEditItems] = useState<any[]>([]);
  const [editError, setEditError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedProductQty, setSelectedProductQty] = useState(1);

  // نهایی‌سازی
  const [finalizingId, setFinalizingId] = useState<number | null>(null);

  // ============================================
  // بارگذاری فاکتورها
  // ============================================
  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoices();
      
      const formatted = data.map((inv: any) => ({
        id: inv.id,
        no: inv.invoiceNumber,
        customer: inv.customer?.name || "نامشخص",
        customerId: inv.customer?.id || 0,
        seller: inv.salesUser?.fullName || "نامشخص",
        date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("fa-IR") : "-",
        amount: inv.finalAmount ? (inv.finalAmount / 10).toLocaleString("fa-IR") : "۰",
        status: inv.status === "draft" ? "پیش‌نویس" 
              : inv.status === "final" ? "نهایی" 
              : inv.status === "settled" ? "تسویه‌شده"
              : "پرداخت",
      }));
      
      setInvoices(formatted);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "خطا در بارگذاری فاکتورها");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🔥 بارگذاری داده‌های چاپ با InvoicePrint
  // ============================================
  const loadPrintData = async (id: number) => {
    try {
      setPrintLoading(true);
      const data = await getInvoiceById(id);
      setPrintData(data);
      setPrintOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در بارگذاری فاکتور برای چاپ");
    } finally {
      setPrintLoading(false);
    }
  };

  // ============================================
  // 🔥 تابع چاپ فاکتور با استفاده از InvoicePrint
  // ============================================
  const handlePrint = () => {
    if (!printData) return;

    const printContent = printRef.current?.innerHTML;
    if (!printContent) {
      setError('خطا در آماده‌سازی چاپ');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      setError('لطفاً pop-up را مجاز کنید');
      return;
    }

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>فاکتور ${printData.invoiceNumber}</title>
          <style>
            body { 
              font-family: 'Vazirmatn', Tahoma, sans-serif; 
              padding: 20px; 
              background: white;
              direction: rtl;
            }
            .invoice-print-container {
              max-width: 880px;
              margin: 0 auto;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-bottom: 2px solid #1a1a1a;
              padding-bottom: 10px;
              margin-bottom: 18px;
            }
            .invoice-title {
              font-size: 22px;
              font-weight: 900;
              color: #0a0a0a;
            }
            .invoice-title span {
              font-size: 14px;
              font-weight: 400;
              color: #4a4a4a;
            }
            .invoice-meta {
              font-size: 14px;
            }
            .invoice-meta div {
              margin-bottom: 2px;
            }
            .invoice-meta strong {
              font-weight: 700;
            }
            .customer-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr 1fr;
              gap: 8px 15px;
              background: #f7f7f7;
              padding: 10px 14px;
              border-radius: 6px;
              border: 1px solid #ddd;
              margin-bottom: 16px;
              font-size: 13px;
            }
            .customer-grid .field .label {
              font-size: 10px;
              font-weight: 700;
              color: #666;
              display: block;
            }
            .customer-grid .field .value {
              font-weight: 600;
              color: #0a0a0a;
              margin-top: 1px;
            }
            .customer-grid .field .value-line {
              border-bottom: 1.5px dashed #999;
              padding: 2px 4px;
              min-height: 24px;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #1a1a1a;
              margin-bottom: 14px;
              font-size: 13px;
            }
            .invoice-table th {
              background: #1a1a1a;
              color: white;
              font-weight: 700;
              padding: 8px 6px;
              text-align: center;
              border: 1px solid #1a1a1a;
              font-size: 12px;
            }
            .invoice-table td {
              padding: 6px 4px;
              text-align: center;
              border: 1px solid #1a1a1a;
              vertical-align: middle;
            }
            .totals-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              background: #f7f7f7;
              padding: 10px 14px;
              border-radius: 6px;
              border: 1px solid #ddd;
              margin-bottom: 16px;
              font-size: 14px;
            }
            .totals-grid .row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
            }
            .totals-grid .row .label {
              font-weight: 700;
            }
            .totals-grid .row .value {
              font-weight: 700;
            }
            .footer-note {
              text-align: center;
              font-size: 13px;
              background: #f7f7f7;
              padding: 10px;
              border-radius: 6px;
              border: 1px solid #ddd;
              margin-bottom: 14px;
            }
            .signature-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #ddd;
              padding-top: 12px;
              font-size: 14px;
            }
            .signature-row .seller {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .signature-row .seller .label {
              font-weight: 700;
            }
            .signature-row .seller .name {
              font-weight: 700;
              border-bottom: 2px solid #1a1a1a;
              padding: 0 8px 2px;
            }
            .previous-debt-section {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              padding: 8px 14px;
              border-radius: 6px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              font-weight: 700;
              font-size: 14px;
            }
            .previous-debt-section .label {
              color: #92400e;
            }
            .previous-debt-section .value {
              color: #b91c1c;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 120px;
              font-weight: 900;
              color: #7F8C8D;
              opacity: 0.08;
              letter-spacing: 15px;
              pointer-events: none;
              user-select: none;
              white-space: nowrap;
              z-index: 0;
            }
            @media print {
              body { margin: 0; padding: 20px; }
              .watermark {
                opacity: 0.06;
              }
            }
            @media (max-width: 650px) {
              .customer-grid {
                grid-template-columns: 1fr 1fr;
              }
              .invoice-header {
                flex-direction: column;
                align-items: flex-start;
              }
              .totals-grid {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-print-container">
            ${printContent}
          </div>
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

  // ============================================
  // بارگذاری داده‌های ویرایش
  // ============================================
  const loadEditData = async (id: number) => {
    try {
      setEditLoading(true);
      setEditError(null);
      
      const [prods, custs] = await Promise.all([
        getProducts(),
        getCustomers(),
      ]);
      setProducts(prods);
      setCustomers(custs);

      const data = await getInvoiceById(id);
      setEditData(data);
      setEditCustomerId(data.customerId);
      setEditItems(data.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || "نامشخص",
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discountType: item.discountType || "percentage",
        discountValue: Number(item.discountValue) || 0,
        discountPercentage: Number(item.discountPercentage) || 0,
        finalPrice: Number(item.finalPrice),
      })));
      setEditOpen(true);
    } catch (err: any) {
      setEditError(err.response?.data?.message || "خطا در بارگذاری داده‌ها");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================
  // ذخیره ویرایش فاکتور
  // ============================================
  const handleEditSubmit = async () => {
    if (!editData) return;
    if (editItems.length === 0) {
      setEditError("حداقل یک کالا باید وجود داشته باشد");
      return;
    }

    try {
      setEditLoading(true);
      setEditError(null);

      const payload = {
        customerId: editCustomerId,
        items: editItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discountType: "percentage",
          discountValue: Number(item.discountValue) || 0,
        })),
      };

      await updateInvoice(editData.id, payload);
      await loadInvoices();
      setEditOpen(false);
    } catch (err: any) {
      setEditError(err.response?.data?.message || "خطا در ویرایش فاکتور");
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================
  // مدیریت آیتم‌های ویرایش
  // ============================================
  const addEditItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    setEditItems([...editItems, {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      quantity: selectedProductQty,
      unitPrice: product.unitPrice,
      discountType: "percentage",
      discountValue: 0,
      discountPercentage: 0,
      finalPrice: product.unitPrice * selectedProductQty,
    }]);
    setSelectedProductId(0);
    setSelectedProductQty(1);
  };

  const removeEditItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const updateEditItem = (index: number, field: string, value: any) => {
    const newItems = [...editItems];
    newItems[index][field] = value;
    
    if (field === "quantity" || field === "unitPrice" || field === "discountValue") {
      const qty = Number(newItems[index].quantity);
      const price = Number(newItems[index].unitPrice);
      const discPercent = Number(newItems[index].discountValue) || 0;
      const totalPrice = qty * price;
      const discountAmount = (totalPrice * discPercent) / 100;
      newItems[index].finalPrice = totalPrice - discountAmount;
      newItems[index].discountPercentage = discPercent;
    }
    setEditItems(newItems);
  };

  // ============================================
  // جزئیات فاکتور
  // ============================================
  const openDetails = async (id: number) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setDetailsData(null);
    try {
      const data = await getInvoiceById(id);
      setDetailsData(data);
    } catch (err: any) {
      setDetailsError(err.response?.data?.message || err.message || "خطا در بارگذاری جزئیات فاکتور");
    } finally {
      setDetailsLoading(false);
    }
  };

  // ============================================
  // نهایی‌سازی فاکتور
  // ============================================
  const handleFinalize = async (id: number) => {
    if (!confirm("آیا از نهایی‌سازی این فاکتور مطمئن هستید؟")) return;
    try {
      setFinalizingId(id);
      await finalizeInvoice(id);
      await loadInvoices();
    } catch (err: any) {
      setError(err.message || "خطا در نهایی‌سازی فاکتور");
    } finally {
      setFinalizingId(null);
    }
  };

  // ============================================
  // حذف فاکتور
  // ============================================
  const handleDelete = async (inv: InvoiceRow) => {
    let confirmMessage = `آیا از حذف فاکتور "${inv.no}" مطمئن هستید؟`;
    if (inv.status !== "پیش‌نویس") {
      confirmMessage = `⚠️ هشدار: این فاکتور ${inv.status} است!\n\n${confirmMessage}\n\nتوجه: حذف این فاکتور بر روی موجودی انبار و گزارشات تأثیر خواهد داشت.`;
    }
    
    if (!confirm(confirmMessage)) return;
    
    try {
      await deleteInvoice(inv.id);
      await loadInvoices();
      alert(`✅ فاکتور "${inv.no}" با موفقیت حذف شد`);
    } catch (err: any) {
      alert(err.response?.data?.message || "خطا در حذف فاکتور");
    }
  };

  // ============================================
  // فیلتر و Pagination
  // ============================================
  useEffect(() => {
    loadInvoices();
  }, []);

  const filtered = invoices.filter(
    (i) =>
      (status === "all" || i.status === status) &&
      (i.no.includes(q) || i.customer.includes(q)),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const paginated = filtered.slice((page - 1) * 10, page * 10);

  if (loading) {
    return (
      <AdminLayout title="فاکتورها">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="فاکتورها">
      <Card>
        <CardContent className="p-5">
          {/* ========== فیلتر و جستجو ========== */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="جستجوی شماره فاکتور یا مشتری..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="پیش‌نویس">پیش‌نویس</SelectItem>
                  <SelectItem value="نهایی">نهایی</SelectItem>
                  <SelectItem value="پرداخت">پرداخت</SelectItem>
                  <SelectItem value="تسویه‌شده">تسویه‌شده</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ========== جدول فاکتورها ========== */}
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">شماره</TableHead>
                  <TableHead className="text-right">مشتری</TableHead>
                  <TableHead className="text-right">فروشنده</TableHead>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">مبلغ (تومان)</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      هیچ فاکتوری یافت نشد
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs">{inv.no}</TableCell>
                      <TableCell className="font-medium">{inv.customer}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.seller}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                      <TableCell className="font-semibold">{inv.amount}</TableCell>
                      <TableCell>
                        <Badge className={statusTone[inv.status]}>{inv.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {/* 🔥 چاپ با InvoicePrint */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1"
                            onClick={() => loadPrintData(inv.id)}
                          >
                            <Printer className="h-3.5 w-3.5" /> چاپ
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1"
                            onClick={() => openDetails(inv.id)}
                          >
                            <Eye className="h-3.5 w-3.5" /> جزئیات
                          </Button>

                          <Button
                            size="sm"
                            className={`h-8 gap-1 ${
                              inv.status === "پیش‌نویس"
                                ? "bg-[color:var(--danger)] text-white hover:bg-[color:var(--danger)]/90"
                                : "bg-orange-500 text-white hover:bg-orange-600"
                            }`}
                            onClick={() => handleDelete(inv)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> حذف
                          </Button>

                          {inv.status === "پیش‌نویس" && (
                            <>
                              <Button
                                size="sm"
                                className="h-8 gap-1 bg-[color:var(--info)] text-white hover:bg-[color:var(--info)]/90"
                                onClick={() => loadEditData(inv.id)}
                              >
                                <Pencil className="h-3.5 w-3.5" /> ویرایش
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 gap-1 bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90"
                                disabled={finalizingId === inv.id}
                                onClick={() => handleFinalize(inv.id)}
                              >
                                {finalizingId === inv.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                نهایی‌سازی
                              </Button>
                            </>
                          )}
                        </div>
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

      {/* ========== 🔥 دیالوگ چاپ فاکتور با InvoicePrint ========== */}
      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>چاپ فاکتور {printData?.invoiceNumber}</DialogTitle>
          </DialogHeader>

          {printLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : printData ? (
            <div>
              <div ref={printRef}>
                <InvoicePrint
                  invoiceNumber={printData.invoiceNumber}
                  customer={printData.customer || { id: 0, name: '', phone: '', nationalId: '', address: '' }}
                  items={printData.items || []}
                  subtotal={printData.totalAmount || 0}
                  totalDiscount={printData.totalDiscount || 0}
                  payable={printData.finalAmount || 0}
                  date={new Date(printData.createdAt).toLocaleDateString('fa-IR')}
                  sellerName={printData.salesUser?.fullName || 'شرکت حس شیمی'}
                  status={printData.status || 'draft'}
                  userRole="admin"
                  previousDebt={printData.previousDebt || 0}
                />
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setPrintOpen(false)}>
                  بستن
                </Button>
                <Button onClick={handlePrint} className="bg-blue-600 text-white hover:bg-blue-700">
                  <Printer className="h-4 w-4 ml-2" /> چاپ
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ========== دیالوگ جزئیات فاکتور ========== */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>جزئیات فاکتور</DialogTitle>
          </DialogHeader>

          {detailsLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}

          {detailsError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
              {detailsError}
            </div>
          )}

          {!detailsLoading && !detailsError && detailsData && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">شماره فاکتور: </span>
                  <span className="font-medium">{detailsData.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">تاریخ: </span>
                  <span className="font-medium">
                    {new Date(detailsData.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">مشتری: </span>
                  <span className="font-medium">{detailsData.customer?.name || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">فروشنده: </span>
                  <span className="font-medium">{detailsData.salesUser?.fullName || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">بدهی قبلی: </span>
                  <span className="font-medium text-red-600">
                    {detailsData.previousDebt ? (detailsData.previousDebt / 10).toLocaleString("fa-IR") : "۰"} تومان
                  </span>
                </div>
              </div>

              {Array.isArray(detailsData.items) && detailsData.items.length > 0 && (
                <div className="overflow-hidden rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-right">محصول</TableHead>
                        <TableHead className="text-right">تعداد</TableHead>
                        <TableHead className="text-right">قیمت واحد (ریال)</TableHead>
                        <TableHead className="text-right">تخفیف (%)</TableHead>
                        <TableHead className="text-right">جمع (ریال)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailsData.items.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{item.product?.name || item.productName || "-"}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{Number(item.unitPrice || 0).toLocaleString("fa-IR")}</TableCell>
                          <TableCell>{Number(item.discountPercentage || 0)}%</TableCell>
                          <TableCell className="font-medium">
                            {Number(item.finalPrice || 0).toLocaleString("fa-IR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">مبلغ نهایی</span>
                <span className="font-bold text-[color:var(--success)]">
                  {Number(detailsData.finalAmount || 0).toLocaleString("fa-IR")} ریال
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== دیالوگ ویرایش فاکتور ========== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ویرایش فاکتور {editData?.invoiceNumber}</DialogTitle>
          </DialogHeader>

          {editLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}

          {editError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
              {editError}
            </div>
          )}

          {!editLoading && editData && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">مشتری</Label>
                <Select value={String(editCustomerId)} onValueChange={(v) => setEditCustomerId(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب مشتری" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">اقلام فاکتور</Label>
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-muted-foreground pr-2">
                    <span className="col-span-2 text-right">نام محصول</span>
                    <span className="text-center">تعداد</span>
                    <span className="text-center">قیمت واحد (تومان)</span>
                    <span className="text-center">تخفیف (%)</span>
                    <span className="text-center">قیمت کل</span>
                  </div>

                  {editItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-6 gap-2 items-center p-2 border rounded-lg bg-gray-50">
                      <span className="col-span-2 text-sm font-medium truncate">{item.productName}</span>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateEditItem(index, "quantity", Number(e.target.value))}
                        className="w-full text-center"
                        dir="ltr"
                        min="1"
                      />
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateEditItem(index, "unitPrice", Number(e.target.value))}
                        className="w-full text-center"
                        dir="ltr"
                        min="0"
                      />
                      <Input
                        type="number"
                        value={item.discountValue}
                        onChange={(e) => updateEditItem(index, "discountValue", Number(e.target.value))}
                        className="w-full text-center"
                        dir="ltr"
                        min="0"
                        max="100"
                        placeholder="۰"
                      />
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-blue-600 text-center w-full">
                          {((item.quantity * item.unitPrice) - 
                            ((item.quantity * item.unitPrice) * (item.discountValue || 0) / 100)
                          ).toLocaleString("fa-IR")}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 h-8 w-8"
                          onClick={() => removeEditItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                  <Label className="text-sm font-semibold">افزودن کالا جدید</Label>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Select value={String(selectedProductId)} onValueChange={(v) => setSelectedProductId(Number(v))}>
                      <SelectTrigger className="flex-1 min-w-[150px]">
                        <SelectValue placeholder="انتخاب کالا" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name} - {p.unitPrice.toLocaleString("fa-IR")} تومان
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      <Label className="text-xs">تعداد:</Label>
                      <Input
                        type="number"
                        value={selectedProductQty}
                        onChange={(e) => setSelectedProductQty(Number(e.target.value))}
                        className="w-20 text-center"
                        dir="ltr"
                        min="1"
                      />
                    </div>
                    <Button onClick={addEditItem} className="bg-blue-600 text-white whitespace-nowrap">
                      <Plus className="h-4 w-4 ml-1" /> افزودن
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  انصراف
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  disabled={editLoading}
                  className="bg-primary text-primary-foreground"
                >
                  {editLoading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : "ذخیره تغییرات"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}