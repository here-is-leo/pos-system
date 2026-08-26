// app/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InventoryDashboard from '@/components/inventory/inventory-dashboard';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 🔥 بررسی توکن در صفحه اصلی
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    console.log('🔍 بررسی صفحه اصلی:', { token: !!token, userStr: !!userStr });

    if (!token || !userStr) {
      console.log('❌ بدون توکن، هدایت به لاگین');
      router.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log('👤 کاربر در صفحه اصلی:', user);

      if (user.role !== 'warehouse' && user.role !== 'admin') {
        console.log('❌ نقش مجاز نیست:', user.role);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
        return;
      }

      console.log('✅ کاربر مجاز است، نمایش داشبورد');
    } catch (error) {
      console.error('❌ خطا:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/login');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-[#F4F6F9]">
      <InventoryDashboard />
    </main>
  );
}