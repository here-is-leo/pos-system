// src/routes/customers.tsx

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
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  Users,
  UserPlus,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  TrendingUp,
  User
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataPagination } from "@/components/admin/DataPagination";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getInvoices } from "@/services/api";

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
});

interface Customer {
  id: number;
  name: string;
  phone: string;
  nationalId: string;
  address: string;
  totalPurchases: number;
  purchaseCount: number;
  lastPurchaseDate: string | null;
}

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nationalId: "",
    address: "",
  });

  // آمار
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalPurchases: 0,
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [customersData, invoicesData] = await Promise.all([
        getCustomers(search),
        getInvoices(),
      ]);

      const customerPurchaseCount = new Map<number, number>();
      const customerTotalAmount = new Map<number, number>();
      const customerLastPurchase = new Map<number, string>();

      invoicesData.forEach((inv: any) => {
        const customerId = inv.customer?.id;
        if (customerId) {
          customerPurchaseCount.set(
            customerId,
            (customerPurchaseCount.get(customerId) || 0) + 1
          );
          customerTotalAmount.set(
            customerId,
            (customerTotalAmount.get(customerId) || 0) + (inv.finalAmount || 0)
          );
          if (inv.createdAt) {
            const existing = customerLastPurchase.get(customerId);
            if (!existing || new Date(inv.createdAt) > new Date(existing)) {
              customerLastPurchase.set(customerId, inv.createdAt);
            }
          }
        }
      });

      const enrichedCustomers = customersData.map((c: any) => ({
        ...c,
        purchaseCount: customerPurchaseCount.get(c.id) || 0,
        totalPurchases: customerTotalAmount.get(c.id) || 0,
        lastPurchaseDate: customerLastPurchase.get(c.id) || null,
      }));

      setCustomers(enrichedCustomers);
      setTotalPages(Math.ceil(enrichedCustomers.length / 10));

      // محاسبه آمار
      const total = enrichedCustomers.length;
      const active = enrichedCustomers.filter(c => c.purchaseCount > 0).length;
      const totalPurchases = enrichedCustomers.reduce((sum, c) => sum + c.totalPurchases, 0);

      setStats({ total, active, totalPurchases });
    } catch (err: any) {
      setError(err.message || "خطا در بارگذاری مشتریان");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      nationalId: "",
      address: "",
    });
    setEditingCustomer(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      nationalId: customer.nationalId || "",
      address: customer.address || "",
    });
    setIsDialogOpen(true);
  };

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.name.trim()) {
        setError("نام مشتری الزامی است");
        return;
      }

      await createCustomer({
        name: formData.name,
        phone: formData.phone || undefined,
        nationalId: formData.nationalId || undefined,
        address: formData.address || undefined,
      });

      await loadCustomers();
      resetForm();
      setIsDialogOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "خطا در ایجاد مشتری";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCustomer) return;
    try {
      setIsSubmitting(true);
      setError(null);

      await updateCustomer(editingCustomer.id, {
        name: formData.name,
        phone: formData.phone || undefined,
        nationalId: formData.nationalId || undefined,
        address: formData.address || undefined,
      });

      await loadCustomers();
      resetForm();
      setIsDialogOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "خطا در ویرایش مشتری";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (customer.purchaseCount > 0) {
      if (!confirm(`⚠️ این مشتری ${customer.purchaseCount} خرید داشته است.\n\nآیا از حذف "${customer.name}" مطمئن هستید؟`)) return;
    } else {
      if (!confirm(`آیا از حذف مشتری "${customer.name}" مطمئن هستید؟`)) return;
    }
    try {
      await deleteCustomer(customer.id);
      await loadCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || "خطا در حذف مشتری");
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.includes(search) ||
    c.phone.includes(search) ||
    c.nationalId.includes(search)
  );

  const paginatedCustomers = filteredCustomers.slice((page - 1) * 10, page * 10);

  if (loading) {
    return (
      <AdminLayout title="مشتریان">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="مشتریان">
      {/* ====== کارت‌های آماری ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">کل مشتریان</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">مشتریان فعال</p>
              <p className="text-2xl font-bold text-green-900">{stats.active}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-green-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">مجموع خرید</p>
              <p className="text-2xl font-bold text-purple-900">
                {(stats.totalPurchases / 10).toLocaleString('fa-IR')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-purple-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 font-medium">میانگین خرید</p>
              <p className="text-2xl font-bold text-amber-900">
                {stats.active > 0 ? ((stats.totalPurchases / stats.active) / 10).toLocaleString('fa-IR') : '۰'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-amber-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ====== جستجو و اقدامات ====== */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجو در نام، تلفن یا شناسه ملی..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <Button
              onClick={openCreateDialog}
              className="bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90 gap-2"
            >
              <Plus className="h-4 w-4" /> مشتری جدید
            </Button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ====== جدول مشتریان ====== */}
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">مشتری</TableHead>
                  <TableHead className="text-right">تلفن</TableHead>
                  <TableHead className="text-right">شناسه ملی</TableHead>
                  <TableHead className="text-right">تعداد خرید</TableHead>
                  <TableHead className="text-right">آخرین خرید</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>هیچ مشتریی یافت نشد</p>
                      <p className="text-sm mt-1">با جستجوی دیگر یا افزودن مشتری جدید شروع کنید</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCustomers.map((c) => (
                    <TableRow key={c.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{c.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {c.phone}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{c.nationalId || "-"}</TableCell>
                      <TableCell>
                        {c.purchaseCount > 0 ? (
                          <Badge className="bg-blue-100 text-blue-700">
                            {c.purchaseCount} خرید
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-400">
                            بدون خرید
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.lastPurchaseDate ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(c.lastPurchaseDate).toLocaleDateString('fa-IR')}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => openEditDialog(c)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(c)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* ====== دیالوگ افزودن/ویرایش مشتری ====== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {editingCustomer ? "ویرایش مشتری" : "افزودن مشتری جدید"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-semibold">نام کامل</Label>
              <div className="relative mt-1">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="نام و نام خانوادگی"
                  className="pr-9"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">شماره تلفن</Label>
              <div className="relative mt-1">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="۰۹۱۲..."
                  dir="ltr"
                  className="pr-9"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">شناسه ملی</Label>
              <Input
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                placeholder="کد ملی"
                dir="ltr"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">آدرس</Label>
              <div className="relative mt-1">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="آدرس کامل"
                  className="pr-9"
                />
              </div>
            </div>

            {editingCustomer && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                <p className="text-gray-500">اطلاعات مشتری:</p>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <span className="text-gray-500">تعداد خرید:</span>
                  <span className="font-semibold text-blue-600">{editingCustomer.purchaseCount}</span>
                  <span className="text-gray-500">آخرین خرید:</span>
                  <span className="font-semibold">
                    {editingCustomer.lastPurchaseDate 
                      ? new Date(editingCustomer.lastPurchaseDate).toLocaleDateString('fa-IR') 
                      : '-'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={editingCustomer ? handleUpdate : handleCreate}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground gap-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}