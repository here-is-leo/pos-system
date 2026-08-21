// lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * نرمال‌سازی متن برای جستجو
 * تبدیل حروف مشابه فارسی/عربی به یک شکل
 */
export function normalize(text: string): string {
  return text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/إ/g, 'ا')
    .replace(/أ/g, 'ا')
    .replace(/آ/g, 'ا')
    .trim()
    .toLowerCase();
}

// ============================================
// 💰 توابع یکپارچه واحد پول و فرمت اعداد
// ============================================

/**
 * فرمت کردن عدد با جداکننده سه‌رقمی (,) - برای استفاده عمومی
 */
export function formatNumber(value: number): string {
  if (value === 0 || value === undefined || value === null || isNaN(value)) {
    return '۰';
  }
  return value.toLocaleString('fa-IR');
}

/**
 * تبدیل ریال به تومان (برای نمایش در صفحات)
 */
export function toToman(amount: number): number {
  return amount / 10;
}

/**
 * تبدیل تومان به ریال (برای ذخیره در دیتابیس)
 */
export function toRial(amount: number): number {
  return amount * 10;
}

/**
 * فرمت کردن قیمت به تومان با برچسب "تومان" (برای صفحات عادی)
 */
export function formatToman(amount: number): string {
  if (amount === 0 || amount === undefined || amount === null || isNaN(amount)) {
    return '۰ تومان';
  }
  const toman = toToman(amount);
  return toman.toLocaleString('fa-IR') + ' تومان';
}

/**
 * فرمت کردن قیمت به تومان بدون برچسب (برای جدول/فرم)
 */
export function formatTomanNumber(amount: number): string {
  if (amount === 0 || amount === undefined || amount === null || isNaN(amount)) {
    return '۰';
  }
  return toToman(amount).toLocaleString('fa-IR');
}

/**
 * فرمت کردن قیمت به ریال با برچسب "ریال" (برای فاکتور چاپی)
 */
export function formatRial(amount: number): string {
  if (amount === 0 || amount === undefined || amount === null || isNaN(amount)) {
    return '۰ ریال';
  }
  return amount.toLocaleString('fa-IR') + ' ریال';
}

/**
 * فرمت کردن قیمت به ریال بدون برچسب (برای جدول فاکتور)
 */
export function formatRialNumber(amount: number): string {
  if (amount === 0 || amount === undefined || amount === null || isNaN(amount)) {
    return '۰';
  }
  return amount.toLocaleString('fa-IR');
}

// ============================================
// 📅 توابع تاریخ
// ============================================

/**
 * فرمت کردن تاریخ به شمسی
 * @param date - تاریخ به صورت string یا Date
 * @returns تاریخ شمسی فرمت‌شده
 */
export function formatDate(date: string | Date): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * فرمت کردن تاریخ و زمان به شمسی
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================
// 🔄 توابع تبدیل
// ============================================

/**
 * تبدیل عدد از فرمت فارسی/انگلیسی به عدد
 */
export function parsePrice(value: string): number {
  if (!value) return 0;
  // حذف کاما و فاصله
  const cleaned = value.replace(/,/g, '').replace(/\s/g, '');
  // تبدیل اعداد فارسی به انگلیسی
  const persianToEnglish: { [key: string]: string } = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  };
  const english = cleaned.replace(/[۰-۹]/g, (d) => persianToEnglish[d] || d);
  return Number(english) || 0;
}

/**
 * تبدیل عدد به فرمت فارسی
 */
export function toPersianNumber(value: number): string {
  if (!value && value !== 0) return '۰';
  const persianDigits: { [key: string]: string } = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
  };
  return String(value).replace(/\d/g, (d) => persianDigits[d] || d);
}