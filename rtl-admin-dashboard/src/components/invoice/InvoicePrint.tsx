// src/components/invoice/InvoicePrint.tsx

'use client';

import { forwardRef } from 'react';
import { formatRial, formatRialNumber, formatNumber } from '@/lib/utils';

interface InvoicePrintProps {
  invoiceNumber: string;
  customer: any;
  items: any[];
  subtotal: number;
  totalDiscount: number;
  payable: number;
  date: string;
  sellerName?: string;
  status?: 'draft' | 'final' | 'paid';
  userRole?: string;
  previousDebt?: number;
}

const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ 
    invoiceNumber, 
    customer, 
    items, 
    subtotal, 
    totalDiscount, 
    payable, 
    date, 
    sellerName = 'شرکت حس شیمی',
    status = 'draft',
    userRole = 'admin',
    previousDebt = 0,
  }, ref) => {
    const showWatermark = status === 'draft' && userRole !== 'admin' && userRole !== 'sales_admin';
    const invoiceTotal = subtotal - totalDiscount;
    const totalPayable = invoiceTotal + previousDebt;

    return (
      <div ref={ref} className="invoice-print-container" dir="rtl">
        <style>{`
          .invoice-print-container {
            font-family: 'Vazirmatn', Tahoma, sans-serif;
            background: white;
            padding: 30px 35px;
            max-width: 880px;
            margin: 0 auto;
            direction: rtl;
            position: relative;
            overflow: hidden;
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
          .invoice-table .empty-cell {
            color: #aaa;
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
            .invoice-print-container {
              padding: 20px;
            }
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
        `}</style>

        {showWatermark && (
          <div className="watermark">پیش‌نویس</div>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="invoice-header">
            <div className="invoice-title">
              برگ سفارش کالای درخواستی
              <br />
              <span>(فاکتور فروش)</span>
            </div>
            <div className="invoice-meta">
              <div><strong>شماره:</strong> {invoiceNumber}</div>
              <div><strong>تاریخ:</strong> {date}</div>
            </div>
          </div>

          <div className="customer-grid">
            <div className="field">
              <span className="label">آقای/خانم</span>
              <div className="value value-line">{customer?.name || '_______________'}</div>
            </div>
            <div className="field">
              <span className="label">کد مشتری</span>
              <div className="value value-line">{customer?.id || '______'}</div>
            </div>
            <div className="field">
              <span className="label">ویزیتور</span>
              <div className="value value-line">_______________</div>
            </div>
            <div className="field">
              <span className="label">شماره تماس</span>
              <div className="value value-line">{customer?.phone || '_______________'}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="label">آدرس</span>
              <div className="value value-line">{customer?.address || '________________________________________'}</div>
            </div>
          </div>

          {previousDebt > 0 && (
            <div className="previous-debt-section">
              <span className="label"> بدهی قبلی مشتری از فاکتورهای پرداخت‌نشده:</span>
              <span className="value">{formatRialNumber(previousDebt)} ریال</span>
            </div>
          )}

          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: '6%' }}>ردیف</th>
                <th style={{ width: '12%' }}>کد کالا</th>
                <th style={{ width: '22%' }}>نام کالا</th>
                <th style={{ width: '8%' }}>تعداد</th>
                <th style={{ width: '12%' }}>بهای واحد (ریال)</th>
                <th style={{ width: '12%' }}>بهای کل (ریال)</th>
                <th style={{ width: '10%' }}>تخفیف (ریال)</th>
                <th style={{ width: '14%' }}>جمع مبلغ (ریال)</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '12px', color: '#999' }}>
                    هیچ کالایی ثبت نشده است
                  </td>
                </tr>
              ) : (
                items.map((item: any, index: number) => {
                  const itemTotal = item.quantity * item.unitPrice;
                  const discountAmount = item.discountType === 'percentage'
                    ? (itemTotal * item.discountValue) / 100
                    : item.discountValue;
                  const finalPrice = itemTotal - discountAmount;

                  return (
                    <tr key={item.id || index}>
                      <td>{index + 1}</td>
                      <td>{item.product?.id || '---'}</td>
                      <td>{item.product?.name || 'نامشخص'}</td>
                      <td>{formatNumber(item.quantity)}</td>
                      <td>{formatRialNumber(item.unitPrice)}</td>
                      <td>{formatRialNumber(itemTotal)}</td>
                      <td>{discountAmount > 0 ? formatRialNumber(discountAmount) : '-'}</td>
                      <td style={{ fontWeight: 700 }}>{formatRialNumber(finalPrice)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="totals-grid">
            <div className="row">
              <span className="label">جمع کل فاکتور (ریال)</span>
              <span className="value">{formatRialNumber(invoiceTotal)}</span>
            </div>
            <div className="row">
              <span className="label">
                {totalDiscount > 0 ? `جمع تخفیف: ${formatRialNumber(totalDiscount)} ریال` : 'تخفیف'}
              </span>
              <span className="value" style={{ color: totalDiscount > 0 ? '#b91c1c' : 'inherit' }}>
                {totalDiscount > 0 ? formatRialNumber(totalDiscount) : '۰'}
              </span>
            </div>
          </div>

          {previousDebt > 0 && (
            <div className="totals-grid" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
              <div className="row" style={{ gridColumn: 'span 2' }}>
                <span className="label" style={{ color: '#92400e' }}> بدهی قبلی مشتری:</span>
                <span className="value" style={{ color: '#b91c1c' }}>{formatRialNumber(previousDebt)} ریال</span>
              </div>
            </div>
          )}

          <div className="totals-grid" style={{ marginBottom: '16px', backgroundColor: previousDebt > 0 ? '#fef3c7' : '#f7f7f7', borderColor: previousDebt > 0 ? '#f59e0b' : '#ddd' }}>
            <div className="row" style={{ gridColumn: 'span 2', fontSize: '16px', fontWeight: 'bold' }}>
              <span className="label" style={{ color: previousDebt > 0 ? '#92400e' : 'inherit' }}>
                {previousDebt > 0 ? ' مبلغ قابل پرداخت (با احتساب بدهی قبلی)' : ' مبلغ قابل پرداخت'}
              </span>
              <span className="value" style={{ color: '#b91c1c' }}>
                {formatRialNumber(totalPayable)} ریال
              </span>
            </div>
          </div>

          <div className="footer-note">
            بسته کالای مطرح در این فاکتور را مطابق با شرایط و به صورت امانت تحویل گرفتم.
          </div>

          <div className="signature-row">
            <div className="seller">
              <span className="label">امضای فروشنده:</span>
              <span className="name">{sellerName}</span>
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              چاپ شده در {date}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = 'InvoicePrint';

export default InvoicePrint;