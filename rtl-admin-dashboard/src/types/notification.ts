export type NotificationType = 'danger' | 'warning' | 'info' | 'success';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  danger: number;
  warning: number;
  info: number;
  success: number;
}