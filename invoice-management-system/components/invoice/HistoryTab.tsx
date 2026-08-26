// components/invoice/HistoryTab.tsx

'use client';

import InvoiceHistory from './InvoiceHistory';

interface HistoryTabProps {
  userId: number;
}

export default function HistoryTab({ userId }: HistoryTabProps) {
  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">فاکتورهای ثبت‌شده</h2>
        <span className="text-xs text-gray-500">آخرین فاکتورها</span>
      </div>
      <InvoiceHistory userId={userId} />
    </div>
  );
}