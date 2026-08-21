// src/routes/inventory.tsx

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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Plus, 
  Minus, 
  AlertTriangle, 
  Package,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { DataPagination } from "@/components/admin/DataPagination";
import { getInventory, addInventory, subtractInventory } from "@/services/api";
import { formatTomanNumber } from "@/lib/utils";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
});

interface InventoryItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    barcode?: string;
    unitPrice: number;
    costPrice: number;
  };
  quantity: number;
  lastUpdated: string;
  updatedByUser?: {
    fullName: string;
  };
}

function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // حالت‌های افزودن موجودی
  const [addOpen, setAddOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("adjustment");
  const [submitting, setSubmitting] = useState(false);

  // حالت‌های کسر موجودی
  const [subtractOpen, setSubtractOpen] = useState(false);
  const [subtractQuantity, setSubtractQuantity] = useState<number>(1);
  const [subtractReason, setSubtractReason] = useState<string>("adjustment");
  const [subtractSubmitting, setSubtractSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventory();
      setItems(data);
      setTotalPages(Math.max(1, Math.ceil(data.length / 10)));
    } catch (err: any) {
      setError(err.message || "خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = items.filter(item =>
    item.product.name.includes(search) ||
    (item.product.barcode && item.product.barcode.includes(search))
  );

  const paginatedItems = filteredItems.slice((page - 1) * 10, page * 10);

  // محاسبه آمار
  const totalProducts = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(item => item.quantity < 10);
  const outOfStockItems = items.filter(item => item.quantity === 0);

  // ============================================
  // افزودن موجودی
  // ============================================
  const handleAddStock = async () => {
    if (!selectedProduct) return;
    if (quantity <= 0) {
      setError("تعداد باید بیشتر از صفر باشد");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await addInventory({
        productId: selectedProduct.productId,
        quantity,
        reason,
      });
      await loadData();
      setAddOpen(false);
      setSelectedProduct(null);
      setQuantity(1);
      setReason("adjustment");
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در افزودن موجودی");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // کسر موجودی
  // ============================================
  const handleSubtractStock = async () => {
    if (!selectedProduct) return;
    if (subtractQuantity <= 0) {
      setError("تعداد باید بیشتر از صفر باشد");
      return;
    }
    if (subtractQuantity > selectedProduct.quantity) {
      setError(`موجودی کافی نیست. موجودی فعلی: ${selectedProduct.quantity}`);
      return;
    }

    try {
      setSubtractSubmitting(true);
      setError(null);
      await subtractInventory({
        productId: selectedProduct.productId,
        quantity: subtractQuantity,
        reason: subtractReason,
      });
      await loadData();
      setSubtractOpen(false);
      setSelectedProduct(null);
      setSubtractQuantity(1);
      setSubtractReason("adjustment");
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در کسر موجودی");
    } finally {
      setSubtractSubmitting(false);
    }
  };

  // ============================================
  // باز کردن مودال‌ها
  // ============================================
  const openAddModal = (item: InventoryItem) => {
    setSelectedProduct(item);
    setQuantity(1);
    setReason("adjustment");
    setError(null);
    setAddOpen(true);
  };

  const openSubtractModal = (item: InventoryItem) => {
    setSelectedProduct(item);
    setSubtractQuantity(1);
    setSubtractReason("adjustment");
    setError(null);
    setSubtractOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout title="مدیریت موجودی">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="مدیریت موجودی">
      {/* ====== کارت‌های آماری ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">کل محصولات</p>
              <p className="text-2xl font-bold text-blue-900">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">کل موجودی</p>
              <p className="text-2xl font-bold text-green-900">{totalStock.toLocaleString('fa-IR')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">کم‌موجود</p>
              <p className="text-2xl font-bold text-yellow-900">{lowStockItems.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">تمام‌شده</p>
              <p className="text-2xl font-bold text-red-900">{outOfStockItems.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ====== جستجو ====== */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجوی محصول..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ====== جدول موجودی ====== */}
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">نام محصول</TableHead>
                  <TableHead className="text-right">بارکد</TableHead>
                  <TableHead className="text-right">قیمت (تومان)</TableHead>
                  <TableHead className="text-right">موجودی</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      هیچ محصولی یافت نشد
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item) => {
                    const stock = item.quantity;
                    let statusColor = "bg-green-100 text-green-700";
                    let statusText = "موجود";
                    if (stock === 0) {
                      statusColor = "bg-red-100 text-red-700";
                      statusText = "تمام‌شده";
                    } else if (stock < 10) {
                      statusColor = "bg-yellow-100 text-yellow-700";
                      statusText = "کم‌موجود";
                    }

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell className="font-mono text-xs">{item.product.barcode || "-"}</TableCell>
                        <TableCell>{formatTomanNumber(item.product.unitPrice)}</TableCell>
                        <TableCell className="font-bold">{stock.toLocaleString('fa-IR')}</TableCell>
                        <TableCell>
                          <Badge className={statusColor}>{statusText}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {/* 🔥 دکمه افزودن موجودی */}
                            <Button
                              size="sm"
                              className="h-8 gap-1 bg-green-600 text-white hover:bg-green-700"
                              onClick={() => openAddModal(item)}
                            >
                              <Plus className="h-3.5 w-3.5" /> افزودن
                            </Button>
                            {/* 🔥 دکمه کسر موجودی */}
                            <Button
                              size="sm"
                              className="h-8 gap-1 bg-red-600 text-white hover:bg-red-700"
                              onClick={() => openSubtractModal(item)}
                              disabled={stock === 0}
                            >
                              <Minus className="h-3.5 w-3.5" /> کسر
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <DataPagination page={page} onChange={setPage} totalPages={totalPages} />
        </CardContent>
      </Card>

      {/* ====== دیالوگ افزودن موجودی ====== */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <Plus className="h-5 w-5" /> افزودن موجودی
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="font-semibold">{selectedProduct.product.name}</p>
                <p className="text-sm text-gray-500">
                  موجودی فعلی: {selectedProduct.quantity.toLocaleString('fa-IR')} عدد
                </p>
              </div>

              <div>
                <Label>تعداد افزودن</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mt-1 text-center"
                  dir="ltr"
                  min={1}
                />
              </div>

              <div>
                <Label>دلیل افزایش</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">تولید جدید</SelectItem>
                    <SelectItem value="adjustment">ورود کالا به انبار</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>
                  انصراف
                </Button>
                <Button
                  onClick={handleAddStock}
                  disabled={submitting || quantity <= 0}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : "افزودن"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ====== دیالوگ کسر موجودی ====== */}
      <Dialog open={subtractOpen} onOpenChange={setSubtractOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Minus className="h-5 w-5" /> کسر موجودی
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="font-semibold">{selectedProduct.product.name}</p>
                <p className="text-sm text-gray-500">
                  موجودی فعلی: {selectedProduct.quantity.toLocaleString('fa-IR')} عدد
                </p>
              </div>

              <div>
                <Label>تعداد کسر</Label>
                <Input
                  type="number"
                  value={subtractQuantity}
                  onChange={(e) => setSubtractQuantity(Number(e.target.value))}
                  className="mt-1 text-center"
                  dir="ltr"
                  min={1}
                  max={selectedProduct.quantity}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  حداکثر: {selectedProduct.quantity.toLocaleString('fa-IR')} عدد
                </p>
              </div>

              <div>
                <Label>دلیل کاهش</Label>
                <Select value={subtractReason} onValueChange={setSubtractReason}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adjustment">اصلاح موجودی</SelectItem>
                    <SelectItem value="damage">ضایعات / خرابی</SelectItem>
                    <SelectItem value="return">بازگشت از مشتری</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {subtractQuantity > 0 && subtractQuantity <= selectedProduct.quantity && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    موجودی پس از کسر: {(selectedProduct.quantity - subtractQuantity).toLocaleString('fa-IR')} عدد
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setSubtractOpen(false)}>
                  انصراف
                </Button>
                <Button
                  onClick={handleSubtractStock}
                  disabled={subtractSubmitting || subtractQuantity <= 0 || subtractQuantity > selectedProduct.quantity}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {subtractSubmitting ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : "کسر موجودی"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}