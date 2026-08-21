// rtl-admin-dashboard/src/routes/index.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  UserPlus,
  Boxes,
  FileText,
  TrendingUp,
  AlertTriangle,
  Package,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getProducts, getCustomers, getInvoices, getInventory, getNegativeStock } from "@/services/api";
import { formatTomanNumber } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalInvoices: 0,
    todaySales: 0,
    todayInvoices: 0,
    totalStock: 0,
  });
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [negativeStock, setNegativeStock] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNegativeStock, setShowNegativeStock] = useState(false);

  // ============================================
  // 🔥 بررسی نقش و هدایت
  // ============================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = user.role;

        if (role === "sales") {
          window.location.href = "http://localhost:3000";
          return;
        }
        if (role === "warehouse") {
          window.location.href = "http://localhost:3001";
          return;
        }
      } catch (error) {
        console.error("خطا در خواندن اطلاعات کاربر:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }
    } else {
      window.location.href = "/login";
      return;
    }
  }, []);

  // ============================================
  // بارگذاری داده‌ها (فقط برای ادمین)
  // ============================================
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const [products, customers, invoices, inventoryData, negativeData] = await Promise.all([
          getProducts(),
          getCustomers(),
          getInvoices(),
          getInventory(),
          getNegativeStock(),
        ]);

        // 🔥 موجودی منفی
        setNegativeStock(negativeData);

        // 🔥 محاسبه موجودی کل
        const totalStock = inventoryData.reduce((sum: number, item: any) => {
          const qty = Number(item.quantity) || 0;
          return sum + qty;
        }, 0);

        // محاسبه فروش کل
        const totalSales = invoices.reduce((sum: number, inv: any) => {
          const amount = inv.finalAmount || 0;
          return sum + Number(amount);
        }, 0);

        // محاسبه فروش امروز
        const today = new Date().toDateString();
        const todayInvoices = invoices.filter((inv: any) => {
          const invDate = new Date(inv.createdAt).toDateString();
          return invDate === today;
        });
        const todaySales = todayInvoices.reduce((sum: number, inv: any) => {
          return sum + Number(inv.finalAmount || 0);
        }, 0);

        // ۵ مشتری برتر
        const customerMap = new Map();
        invoices.forEach((inv: any) => {
          const customerId = inv.customer?.id;
          const customerName = inv.customer?.name || "مشتری ناشناس";
          const amount = Number(inv.finalAmount || 0);

          if (customerMap.has(customerId)) {
            const existing = customerMap.get(customerId);
            customerMap.set(customerId, {
              id: customerId,
              name: customerName,
              total: existing.total + amount,
              count: existing.count + 1,
            });
          } else {
            customerMap.set(customerId, {
              id: customerId,
              name: customerName,
              total: amount,
              count: 1,
            });
          }
        });

        const sortedCustomers = Array.from(customerMap.values())
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
          .map(c => ({
            name: c.name,
            purchases: c.count,
            total: c.total.toLocaleString("fa-IR"),
          }));

        setTopCustomers(sortedCustomers);

        // محصولات کم‌موجود
        const low = products
          .filter((p: any) => p.stock < 10 && p.stock >= 0)
          .slice(0, 5)
          .map((p: any) => ({
            name: p.name,
            stock: p.stock,
            min: 10,
          }));
        setLowStock(low);

        // داده‌های نمودار (۷ روز اخیر)
        const days = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
        const dayMap = new Map();
        days.forEach(d => dayMap.set(d, 0));

        const todayDate = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(todayDate);
          date.setDate(date.getDate() - i);
          const dayName = days[(date.getDay() + 1) % 7];

          const dayInvoices = invoices.filter((inv: any) => {
            const invDate = new Date(inv.createdAt);
            return invDate.toDateString() === date.toDateString();
          });

          const dayTotal = dayInvoices.reduce((sum: number, inv: any) => {
            return sum + Number(inv.finalAmount || 0);
          }, 0);

          dayMap.set(dayName, Math.round(dayTotal / 1000000));
        }

        const chartData = days.map(day => ({
          day,
          sales: dayMap.get(day) || 0,
        }));
        setSalesData(chartData);

        // 🔥 تنظیم stats با totalStock
        setStats({
          totalSales: Math.round(totalSales),
          totalCustomers: customers.length || 0,
          totalProducts: products.length || 0,
          totalInvoices: invoices.length || 0,
          todaySales: Math.round(todaySales),
          todayInvoices: todayInvoices.length,
          totalStock: Math.round(totalStock),
        });

        setLoading(false);
      } catch (err: any) {
        console.error("خطا در بارگذاری داده‌ها:", err);
        setError(err.message || "خطا در ارتباط با سرور");
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="داشبورد">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">در حال بارگذاری داده‌ها...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="داشبورد">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="داشبورد">
      <div className="space-y-6">
        {/* کارت‌های آمار */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">فروش امروز</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {stats.todaySales.toLocaleString("fa-IR")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">تومان</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[color:var(--info)]/10 text-[color:var(--info)]">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-[color:var(--success)]" />
                <span className="text-muted-foreground">{stats.todayInvoices} فاکتور امروز</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">کل مشتریان</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalCustomers}</p>
                  <p className="mt-1 text-xs text-muted-foreground">ثبت‌شده</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[color:var(--success)]/10 text-[color:var(--success)]">
                  <UserPlus className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">کل محصولات</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalProducts}</p>
                  <p className="mt-1 text-xs text-muted-foreground">قلم کالا</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[color:var(--warning)]/10 text-[color:var(--warning)]">
                  <Boxes className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">موجودی کل انبار</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {stats.totalStock.toLocaleString("fa-IR")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">عدد</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[color:var(--info)]/10 text-[color:var(--info)]">
                  <Package className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🔥 بخش هشدار موجودی منفی */}
        {negativeStock.length > 0 && (
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-red-700">
                <AlertCircle className="h-5 w-5" />
                هشدار: موجودی منفی
                <Badge className="bg-red-600 text-white">
                  {negativeStock.length} محصول
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-auto text-red-600 border-red-300 hover:bg-red-100"
                  onClick={() => setShowNegativeStock(!showNegativeStock)}
                >
                  {showNegativeStock ? 'مشاهده کمتر' : 'مشاهده همه'}
                </Button>
              </CardTitle>
            </CardHeader>
            {showNegativeStock && (
              <CardContent>
                <div className="overflow-hidden rounded-md border border-red-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-red-100/50">
                        <TableHead className="text-right">نام محصول</TableHead>
                        <TableHead className="text-right">بارکد</TableHead>
                        <TableHead className="text-right">موجودی فعلی</TableHead>
                        <TableHead className="text-right">انبار</TableHead>
                        <TableHead className="text-right">آخرین بروزرسانی</TableHead>
                        <TableHead className="text-right">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {negativeStock.map((item: any) => (
                        <TableRow key={item.id} className="bg-red-50/30">
                          <TableCell className="font-medium text-red-700">
                            {item.product?.name || 'نامشخص'}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {item.product?.barcode || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-red-600 text-white">
                              {Number(item.quantity).toLocaleString('fa-IR')}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.product?.warehouse?.name || '-'}</TableCell>
                          <TableCell className="text-xs">
                            {new Date(item.lastUpdated).toLocaleDateString('fa-IR')}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-blue-600"
                              onClick={() => window.location.href = '/inventory'}
                            >
                              <Eye className="h-3.5 w-3.5" /> مدیریت موجودی
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* نمودار فروش */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">نمودار فروش ۷ روز اخیر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontFamily: "inherit",
                    }}
                    formatter={(v: number) => [`${v}M تومان`, "فروش"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--color-info)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--color-info)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* مشتریان برتر و هشدارها */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">۵ مشتری برتر</CardTitle>
            </CardHeader>
            <CardContent>
              {topCustomers.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm">هنوز مشتری و فاکتوری ثبت نشده</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">مشتری</TableHead>
                      <TableHead className="text-right">تعداد خرید</TableHead>
                      <TableHead className="text-right">مجموع (ریال)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map((c) => (
                      <TableRow key={c.name}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.purchases}</TableCell>
                        <TableCell className="text-[color:var(--success)] font-semibold">
                          {c.total}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-[color:var(--danger)]" />
                هشدارهای موجودی کم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.length === 0 && negativeStock.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm">
                  ✅ همه محصولات موجودی کافی دارند
                </p>
              ) : (
                <>
                  {/* موجودی منفی - اولویت بالاتر */}
                  {negativeStock.slice(0, 3).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-red-200 bg-red-50/50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-red-700">
                          {item.product?.name || 'نامشخص'}
                        </p>
                        <p className="text-xs text-red-500">
                          ⚠️ موجودی منفی: {Number(item.quantity).toLocaleString('fa-IR')} عدد
                        </p>
                      </div>
                      <Badge className="bg-red-600 text-white">
                        {Number(item.quantity).toLocaleString('fa-IR')}
                      </Badge>
                    </div>
                  ))}
                  
                  {/* موجودی کم */}
                  {lowStock.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between rounded-md border border-border bg-[color:var(--danger)]/5 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">حداقل موجودی: {p.min}</p>
                      </div>
                      <Badge className="bg-[color:var(--danger)] text-white hover:bg-[color:var(--danger)]">
                        {p.stock} عدد
                      </Badge>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}