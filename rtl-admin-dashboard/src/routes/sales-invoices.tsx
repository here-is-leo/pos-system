import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Eye, 
  Loader2, 
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
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
import { getSalesInvoices, getSalesStats, getUsers } from "@/services/api";

export const Route = createFileRoute("/sales-invoices")({
  component: SalesInvoicesPage,
});

const statusLabel: Record<string, string> = {
  draft: "پیش‌نویس",
  final: "نهایی",
  paid: "پرداخت",
};

const statusTone: Record<string, string> = {
  draft: "bg-muted text-muted-foreground hover:bg-muted",
  final: "bg-[color:var(--info)]/15 text-[color:var(--info)] hover:bg-[color:var(--info)]/15",
  paid: "bg-[color:var(--success)]/15 text-[color:var(--success)] hover:bg-[color:var(--success)]/15",
};

function SalesInvoicesPage() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [salesStats, setSalesStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("1. دریافت لیست کاربران...");
      const users = await getUsers();
      console.log("✅ کاربران دریافت شدند:", users);
      
      const salesUsersData = users.filter((u: any) => u.role === 'sales');
      console.log("✅ فروشنده‌ها:", salesUsersData);
      setSalesUsers(salesUsersData);

      console.log("2. دریافت آمار فروشندگان...");
      try {
        const stats = await getSalesStats();
        console.log("✅ آمار دریافت شد:", stats);
        setSalesStats(stats);
      } catch (err: any) {
        console.log("❌ خطا در دریافت آمار:", err);
        setSalesStats([]);
      }

      if (salesUsersData.length > 0) {
        const firstUserId = salesUsersData[0].id;
        console.log("3. انتخاب فروشنده اول:", firstUserId);
        setSelectedUserId(firstUserId);
        await loadInvoices(firstUserId);
      } else {
        console.log("⚠️ هیچ فروشنده‌ای یافت نشد");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("❌ خطا در loadData:", err);
      setError(err.message || "خطا در بارگذاری داده‌ها");
      setLoading(false);
    }
  };

  const loadInvoices = async (userId: number) => {
    if (!userId) {
      console.log("❌ userId معتبر نیست");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`4. دریافت فاکتورهای فروشنده ${userId}...`);
      const data = await getSalesInvoices(userId);
      console.log(`✅ ${data?.length || 0} فاکتور دریافت شد:`, data);
      setInvoices(data || []);
      setTotalPages(Math.ceil((data?.length || 0) / 10));
    } catch (err: any) {
      console.error("❌ خطا در loadInvoices:", err);
      setError(err.response?.data?.message || err.message || "خطا در بارگذاری فاکتورها");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadInvoices(selectedUserId);
    }
  }, [selectedUserId]);

  const formatPrice = (amount: number) => {
    return Math.round(amount / 10).toLocaleString("fa-IR");
  };

  const filteredInvoices = (invoices || []).filter((inv: any) => {
    const matchesSearch = inv.invoiceNumber?.includes(q) || inv.customer?.name?.includes(q);
    const matchesStatus = status === "all" || inv.status === status;
    return matchesSearch && matchesStatus;
  });

  const paginatedInvoices = filteredInvoices.slice((page - 1) * 10, page * 10);

  if (loading && salesUsers.length === 0) {
    return (
      <AdminLayout title="فاکتورهای فروشندگان">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  // 🔥 اگر فروشنده‌ای وجود نداشت
  if (salesUsers.length === 0) {
    return (
      <AdminLayout title="فاکتورهای فروشندگان">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">هیچ فروشنده‌ای در سیستم ثبت نشده است</p>
            <p className="text-xs text-muted-foreground mt-2">برای مشاهده فاکتورها، ابتدا یک کاربر با نقش فروش ایجاد کنید</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="فاکتورهای فروشندگان">
      <div className="space-y-4">
        {/* انتخاب فروشنده */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Label className="text-sm font-semibold whitespace-nowrap">انتخاب فروشنده:</Label>
              <Select
                value={String(selectedUserId)}
                onValueChange={(v) => setSelectedUserId(Number(v))}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="انتخاب فروشنده" />
                </SelectTrigger>
                <SelectContent>
                  {salesUsers.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.fullName} - {user.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* کارت‌های آمار */}
        {salesStats.length > 0 && selectedUserId && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {salesStats
              .filter((stat: any) => stat.userId === selectedUserId)
              .map((stat: any) => (
                <Card key={stat.userId} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">فروش کل</p>
                        <p className="text-lg font-bold">{formatPrice(stat.totalSales)} تومان</p>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>{stat.totalInvoices} فاکتور</span>
                      <span>{stat.todayInvoices} امروز</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* جدول فاکتورها */}
        <Card>
          <CardContent className="p-5">
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
                    <SelectItem value="draft">پیش‌نویس</SelectItem>
                    <SelectItem value="final">نهایی</SelectItem>
                    <SelectItem value="paid">پرداخت</SelectItem>
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

            <div className="overflow-hidden rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-right">شماره</TableHead>
                    <TableHead className="text-right">مشتری</TableHead>
                    <TableHead className="text-right">تاریخ</TableHead>
                    <TableHead className="text-right">مبلغ (تومان)</TableHead>
                    <TableHead className="text-right">وضعیت</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        هیچ فاکتوری یافت نشد
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedInvoices.map((inv: any) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs">{inv.invoiceNumber}</TableCell>
                        <TableCell className="font-medium">{inv.customer?.name || "نامشخص"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(inv.createdAt).toLocaleDateString("fa-IR")}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(inv.finalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusTone[inv.status] || "bg-muted"}>
                            {statusLabel[inv.status] || inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1"
                            onClick={() => {
                              setDetailsData(inv);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" /> جزئیات
                          </Button>
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

        {/* دیالوگ جزئیات */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>جزئیات فاکتور</DialogTitle>
            </DialogHeader>
            {detailsData && (
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
                </div>

                {detailsData.items?.length > 0 && (
                  <div className="overflow-hidden rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-right">محصول</TableHead>
                          <TableHead className="text-right">تعداد</TableHead>
                          <TableHead className="text-right">قیمت واحد</TableHead>
                          <TableHead className="text-right">جمع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailsData.items.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{item.product?.name || "-"}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                            <TableCell className="font-medium">
                              {formatPrice(item.finalPrice)}
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
                    {formatPrice(detailsData.finalAmount)} تومان
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
      </div>
    </AdminLayout>
  );
}