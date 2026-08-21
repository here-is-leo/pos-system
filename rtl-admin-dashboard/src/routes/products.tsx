// src/routes/products.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  XCircle,
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
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/services/api";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

// 🔥 اضافه کردن productCode به interface
interface Product {
  id: number;
  name: string;
  productCode: string; // 🔥 جدید
  barcode: string;
  unitPrice: number;    // به ریال - قیمت هر واحد (برای کارتن‌ها قیمت هر عدد)
  costPrice: number;    // به ریال
  stock: number;
  status: string;
  cartonSize?: number;
  pricePerCarton?: number; // به ریال - قیمت هر کارتن (محاسبه شده)
  unitType?: string;
}

// جلوگیری از تغییر عدد با اسکرول
const preventWheelScroll = (e: React.WheelEvent<HTMLInputElement>) => {
  e.preventDefault();
};

// ترجمه نوع واحد
const unitTypeLabels: Record<string, string> = {
  piece: 'بطری',
  carton: 'کارتن',
  liter: 'لیتر',
};

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🔥 اضافه کردن productCode به state
  const [formData, setFormData] = useState({
    name: "",
    productCode: "", // 🔥 جدید
    barcode: "",
    unitPrice: "",        // به تومان - قیمت هر واحد
    costPrice: "",        // به تومان
    stock: "",
    cartonSize: "",
    pricePerCarton: "",   // به تومان - قیمت هر کارتن (محاسبه خودکار)
    unitType: "piece" as "piece" | "carton" | "liter",
    isAvailable: true,
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts(search);
      setProducts(data);
      setTotalPages(Math.ceil(data.length / 10));
    } catch (err: any) {
      setError(err.message || "خطا در بارگذاری محصولات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const resetForm = () => {
    setFormData({
      name: "",
      productCode: "", // 🔥 جدید
      barcode: "",
      unitPrice: "",
      costPrice: "",
      stock: "",
      cartonSize: "",
      pricePerCarton: "",
      unitType: "piece",
      isAvailable: true,
    });
    setEditingProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    const unitType = product.unitType || 'piece';
    const isCarton = unitType === 'carton';
    
    // 🔥 تبدیل ریال به تومان برای نمایش در فرم (تقسیم بر ۱۰)
    const unitPriceInToman = product.unitPrice / 10;
    const costPriceInToman = product.costPrice / 10;
    const pricePerCartonInToman = product.pricePerCarton ? product.pricePerCarton / 10 : 0;
    
    setFormData({
      name: product.name,
      productCode: product.productCode || "", // 🔥 جدید
      barcode: product.barcode || "",
      unitPrice: String(unitPriceInToman),
      costPrice: String(costPriceInToman),
      stock: String(product.stock),
      cartonSize: isCarton ? String(product.cartonSize || '') : "",
      pricePerCarton: isCarton ? String(pricePerCartonInToman || unitPriceInToman * (product.cartonSize || 1)) : "",
      unitType: unitType as 'piece' | 'carton' | 'liter',
      isAvailable: product.stock > 0,
    });
    setIsDialogOpen(true);
  };

  // 🔥 محاسبه قیمت کارتن (به تومان)
  const calculateCartonPrice = () => {
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const cartonSize = parseFloat(formData.cartonSize) || 0;
    
    if (formData.unitType === "carton" && cartonSize > 0 && unitPrice > 0) {
      const pricePerCarton = unitPrice * cartonSize;
      setFormData(prev => ({
        ...prev,
        pricePerCarton: String(pricePerCarton),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        pricePerCarton: "",
      }));
    }
  };

  // 🔥 دریافت قیمت نهایی محصول (به ریال) - برای نمایش در جدول
  const getFinalPrice = (product: Product): number => {
    // اگر نوع کارتن است و pricePerCarton دارد، قیمت کارتن را برگردان
    if (product.unitType === 'carton' && product.pricePerCarton) {
      return product.pricePerCarton;
    }
    // اگر نوع کارتن است ولی pricePerCarton نداریم، محاسبه کن
    if (product.unitType === 'carton' && product.cartonSize) {
      return product.unitPrice * product.cartonSize;
    }
    // در غیر این صورت قیمت واحد را برگردان
    return product.unitPrice;
  };

  // 🔥 نمایش قیمت به تومان با جداکننده
  const displayPrice = (priceInRial: number): string => {
    const priceInToman = priceInRial / 10;
    return priceInToman.toLocaleString('fa-IR');
  };

  // دریافت نام محصول با نوع واحد
  const getProductDisplayName = (product: Product) => {
    const unitLabel = unitTypeLabels[product.unitType || 'piece'] || '';
    return `${product.name} (${unitLabel})`;
  };

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!formData.name.trim()) {
        setError("نام محصول الزامی است");
        return;
      }

      const unitPriceToman = parseFloat(formData.unitPrice) || 0;
      const costPriceToman = parseFloat(formData.costPrice) || 0;
      const cartonSize = parseFloat(formData.cartonSize) || 0;
      const stock = formData.isAvailable ? (parseFloat(formData.stock) || 0) : 0;

      // 🔥 محاسبه قیمت هر کارتن (اگر نوع کارتن باشد)
      let pricePerCartonToman = 0;
      if (formData.unitType === 'carton' && cartonSize > 0) {
        pricePerCartonToman = unitPriceToman * cartonSize;
      }

      const data = {
        name: formData.name.trim(),
        productCode: formData.productCode || undefined, // 🔥 جدید
        barcode: formData.barcode || undefined,
        unitPrice: unitPriceToman * 10,  // 🔥 قیمت هر واحد به ریال (همیشه قیمت واحد ذخیره می‌شود)
        costPrice: costPriceToman * 10,  // 🔥 تبدیل به ریال
        warehouseId: 1,
        minStock: 10,
        stock: stock,
        cartonSize: formData.unitType === "carton" ? cartonSize : null,
        pricePerCarton: formData.unitType === "carton" ? pricePerCartonToman * 10 : null, // 🔥 قیمت کارتن به ریال
        unitType: formData.unitType,
      };

      await createProduct(data);
      await loadProducts();
      resetForm();
      setIsDialogOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "خطا در ایجاد محصول";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    try {
      setIsSubmitting(true);
      setError(null);

      const unitPriceToman = parseFloat(formData.unitPrice) || 0;
      const costPriceToman = parseFloat(formData.costPrice) || 0;
      const cartonSize = parseFloat(formData.cartonSize) || 0;
      const stock = formData.isAvailable ? (parseFloat(formData.stock) || 0) : 0;

      // 🔥 محاسبه قیمت هر کارتن (اگر نوع کارتن باشد)
      let pricePerCartonToman = 0;
      if (formData.unitType === 'carton' && cartonSize > 0) {
        pricePerCartonToman = unitPriceToman * cartonSize;
      }

      const data = {
        name: formData.name.trim() || editingProduct.name,
        productCode: formData.productCode || undefined, // 🔥 جدید
        barcode: formData.barcode || undefined,
        unitPrice: unitPriceToman * 10,  // 🔥 قیمت هر واحد به ریال (همیشه قیمت واحد ذخیره می‌شود)
        costPrice: costPriceToman * 10,  // 🔥 تبدیل به ریال
        minStock: 10,
        stock: stock,
        cartonSize: formData.unitType === "carton" ? cartonSize : null,
        pricePerCarton: formData.unitType === "carton" ? pricePerCartonToman * 10 : null, // 🔥 قیمت کارتن به ریال
        unitType: formData.unitType,
      };

      await updateProduct(editingProduct.id, data);
      await loadProducts();
      resetForm();
      setIsDialogOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "خطا در ویرایش محصول";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`آیا از حذف محصول "${product.name}" مطمئن هستید؟`)) return;
    try {
      await deleteProduct(product.id);
      await loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || "خطا در حذف محصول");
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.includes(search) || 
    (p.productCode && p.productCode.includes(search)) || // 🔥 جستجو بر اساس productCode
    (p.barcode && p.barcode.includes(search))
  );

  const paginatedProducts = filteredProducts.slice((page - 1) * 10, page * 10);

  if (loading) {
    return (
      <AdminLayout title="محصولات">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="محصولات">
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجوی نام، کد کالا یا بارکد..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <Button
              onClick={openCreateDialog}
              className="bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90"
            >
              <Plus className="ml-1 h-4 w-4" /> محصول جدید
            </Button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">ردیف</TableHead>
                  <TableHead className="text-right">نام محصول</TableHead>
                  <TableHead className="text-right">کد کالا</TableHead> {/* 🔥 جدید */}
                  <TableHead className="text-right">بارکد</TableHead>
                  <TableHead className="text-right">قیمت فروش (تومان)</TableHead>
                  <TableHead className="text-right">قیمت تمام‌شده (تومان)</TableHead>
                  <TableHead className="text-right">موجودی</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      هیچ محصولی یافت نشد
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((p, i) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground">{i + 1 + (page - 1) * 10}</TableCell>
                      <TableCell className="font-medium">
                        {getProductDisplayName(p)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {p.productCode || "-"} {/* 🔥 جدید */}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.barcode || "-"}</TableCell>
                      <TableCell>
                        {/* 🔥 نمایش قیمت نهایی (برای کارتن‌ها قیمت کارتن) */}
                        {displayPrice(getFinalPrice(p))}
                        {/* 🔥 اگر کارتن است، قیمت هر واحد را هم نشان بده */}
                        {p.unitType === 'carton' && p.cartonSize && (
                          <span className="text-xs text-muted-foreground block">
                            (هر عدد: {displayPrice(p.unitPrice)})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{displayPrice(p.costPrice)}</TableCell>
                      <TableCell>{p.stock}</TableCell>
                      <TableCell>
                        {p.stock > 0 ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> موجود
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> ناموجود
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(p)}
                          >
                            <Pencil className="h-4 w-4 text-[color:var(--info)]" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleDelete(p)}
                          >
                            <Trash2 className="h-4 w-4 text-[color:var(--danger)]" />
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

      {/* ====== Dialog ====== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2 mt-2">
            {/* نام محصول */}
            <div>
              <Label className="text-sm font-semibold">نام محصول</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: مایع دستشویی 250 گرم "
                className="mt-0.5 py-1.5 text-sm"
              />
            </div>

            {/* 🔥 کد کالا - جدید */}
            <div>
              <Label className="text-sm font-semibold">کد کالا</Label>
              <p className="text-xs text-muted-foreground -mt-0.5">اختیاری - یکتا</p>
              <Input
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                placeholder="مثال: PRD-001"
                dir="ltr"
                className="mt-0.5 py-1.5 text-sm"
              />
            </div>

            {/* بارکد */}
            <div>
              <Label className="text-sm font-semibold">بارکد</Label>
              <p className="text-xs text-muted-foreground -mt-0.5">اختیاری</p>
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="بارکد کالا"
                dir="ltr"
                className="mt-0.5 py-1.5 text-sm"
              />
            </div>

            {/* نوع واحد با کمبو باکس */}
            <div>
              <Label className="text-sm font-semibold">نوع واحد</Label>
              <Select
                value={formData.unitType}
                onValueChange={(value: 'piece' | 'carton' | 'liter') => {
                  setFormData(prev => ({
                    ...prev,
                    unitType: value,
                    pricePerCarton: "",
                    cartonSize: value === 'carton' ? prev.cartonSize : "",
                  }));
                  setTimeout(() => calculateCartonPrice(), 50);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="انتخاب نوع واحد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piece">بطری</SelectItem>
                  <SelectItem value="carton">کارتن</SelectItem>
                  <SelectItem value="liter">لیتر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* تعداد در کارتن - فقط برای کارتن */}
            {formData.unitType === "carton" && (
              <div>
                <Label className="text-sm font-semibold">تعداد در کارتن</Label>
                <Input
                  type="number"
                  value={formData.cartonSize}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData(prev => ({ ...prev, cartonSize: e.target.value }));
                    if (val > 0 && formData.unitPrice) {
                      calculateCartonPrice();
                    }
                  }}
                  onWheel={preventWheelScroll}
                  placeholder="مثال: ۱۲"
                  dir="ltr"
                  className="mt-0.5 py-1.5 text-sm"
                />
              </div>
            )}

            {/* قیمت هر واحد */}
            <div>
              <Label className="text-sm font-semibold">
                قیمت هر واحد
              </Label>
              <p className="text-xs text-muted-foreground -mt-0.5">واحد: تومان</p>
              <Input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => {
                  setFormData({ ...formData, unitPrice: e.target.value });
                  if (formData.unitType === "carton" && formData.cartonSize) {
                    calculateCartonPrice();
                  }
                }}
                onWheel={preventWheelScroll}
                placeholder="مثال: ۱۵۰۰۰۰"
                dir="ltr"
                className="mt-0.5 py-1.5 text-sm"
              />
            </div>

            {/* نمایش قیمت کارتن - فقط برای کارتن */}
            {formData.unitType === "carton" && formData.pricePerCarton && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600">💰 قیمت هر کارتن (محاسبه شده):</p>
                <p className="text-lg font-bold text-blue-600">
                  {Number(formData.pricePerCarton).toLocaleString("fa-IR")} تومان
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formData.cartonSize} عدد × {Number(formData.unitPrice).toLocaleString("fa-IR")} تومان
                </p>
              </div>
            )}

            {/* قیمت تمام‌شده */}
            <div>
              <Label className="text-sm font-semibold">قیمت تمام‌شده</Label>
              <p className="text-xs text-muted-foreground -mt-0.5">واحد: تومان</p>
              <Input
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                onWheel={preventWheelScroll}
                placeholder="مثال: ۱۵۰۰"
                dir="ltr"
                className="mt-0.5 py-1.5 text-sm"
              />
            </div>

            {/* وضعیت موجود/ناموجود */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Label className="text-sm font-semibold block mb-2">وضعیت موجودی</Label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAvailable: true })}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    formData.isAvailable
                      ? 'bg-green-100 text-green-700 border-2 border-green-500'
                      : 'bg-gray-100 text-gray-500 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  موجود
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAvailable: false })}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    !formData.isAvailable
                      ? 'bg-red-100 text-red-700 border-2 border-red-500'
                      : 'bg-gray-100 text-gray-500 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <XCircle className="h-4 w-4" />
                  ناموجود
                </button>
              </div>
            </div>

            {/* موجودی */}
            {formData.isAvailable && (
              <div>
                <Label className="text-sm font-semibold">موجودی</Label>
                <p className="text-xs text-muted-foreground -mt-0.5">واحد: عدد</p>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  onWheel={preventWheelScroll}
                  placeholder="مثال: ۵۰"
                  dir="ltr"
                  className="mt-0.5 py-1.5 text-sm"
                />
              </div>
            )}

            {!formData.isAvailable && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                <p className="text-sm text-red-600">⚠️ محصول ناموجود است و موجودی آن صفر خواهد بود</p>
              </div>
            )}

            {editingProduct && (
              <div className="bg-gray-50 p-2 rounded-lg space-y-0.5 text-xs mt-1">
                <p className="text-muted-foreground text-[10px]">اطلاعات فعلی:</p>
                <div className="grid grid-cols-2 gap-0.5 text-sm">
                  <span className="text-muted-foreground">کد کالا:</span>
                  <span className="font-semibold text-left">{editingProduct.productCode || "-"}</span>
                  <span className="text-muted-foreground">قیمت هر واحد:</span>
                  <span className="font-semibold text-left">{displayPrice(editingProduct.unitPrice)} تومان</span>
                  {editingProduct.unitType === 'carton' && (
                    <>
                      <span className="text-muted-foreground">قیمت هر کارتن:</span>
                      <span className="font-semibold text-left">{displayPrice(getFinalPrice(editingProduct))} تومان</span>
                    </>
                  )}
                  <span className="text-muted-foreground">قیمت تمام‌شده:</span>
                  <span className="font-semibold text-left">{displayPrice(editingProduct.costPrice)} تومان</span>
                  <span className="text-muted-foreground">موجودی:</span>
                  <span className="font-semibold text-left">{editingProduct.stock.toLocaleString("fa-IR")} عدد</span>
                  <span className="text-muted-foreground">نوع واحد:</span>
                  <span className="font-semibold text-left">{unitTypeLabels[editingProduct.unitType || 'piece']}</span>
                  {editingProduct.cartonSize && (
                    <>
                      <span className="text-muted-foreground">تعداد در کارتن:</span>
                      <span className="font-semibold text-left">{editingProduct.cartonSize} عدد</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={editingProduct ? handleUpdate : handleCreate}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : "ذخیره"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}