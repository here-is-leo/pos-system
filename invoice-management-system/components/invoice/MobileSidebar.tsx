// components/invoice/MobileSidebar.tsx

'use client';

import { useEffect, useState } from 'react';
import { X, FileText, ClipboardList, BarChart3, LogOut } from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'invoice' | 'history' | 'stats';
  onTabChange: (tab: 'invoice' | 'history' | 'stats') => void;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  userName,
  userRole,
  onLogout,
}: MobileSidebarProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => setIsAnimating(false), 300);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    {
      id: 'invoice' as const,
      label: 'ثبت فاکتور',
      icon: FileText,
      color: '#3498DB',
    },
    {
      id: 'history' as const,
      label: 'فاکتورهای ثبت‌شده',
      icon: ClipboardList,
      color: '#2ECC71',
    },
    {
      id: 'stats' as const,
      label: 'آمار فروش',
      icon: BarChart3,
      color: '#9B59B6',
    },
  ];

  const handleTabClick = (tab: 'invoice' | 'history' | 'stats') => {
    onTabChange(tab);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[300px] max-w-[80%] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          direction: 'rtl',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #ECF0F1' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#2C3E50' }}
            >
              <span className="text-white text-sm font-bold">
                {userName?.charAt(0) || 'ک'}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#2C3E50' }}>
                {userName || 'کاربر'}
              </p>
              <p className="text-xs" style={{ color: '#7F8C8D' }}>
                {userRole === 'sales_admin' ? 'فروش(ادمین)' : 'فروشنده'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" style={{ color: '#7F8C8D' }} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: isActive ? '#EBF5FB' : 'transparent',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? '#D6EAF8' : '#F8F9FA',
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: isActive ? item.color : '#7F8C8D' }}
                  />
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div
                    className="mr-auto w-1.5 h-8 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 right-0 left-0 px-3 py-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50">
              <LogOut className="h-5 w-5 text-red-500" />
            </div>
            <span className="text-sm font-medium text-red-600">خروج از سیستم</span>
          </button>
        </div>
      </div>
    </>
  );
}