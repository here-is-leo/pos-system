'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { Notification, NotificationStats } from '@/types/notification';
import { getNotifications, getNotificationStats, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/services/api';
import NotificationItem from './NotificationItem';
import { cn } from '@/lib/utils';

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notifs, statsData] = await Promise.all([
        getNotifications(),
        getNotificationStats(),
      ]);
      setNotifications(notifs);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError('خطا در بارگذاری نوتیفیکیشن‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // بارگذاری مجدد هر ۳۰ ثانیه
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // بستن با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      await loadData();
    } catch (err) {
      console.error('خطا:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadData();
    } catch (err) {
      console.error('خطا:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      await loadData();
    } catch (err) {
      console.error('خطا:', err);
    }
  };

  const unreadCount = stats?.unread || 0;

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* دکمه زنگ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-md border border-border bg-background p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="نوتیفیکیشن‌ها"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--danger)] text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* دراپ‌داون */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 max-h-[500px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* هدر */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900">نوتیفیکیشن‌ها</h3>
              {stats && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {stats.unread} خوانده نشده · {stats.total} total
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  همه را خوانده شد
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* لیست نوتیفیکیشن‌ها */}
          <div className="overflow-y-auto max-h-[400px] p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 text-sm">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">هیچ نوتیفیکیشنی وجود ندارد</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {/* فوتر */}
          <div className="border-t border-gray-100 px-4 py-2 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/notifications';
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              مشاهده همه نوتیفیکیشن‌ها
            </button>
          </div>
        </div>
      )}
    </div>
  );
}