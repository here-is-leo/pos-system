// components/inventory/inventory-header.tsx

'use client';

import { Bell, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InventoryHeaderProps {
  userName?: string;
  itemCount?: number;
}

export default function InventoryHeader({ userName = 'انباردار', itemCount = 0 }: InventoryHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#1A2332]">مدیریت موجودی</h1>
          <span className="text-sm text-gray-400 hidden sm:inline">{itemCount} محصول</span>
        </div>

        <div className="flex items-center gap-3">
          {/* دکمه اعلان - غیرفعال */}
          <button
            className="w-10 h-10 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-400 cursor-not-allowed opacity-50"
            disabled
            title="در حال توسعه"
          >
            <Bell className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{userName}</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center text-red-400 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}