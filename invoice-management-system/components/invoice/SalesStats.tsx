// components/invoice/SalesStats.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, Calendar, DollarSign, FileText } from 'lucide-react';
import { formatPrice } from '@/lib/invoice-types';

interface SalesStatsProps {
  userId: number;
}

export default function SalesStats({ userId }: SalesStatsProps) {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalSales: 0,
    averageAmount: 0,
    commission: 0,
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
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
      const invoices = data.data || [];

      // محاسبه خلاصه
      const finalInvoices = invoices.filter(
        (inv: any) => inv.status === 'final' || inv.status === 'paid'
      );
      const totalSales = finalInvoices.reduce(
        (sum: number, inv: any) => sum + Number(inv.finalAmount),
        0
      );
      const commission = totalSales * 0.04;

      setSummary({
        totalInvoices: finalInvoices.length,
        totalSales: Math.round(totalSales),
        averageAmount: finalInvoices.length > 0 ? Math.round(totalSales / finalInvoices.length) : 0,
        commission: Math.round(commission),
      });

      // داده‌های هفتگی
      const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
      const weekMap = new Map(weekDays.map((d) => [d, 0]));
      
      const now = new Date();
      const today = new Date(now);
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = weekDays[(date.getDay() + 1) % 7];
        
        const dayInvoices = finalInvoices.filter((inv: any) => {
          const invDate = new Date(inv.createdAt);
          return invDate.toDateString() === date.toDateString();
        });
        
        const dayTotal = dayInvoices.reduce(
          (sum: number, inv: any) => sum + Number(inv.finalAmount),
          0
        );
        weekMap.set(dayName, Math.round(dayTotal / 10));
      }

      setWeeklyData(
        weekDays.map((day) => ({
          day,
          فروش: weekMap.get(day) || 0,
        }))
      );

      // داده‌های ماهانه (۶ ماه اخیر)
      const months = ['دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد'];
      const monthMap = new Map(months.map((m) => [m, 0]));

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = months[(date.getMonth() + 6) % 12];
        
        const monthInvoices = finalInvoices.filter((inv: any) => {
          const invDate = new Date(inv.createdAt);
          return invDate.getMonth() === date.getMonth() && 
                 invDate.getFullYear() === date.getFullYear();
        });
        
        const monthTotal = monthInvoices.reduce(
          (sum: number, inv: any) => sum + Number(inv.finalAmount),
          0
        );
        monthMap.set(monthName, Math.round(monthTotal / 10));
      }

      setMonthlyData(
        months.map((month) => ({
          month,
          فروش: monthMap.get(month) || 0,
        }))
      );
    } catch (error) {
      console.error('خطا در دریافت آمار:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 فرمت کردن اعداد برای نمایش روی نمودار
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">تعداد فاکتور</p>
          </div>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {summary.totalInvoices}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">کل فروش</p>
          </div>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {formatPrice(summary.totalSales * 10)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500">میانگین هر فاکتور</p>
          </div>
          <p className="text-xl font-bold text-gray-800 mt-1">
            {formatPrice(summary.averageAmount * 10)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500">کمیسیون (۴%)</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">
            {formatPrice(summary.commission * 10)}
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200">
        <button
          onClick={() => setPeriod('weekly')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === 'weekly'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          هفتگی
        </button>
        <button
          onClick={() => setPeriod('monthly')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === 'monthly'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ماهانه
        </button>
      </div>

      {/* 🔥 نمودار منحنی (Line Chart) با Area */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={period === 'weekly' ? weeklyData : monthlyData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ECF0F1" />
              <XAxis
                dataKey={period === 'weekly' ? 'day' : 'month'}
                stroke="#95A5A6"
                fontSize={11}
                tick={{ fill: '#7F8C8D' }}
              />
              <YAxis
                stroke="#95A5A6"
                fontSize={11}
                tick={{ fill: '#7F8C8D' }}
                tickFormatter={formatYAxis}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #ECF0F1',
                  borderRadius: 8,
                  fontFamily: 'inherit',
                  direction: 'rtl',
                }}
                formatter={(value: number) => [
                  `${value.toLocaleString()} تومان`,
                  'فروش'
                ]}
                labelFormatter={(label) => `${label}`}
              />
              {/* 🔥 خط منحنی با گرادیانت */}
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3498DB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3498DB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="فروش"
                stroke="#3498DB"
                strokeWidth={3}
                fill="url(#colorSales)"
                dot={{ r: 4, fill: '#3498DB', strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: '#3498DB', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="فروش"
                stroke="#3498DB"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3498DB' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🔥 نمایش اطلاعات اضافی زیر نمودار */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              بیشترین فروش:{' '}
              <span className="font-bold text-blue-600">
                {formatPrice(
                  Math.max(
                    ...(period === 'weekly' ? weeklyData : monthlyData).map(
                      (d) => d.فروش
                    )
                  ) * 10
                )}
              </span>
            </span>
            <span>
              میانگین:{' '}
              <span className="font-bold text-green-600">
                {formatPrice(
                  Math.round(
                    (period === 'weekly' ? weeklyData : monthlyData).reduce(
                      (sum, d) => sum + d.فروش,
                      0
                    ) /
                      (period === 'weekly' ? weeklyData : monthlyData).length
                  ) * 10
                )}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}