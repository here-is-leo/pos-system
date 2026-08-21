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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataPagination } from "@/components/admin/DataPagination";
import { getUsers, createUser, updateUser, deleteUser, type User } from "@/services/api";

export const Route = createFileRoute("/users")({
  component: UsersPage,
});

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ====== دیالوگ‌ها ======
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    password: "",
    role: "sales" as "admin" | "sales" | "warehouse" | "sales_admin",
    isActive: true,
  });

  // ====== بارگذاری کاربران ======
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
      setTotalPages(Math.ceil(data.length / 10));
    } catch (err: any) {
      setError(err.message || "خطا در بارگذاری کاربران");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ====== مدیریت فرم ======
  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      password: "",
      role: "sales",
      isActive: true,
    });
    setEditingUser(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      phone: user.phone,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  };

  // ====== عملیات CRUD ======
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // اعتبارسنجی ساده
      if (!formData.fullName.trim()) {
        setError("نام کامل الزامی است");
        return;
      }
      if (!formData.phone.trim()) {
        setError("شماره تلفن الزامی است");
        return;
      }
      if (!editingUser && !formData.password) {
        setError("رمز عبور برای کاربر جدید الزامی است");
        return;
      }

      if (editingUser) {
        // ویرایش
        const updateData: any = {
          fullName: formData.fullName,
          role: formData.role,
          isActive: formData.isActive,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateUser(editingUser.id, updateData);
      } else {
        // ایجاد
        await createUser({
          fullName: formData.fullName,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          isActive: formData.isActive,
        });
      }

      await loadUsers();
      resetForm();
      setIsDialogOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || "خطا در ذخیره کاربر";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`آیا از حذف کاربر "${user.fullName}" مطمئن هستید؟`)) return;
    try {
      await deleteUser(user.id);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "خطا در حذف کاربر");
    }
  };

  // ====== فیلتر و Pagination ======
  const filteredUsers = users.filter(u =>
    u.fullName.includes(search) || u.phone.includes(search)
  );

  const paginatedUsers = filteredUsers.slice((page - 1) * 10, page * 10);

  const roleLabel: Record<string, string> = {
    admin: "ادمین",
    sales: "فروش",
    warehouse: "انبار",
    sales_admin: "فروش(ادمین)",
  };

  const roleTone: Record<string, string> = {
    admin: "bg-[color:var(--danger)]/15 text-[color:var(--danger)]",
    sales: "bg-[color:var(--info)]/15 text-[color:var(--info)]",
    warehouse: "bg-[color:var(--warning)]/20 text-[color:var(--warning)]",
    sales_admin: "bg-[color:var(--success)]/20 text-[color:var(--success)]",
  };

  if (loading) {
    return (
      <AdminLayout title="کاربران">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="کاربران">
      <Card>
        <CardContent className="p-5">
          {/* ====== Header ====== */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجو در نام یا تلفن..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <Button
              onClick={openCreateDialog}
              className="bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90"
            >
              <Plus className="ml-1 h-4 w-4" /> کاربر جدید
            </Button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* ====== Table ====== */}
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">تلفن</TableHead>
                  <TableHead className="text-right">نقش</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      هیچ کاربری یافت نشد
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.fullName}</TableCell>
                      <TableCell className="font-mono text-xs">{u.phone}</TableCell>
                      <TableCell>
                        <Badge className={roleTone[u.role] || "bg-muted"}>
                          {roleLabel[u.role] || u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.isActive ? (
                          <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)] hover:bg-[color:var(--success)]/15">
                            فعال
                          </Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground hover:bg-muted">
                            غیرفعال
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(u)}
                          >
                            <Pencil className="h-4 w-4 text-[color:var(--info)]" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleDelete(u)}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "ویرایش کاربر" : "افزودن کاربر جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>نام کامل</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="نام و نام خانوادگی"
              />
            </div>
            <div>
              <Label>تلفن</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="۰۹۱۲..."
                dir="ltr"
              />
            </div>
            <div>
              <Label>
                {editingUser ? "رمز عبور جدید (اختیاری)" : "رمز عبور"}
              </Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? "برای تغییر وارد کنید" : "رمز عبور"}
                dir="ltr"
              />
            </div>
            <div>
              <Label>نقش</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نقش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">ادمین</SelectItem>
                  <SelectItem value="sales">فروش</SelectItem>
                  <SelectItem value="warehouse">انبار</SelectItem>
                  <SelectItem value="sales_admin">فروش(ادمین)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isActive" className="text-sm font-normal">
                فعال
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={handleSubmit}
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