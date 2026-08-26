// components/invoice/InvoiceHistory.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Printer, Eye, Clock, CheckCircle, FileText, Search } from 'lucide-react';
import { formatToman, formatTomanNumber, formatDate } from '@/lib/utils';
import { getCurrentUser } from '@/services/api';
import InvoicePrint from './InvoicePrint'; // 🔥 اضافه شد

interface InvoiceHistoryItem {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    nationalId: string;
    address: string;
  };
  date: string;
  createdAt: string;
  totalAmount: number;
  totalDiscount: number;
  finalAmount: number;
  status: 'draft' | 'final' | 'paid' | 'settled';
  commission: number;
  items: any[];
  salesUser: {
    id: number;
    fullName: string;
  };
}

interface InvoiceHistoryProps {
  userId: number;
}

export default function InvoiceHistory({ userId }: InvoiceHistoryProps) {
  const [invoices, setInvoices] = useState<InvoiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'final' | 'paid' | 'settled'>('all');
  const [printingInvoice, setPrintingInvoice] = useState<InvoiceHistoryItem | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const currentUser = getCurrentUser();
  const userRole = currentUser?.role || 'sales';
  const isSalesAdmin = userRole === 'sales_admin';

  useEffect(() => {
    loadInvoices();
  }, [userId]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/invoices/sales/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      const formattedInvoices = data.data?.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer?.name || 'مشتری ناشناس',
        customer: inv.customer || { id: 0, name: 'مشتری ناشناس', phone: '', nationalId: '', address: '' },
        date: new Date(inv.createdAt).toLocaleDateString('fa-IR'),
        createdAt: inv.createdAt,
        totalAmount: Number(inv.totalAmount),
        totalDiscount: Number(inv.totalDiscount),
        finalAmount: Number(inv.finalAmount),
        status: inv.status,
        commission: Number(inv.finalAmount) * 0.04,
        items: inv.items || [],
        salesUser: inv.salesUser || { id: 0, fullName: 'فروشنده' },
      })) || [];

      setInvoices(formattedInvoices);
    } catch (error) {
      console.error('خطا در دریافت فاکتورها:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🔥 تابع چاپ با استفاده از InvoicePrint
  // ============================================
  const handlePrint = (invoice: InvoiceHistoryItem) => {
    setPrintingInvoice(invoice);
    
    // کمی تاخیر برای رندر شدن
    setTimeout(() => {
      const printContent = printRef.current?.innerHTML;
      if (!printContent) {
        console.error('خطا در آماده‌سازی چاپ');
        return;
      }

      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('لطفاً pop-up را مجاز کنید');
        return;
      }

      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>فاکتور ${invoice.invoiceNumber}</title>
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
              .debt-section {
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
              .debt-section .label {
                color: #92400e;
              }
              .debt-section .value {
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
            ${printContent}
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
      
      setPrintingInvoice(null);
    }, 300);
  };

  const renderInvoiceCard = (inv: InvoiceHistoryItem) => {
    const isDraft = inv.status === 'draft';
    const showWatermark = isDraft && !isSalesAdmin;

    return (
      <div
        key={inv.id}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden"
      >
        {showWatermark && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] pointer-events-none select-none"
            style={{
              fontSize: '80px',
              fontWeight: 900,
              color: '#95A5A6',
              opacity: 0.08,
              letterSpacing: '10px',
              whiteSpace: 'nowrap',
              zIndex: 0,
            }}
          >
            پیش‌نویس
          </div>
        )}

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">
                {inv.invoiceNumber}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {inv.customerName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(inv.status)}
              {isDraft && !isSalesAdmin && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
                  پیش‌نویس
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">تاریخ</p>
              <p className="text-sm font-medium text-gray-700">{inv.date}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">قیمت نهایی</p>
              <p className="text-sm font-bold text-blue-600">
                {formatToman(inv.finalAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">کمیسیون (۴%)</p>
              <p className="text-sm font-bold text-green-600">
                {formatToman(inv.commission)}
              </p>
            </div>
            <button
              onClick={() => handlePrint(inv)}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="چاپ فاکتور"
            >
              <Printer className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'final' || status === 'paid' || status === 'settled') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3" />
          {status === 'settled' ? 'تسویه‌شده' : 'نهایی'}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <Clock className="h-3 w-3" />
        پیش‌نویس
      </span>
    );
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.includes(search) ||
      inv.customerName.includes(search);
    const matchesFilter = filter === 'all' || inv.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی شماره فاکتور یا نام مشتری..."
            className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'draft', 'final', 'paid', 'settled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' && 'همه'}
              {status === 'draft' && 'پیش‌نویس'}
              {status === 'final' && 'نهایی'}
              {status === 'paid' && 'پرداخت‌شده'}
              {status === 'settled' && 'تسویه‌شده'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 pb-4">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>هیچ فاکتوری یافت نشد</p>
          </div>
        ) : (
          filteredInvoices.map((inv) => renderInvoiceCard(inv))
        )}
      </div>

      {/* ============================================
          🔥 بخش مخفی برای چاپ با استفاده از InvoicePrint
          ============================================ */}
      <div style={{ display: 'none' }}>
        {printingInvoice && (
          <div ref={printRef}>
            <InvoicePrint
              invoiceNumber={printingInvoice.invoiceNumber}
              customer={printingInvoice.customer}
              items={printingInvoice.items}
              subtotal={printingInvoice.totalAmount}
              totalDiscount={printingInvoice.totalDiscount}
              payable={printingInvoice.finalAmount}
              date={printingInvoice.date}
              sellerName={printingInvoice.salesUser?.fullName || 'شرکت حس شیمی'}
              status={printingInvoice.status}
              userRole={userRole}
              previousDebt={0}
            />
          </div>
        )}
      </div>
    </div>
  );
}