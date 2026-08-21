'use client';

import { Bell, AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import { Notification, NotificationType } from '@/types/notification';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
  danger: <XCircle className="h-4 w-4 text-red-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
};

const typeBg: Record<NotificationType, string> = {
  danger: 'hover:bg-red-50',
  warning: 'hover:bg-orange-50',
  info: 'hover:bg-blue-50',
  success: 'hover:bg-green-50',
};

export default function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer group',
        !notification.read ? 'bg-blue-50/50 hover:bg-blue-100/50' : typeBg[notification.type],
        'border border-transparent hover:border-gray-200'
      )}
      onClick={handleClick}
    >
      {/* آیکون */}
      <div className="flex-shrink-0 mt-0.5">
        {typeIcons[notification.type]}
      </div>

      {/* محتوا */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-sm font-medium',
            !notification.read ? 'text-gray-900' : 'text-gray-600'
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {notification.description}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          {notification.time}
        </p>
      </div>

      {/* دکمه حذف */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
        title="حذف"
      >
        <X className="h-3.5 w-3.5 text-gray-400" />
      </button>
    </div>
  );
}