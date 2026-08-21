// src/routes/customer-settlement.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Wallet, 
  AlertTriangle, 
  History, 
  User,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  CreditCard,
  ShieldCheck,
  Clock
} from "lucide-react";
import { 
  getCustomersWithDebt, 
  createPayment, 
  CustomerDebt,
  getCustomerPayments,
  PaymentTransaction
} from "@/services/api";
import { formatToman, formatTomanNumber, formatDate } from "@/lib/utils";

export const Route = createFileRoute("/customer-settlement")({
  component: CustomerSettlementPage,
});

function CustomerSettlementPage() {
  const [customers, setCustomers] = useState<CustomerDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // دیالوگ تسویه
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDebt | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerDebt['invoices'][0] | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'transfer' | 'check'>('cash');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [quickAmounts, setQuickAmounts] = useState<number[]>([0]);

  // دیالوگ تاریخچه پرداخت
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<PaymentTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState<CustomerDebt | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomersWithDebt();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || "خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.includes(search) || (c.phone && c.phone.includes(search))
  );

  const totalDebt = filteredCustomers.reduce((sum, c) => sum + c.totalDebt, 0);
  const totalCustomers = filteredCustomers.length;

  // باز کردن دیالوگ تسویه
  const openSettlement = (customer: CustomerDebt, invoice?: CustomerDebt['invoices'][0]) => {
    setSelectedCustomer(customer);
    setSelectedInvoice(invoice || null);
    setPaymentAmount(invoice ? invoice.remainingDebt : customer.totalDebt);
    
    const debt = invoice ? invoice.remainingDebt : customer.totalDebt;
    const quick = [];
    if (debt > 0) {
      quick.push(Math.round(debt * 0.25));
      quick.push(Math.round(debt * 0.5));
      quick.push(Math.round(debt * 0.75));
      quick.push(debt);
    }
    setQuickAmounts(quick);
    
    setError(null);
    setSettlementOpen(true);
  };

  const handleSettlement = async () => {
    if (!selectedInvoice) {
      setError("لطفاً یک فاکتور انتخاب کنید");
      return;
    }
    if (paymentAmount <= 0) {
      setError("مبلغ پرداختی باید بیشتر از صفر باشد");
      return;
    }
    if (paymentAmount > selectedInvoice.remainingDebt) {
      setError(`مبلغ پرداختی (${formatTomanNumber(paymentAmount)}) بیشتر از بدهی (${formatTomanNumber(selectedInvoice.remainingDebt)}) است`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await createPayment({
        invoiceId: selectedInvoice.id,
        amount: paymentAmount,
        paymentType,
        description: paymentDescription || undefined,
      });

      await loadData();
      setSettlementOpen(false);
      setSelectedCustomer(null);
      setSelectedInvoice(null);
      setPaymentAmount(0);
      setPaymentDescription('');
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ثبت پرداخت");
    } finally {
      setSubmitting(false);
    }
  };

  const openHistory = async (customer: CustomerDebt) => {
    setHistoryCustomer(customer);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const data = await getCustomerPayments(customer.id);
      setHistoryData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="تسویه مشتریان">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="تسویه مشتریان">
      {/* ====== کارت‌های آماری ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">کل مشتریان</p>
              <p className="text-2xl font-bold text-blue-900">{totalCustomers}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">مجموع بدهی</p>
              <p className="text-2xl font-bold text-red-900">{formatTomanNumber(totalDebt)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-red-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">میانگین بدهی</p>
              <p className="text-2xl font-bold text-green-900">
                {totalCustomers > 0 ? formatTomanNumber(totalDebt / totalCustomers) : '۰'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">فاکتورهای باز</p>
              <p className="text-2xl font-bold text-purple-900">
                {filteredCustomers.reduce((sum, c) => sum + c.invoices.length, 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-700" />
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
                placeholder="جستجوی مشتری..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                {filteredCustomers.length} مشتری
              </Badge>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ====== لیست مشتریان ====== */}
          <div className="space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>هیچ مشتری با بدهی یافت نشد</p>
                <p className="text-sm mt-1">همه مشتریان تسویه حساب خود را انجام داده‌اند</p>
              </div>
            ) : (
              filteredCustomers.map((c) => (
                <Card 
                  key={c.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 font-bold text-lg">
                            {c.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{c.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {c.phone || '-'}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {c.invoices.length} فاکتور
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">بدهی کل</p>
                          <p className="text-lg font-bold text-red-600">
                            {formatTomanNumber(c.totalDebt)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="gap-1 bg-green-600 text-white hover:bg-green-700"
                          onClick={() => openSettlement(c)}
                        >
                          <Wallet className="h-4 w-4" /> تسویه
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => openHistory(c)}
                        >
                          <History className="h-4 w-4" /> تاریخچه
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ====== دیالوگ تسویه حساب ====== */}
      <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              تسویه حساب مشتری
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              {/* اطلاعات مشتری */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {selectedCustomer.phone || 'تلفن ثبت نشده'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">مجموع بدهی:</span>
                    <span className="font-bold text-red-600">
                      {formatTomanNumber(selectedCustomer.totalDebt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* انتخاب فاکتور */}
              <div>
                <Label className="text-sm font-semibold">انتخاب فاکتور</Label>
                <Select
                  value={selectedInvoice?.id?.toString() || ''}
                  onValueChange={(val) => {
                    const inv = selectedCustomer.invoices.find(i => i.id === Number(val));
                    setSelectedInvoice(inv || null);
                    setPaymentAmount(inv?.remainingDebt || 0);
                    const debt = inv?.remainingDebt || 0;
                    const quick = [];
                    if (debt > 0) {
                      quick.push(Math.round(debt * 0.25));
                      quick.push(Math.round(debt * 0.5));
                      quick.push(Math.round(debt * 0.75));
                      quick.push(debt);
                    }
                    setQuickAmounts(quick);
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="انتخاب فاکتور..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCustomer.invoices.map((inv) => (
                      <SelectItem key={inv.id} value={String(inv.id)}>
                        {inv.invoiceNumber} - {formatTomanNumber(inv.remainingDebt)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInvoice && (
                <>
                  {/* اطلاعات فاکتور - بدون وضعیت */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {selectedInvoice.invoiceNumber}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {formatDate(selectedInvoice.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">مبلغ کل:</span>
                        <span className="font-semibold">{formatTomanNumber(selectedInvoice.finalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">پرداخت شده:</span>
                        <span className="font-semibold text-green-600">
                          {formatTomanNumber(selectedInvoice.totalPaid || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-gray-700">بدهی باقیمانده:</span>
                        <span className="text-red-600">
                          {formatTomanNumber(selectedInvoice.remainingDebt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* مبالغ سریع */}
                  {quickAmounts.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold">مبالغ پیشنهادی</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {quickAmounts.map((amount, index) => (
                          <button
                            key={index}
                            onClick={() => setPaymentAmount(amount)}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          >
                            {formatTomanNumber(amount)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* مبلغ پرداختی */}
                  <div>
                    <Label className="text-sm font-semibold">مبلغ پرداختی (تومان)</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        className="text-right pl-8"
                        dir="ltr"
                        min={0}
                        max={selectedInvoice.remainingDebt}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      حداکثر: {formatTomanNumber(selectedInvoice.remainingDebt)}
                    </p>
                  </div>

                  {/* نوع پرداخت */}
                  <div>
                    <Label className="text-sm font-semibold">نوع پرداخت</Label>
                    <Select value={paymentType} onValueChange={(v: any) => setPaymentType(v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <span>💰</span> نقدی
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <span>💳</span> کارت
                          </div>
                        </SelectItem>
                        <SelectItem value="transfer">
                          <div className="flex items-center gap-2">
                            <span>🏦</span> انتقال بانکی
                          </div>
                        </SelectItem>
                        <SelectItem value="check">
                          <div className="flex items-center gap-2">
                            <span>📄</span> چک
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* توضیحات */}
                  <div>
                    <Label className="text-sm font-semibold">توضیحات (اختیاری)</Label>
                    <Input
                      value={paymentDescription}
                      onChange={(e) => setPaymentDescription(e.target.value)}
                      placeholder="توضیحات..."
                      className="mt-1"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* خلاصه پرداخت */}
                  {paymentAmount > 0 && (
                    <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">مبلغ پرداختی:</span>
                        <span className="font-bold text-green-600">
                          {formatTomanNumber(paymentAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">بدهی پس از پرداخت:</span>
                        <span className="font-bold text-red-600">
                          {formatTomanNumber(selectedInvoice.remainingDebt - paymentAmount)}
                        </span>
                      </div>
                    </div>
                  )}

                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setSettlementOpen(false)}>
                      انصراف
                    </Button>
                    <Button
                      onClick={handleSettlement}
                      disabled={submitting || paymentAmount <= 0 || !selectedInvoice}
                      className="bg-green-600 text-white hover:bg-green-700 flex-1"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4 ml-2" />
                          ثبت پرداخت
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ====== دیالوگ تاریخچه پرداخت ====== */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              تاریخچه پرداخت - {historyCustomer?.name}
            </DialogTitle>
          </DialogHeader>

          {historyLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>هیچ پرداختی برای این مشتری ثبت نشده است</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">تاریخ</TableHead>
                    <TableHead className="text-right">فاکتور</TableHead>
                    <TableHead className="text-right">مبلغ (تومان)</TableHead>
                    <TableHead className="text-right">نوع</TableHead>
                    <TableHead className="text-right">ثبت‌کننده</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.map((p) => (
                    <TableRow key={p.id} className="hover:bg-gray-50">
                      <TableCell className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        {formatDate(p.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.invoice?.invoiceNumber || '-'}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatTomanNumber(p.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {p.paymentType === 'cash' ? 'نقدی' :
                           p.paymentType === 'card' ? 'کارت' :
                           p.paymentType === 'transfer' ? 'انتقال' : 'چک'}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.user?.fullName || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              بستن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}