// components/invoice/StatsTab.tsx

'use client';

import SalesStats from './SalesStats';

interface StatsTabProps {
  userId: number;
}

export default function StatsTab({ userId }: StatsTabProps) {
  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">آمار فروش</h2>
        <span className="text-xs text-gray-500">نمایش عملکرد</span>
      </div>
      <SalesStats userId={userId} />
    </div>
  );
}