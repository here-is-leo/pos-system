// components/invoice/InvoicePrint.tsx

'use client';

import { forwardRef } from 'react';
import { formatRialNumber, formatNumber } from '@/lib/utils';
import type { Customer, InvoiceItem } from '@/lib/invoice-types';
import { 
  calcOrderQuantity, 
  calcCartonCount, 
  isCartonProduct,
  getUnitPriceForDisplay,
  getUnitTypeLabel
} from '@/lib/invoice-types';

interface InvoicePrintProps {
  invoiceNumber: string;
  customer: Customer;
  items: InvoiceItem[];
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
    userRole = 'sales',
    previousDebt = 0,
  }, ref) => {
    const showWatermark = status === 'draft' && userRole !== 'sales_admin';
    const invoiceTotal = subtotal - totalDiscount;
    const totalPayable = invoiceTotal + previousDebt;

    // 🔥 محاسبات
    const cartonItems = items.filter(item => isCartonProduct(item.product));
    const totalOrderQuantity = items.reduce((sum, item) => sum + calcOrderQuantity(item), 0);
    const totalCartonCount = items.reduce((sum, item) => sum + calcCartonCount(item), 0);
    const totalCartonPrice = cartonItems.reduce((sum, item) => {
      const cartonPrice = getUnitPriceForDisplay(item.product);
      return sum + (cartonPrice * item.quantity);
    }, 0);

    // 🔥 برای دیباگ - نمایش productCode در کنسول
    console.log('📋 InvoicePrint - آیتم‌های دریافتی:', items.map(item => ({
      name: item.product.name,
      productCode: item.product.productCode,
      hasProductCode: !!item.product.productCode,
    })));

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
            font-size: 12px;
          }
          .invoice-table th {
            background: #1a1a1a;
            color: white;
            font-weight: 700;
            padding: 8px 6px;
            text-align: center;
            border: 1px solid #1a1a1a;
            font-size: 11px;
          }
          .invoice-table td {
            padding: 6px 4px;
            text-align: center;
            border: 1px solid #1a1a1a;
            vertical-align: middle;
            font-size: 12px;
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

          .product-code-cell {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            font-weight: bold;
            color: #1a5276;
            letter-spacing: 0.5px;
            background-color: #f0f7ff;
            padding: 4px 6px;
            border-radius: 4px;
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
          {/* HEADER */}
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

          {/* CUSTOMER */}
          <div className="customer-grid">
            <div className="field">
              <span className="label">آقای/خانم</span>
              <div className="value value-line">{customer.name || '_______________'}</div>
            </div>
            <div className="field">
              <span className="label">کد مشتری</span>
              <div className="value value-line">{customer.id || '______'}</div>
            </div>
            <div className="field">
              <span className="label">ویزیتور</span>
              <div className="value value-line">_______________</div>
            </div>
            <div className="field">
              <span className="label">شماره تماس</span>
              <div className="value value-line">{customer.phone || '_______________'}</div>
            </div>
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <span className="label">آدرس</span>
              <div className="value value-line">{customer.address || '________________________________________'}</div>
            </div>
          </div>

          {previousDebt > 0 && (
            <div className="previous-debt-section">
              <span className="label">💰 بدهی قبلی مشتری از فاکتورهای پرداخت‌نشده:</span>
              <span className="value">{formatRialNumber(previousDebt)} ریال</span>
            </div>
          )}

          {/* 🔥 TABLE - با کد کالا */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>ردیف</th>
                <th style={{ width: '14%' }}>کد کالا</th>
                <th style={{ width: '20%' }}>نام کالا</th>
                <th style={{ width: '8%' }}>سفارش</th>
                <th style={{ width: '8%' }}>کارتن</th>
                <th style={{ width: '12%' }}>بهای واحد (ریال)</th>
                <th style={{ width: '12%' }}>بهای کل (ریال)</th>
                <th style={{ width: '10%' }}>تخفیف (ریال)</th>
                <th style={{ width: '11%' }}>جمع مبلغ (ریال)</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '12px', color: '#999' }}>
                    هیچ کالایی ثبت نشده است
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const orderQty = calcOrderQuantity(item);
                  const cartonQty = calcCartonCount(item);
                  const isCarton = isCartonProduct(item.product);
                  
                  const displayUnitPrice = getUnitPriceForDisplay(item.product);
                  
                  // 🔥 قیمت کل
                  const itemTotal = isCarton 
                    ? displayUnitPrice * item.quantity
                    : displayUnitPrice * orderQty;
                  
                  const discountAmount = item.discountType === 'percent' || item.discountType === 'percentage'
                    ? (itemTotal * item.discount) / 100
                    : item.discount;
                  const finalPrice = itemTotal - discountAmount;

                  // 🔥 کد کالا - با مقدار پیش‌فرض
                  const productCode = item.product?.productCode || '-';

                  return (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      {/* 🔥 کد کالا */}
                      <td className="product-code-cell">
                        {productCode}
                      </td>
                      <td>{item.product.name}</td>
                      <td style={{ fontWeight: 'bold', color: '#1a5276' }}>
                        {formatNumber(orderQty)}
                      </td>
                      <td>
                        {isCarton ? formatNumber(cartonQty) : '-'}
                      </td>
                      <td>{formatRialNumber(displayUnitPrice)}</td>
                      <td>{formatRialNumber(itemTotal)}</td>
                      <td>{discountAmount > 0 ? formatRialNumber(discountAmount) : '-'}</td>
                      <td style={{ fontWeight: 700 }}>{formatRialNumber(finalPrice)}</td>
                    </tr>
                  );
                })
              )}
              {/* 🔥 ردیف جمع */}
              {items.length > 0 && (
                <tr style={{ backgroundColor: '#f0f7ff', fontWeight: 'bold' }}>
                  <td colSpan={3} style={{ textAlign: 'left', padding: '8px 6px' }}>
                    جمع کل:
                  </td>
                  <td style={{ color: '#1a5276' }}>{formatNumber(totalOrderQuantity)}</td>
                  <td>{totalCartonCount > 0 ? formatNumber(totalCartonCount) : '-'}</td>
                  <td colSpan={4}></td>
                </tr>
              )}
            </tbody>
          </table>

          {/* TOTALS */}
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

          {/* 🔥 خلاصه سفارش و کارتن */}
          <div className="totals-grid" style={{ backgroundColor: '#f8f9fa', borderColor: '#dee2e6' }}>
            <div className="row" style={{ gridColumn: 'span 2' }}>
              <span className="label">کل سفارش:</span>
              <span className="value" style={{ color: '#1a5276' }}>{formatNumber(totalOrderQuantity)}</span>
            </div>
            {totalCartonCount > 0 && (
              <div className="row" style={{ gridColumn: 'span 2' }}>
                <span className="label">کل کارتن:</span>
                <span className="value" style={{ color: '#E67E22' }}>{formatNumber(totalCartonCount)}</span>
              </div>
            )}
          </div>

          {previousDebt > 0 && (
            <div className="totals-grid" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
              <div className="row" style={{ gridColumn: 'span 2' }}>
                <span className="label" style={{ color: '#92400e' }}>💰 بدهی قبلی مشتری:</span>
                <span className="value" style={{ color: '#b91c1c' }}>{formatRialNumber(previousDebt)} ریال</span>
              </div>
            </div>
          )}

          <div className="totals-grid" style={{ marginBottom: '16px', backgroundColor: previousDebt > 0 ? '#fef3c7' : '#f7f7f7', borderColor: previousDebt > 0 ? '#f59e0b' : '#ddd' }}>
            <div className="row" style={{ gridColumn: 'span 2', fontSize: '16px', fontWeight: 'bold' }}>
              <span className="label" style={{ color: previousDebt > 0 ? '#92400e' : 'inherit' }}>
                {previousDebt > 0 ? '💰 مبلغ قابل پرداخت (با احتساب بدهی قبلی)' : '💰 مبلغ قابل پرداخت'}
              </span>
              <span className="value" style={{ color: '#b91c1c' }}>
                {formatRialNumber(totalPayable)} ریال
              </span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="footer-note">
            بسته کالای مطرح در این فاکتور را مطابق با شرایط و به صورت امانت تحویل گرفتم.
          </div>

          {/* SIGNATURE */}
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