'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Phone, Lock, LogIn, Package, Warehouse } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  // 🔥 بررسی احراز هویت
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    console.log('🔍 بررسی احراز هویت در لاگین:', { token: !!token, userStr: !!userStr });

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('👤 کاربر موجود در لاگین:', user);

        // 🔥 هدایت بر اساس نقش
        if (user.role === 'warehouse') {
          console.log('🏠 هدایت به صفحه اصلی انبار (پورت 3001)');
          window.location.href = 'http://localhost:3001/';
          return;
        } else if (user.role === 'admin') {
          console.log('🖥️ هدایت به پنل ادمین (پورت 8080)');
          window.location.href = 'http://localhost:8080';
          return;
        } else if (user.role === 'sales' || user.role === 'sales_admin') {
          console.log('📝 هدایت به سیستم فروشنده (پورت 3000)');
          window.location.href = 'http://localhost:3000';
          return;
        } else {
          console.log('❌ نقش نامشخص، خروج از سیستم');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('❌ خطا در خواندن کاربر:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsChecking(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('📤 ارسال درخواست لاگین به بک‌اند...');
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'خطا در ورود');
      }

      console.log(' لاگین موفق:', data.user);

      // 🔥 بررسی نقش - فقط انباردار و ادمین اجازه ورود دارند
      const role = data.user.role;
      if (role !== 'warehouse' && role !== 'admin') {
        setError(' شما دسترسی به این بخش را ندارید. لطفاً با نقش انباردار وارد شوید.');
        setLoading(false);
        return;
      }

      // 🔥 ذخیره در localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log(' نقش کاربر:', role);

      // 🔥 هدایت با window.location
      if (role === 'warehouse') {
        console.log(' هدایت به صفحه اصلی انبار (پورت 3001)');
        window.location.href = 'http://localhost:3001/';
      } else if (role === 'admin') {
        console.log(' هدایت به پنل ادمین (پورت 8080)');
        window.location.href = 'http://localhost:8080';
      } else if (role === 'sales' || role === 'sales_admin') {
        console.log(' هدایت به سیستم فروشنده (پورت 3000)');
        window.location.href = 'http://localhost:3000';
      } else {
        console.log(' نقش نامشخص، هدایت به صفحه اصلی');
        window.location.href = 'http://localhost:3001/';
      }
    } catch (err: any) {
      console.error(' خطا در لاگین:', err);
      setError(err.message || 'خطا در ورود');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 در حال بررسی احراز هویت
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#D4EDDA' }} dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-green-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{ backgroundColor: '#2E7D32' }}>
              <span className="text-white text-3xl font-bold">حس</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>
              سیستم فروش
            </h1>
            <p className="text-sm mt-1" style={{ color: '#43A047' }}>مدیریت موجودی انبار</p>
            <div className="mt-2 flex justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#2E7D32' }}></span>
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#43A047' }}></span>
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#A5D6A7' }}></span>
            </div>
          </div>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#2E7D32' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#D4EDDA' }} dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-green-100">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{ backgroundColor: '#2E7D32' }}>
            <Warehouse className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#1B5E20' }}>
            سیستم فروش
          </h1>
          <p className="text-sm mt-1" style={{ color: '#43A047' }}>مدیریت موجودی انبار</p>
          <div className="mt-2 flex justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#2E7D32' }}></span>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#43A047' }}></span>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#A5D6A7' }}></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1B5E20' }}>
              تلفن همراه
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Phone className="h-5 w-5" style={{ color: '#43A047' }} />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                style={{
                  color: '#1B5E20',
                  backgroundColor: '#F9FDF9',
                  borderColor: '#A5D6A7',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2E7D32';
                  e.target.style.boxShadow = '0 0 0 3px rgba(46, 125, 50, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#A5D6A7';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="۰۹۱۲..."
                dir="ltr"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1B5E20' }}>
              رمز عبور
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5" style={{ color: '#43A047' }} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                style={{
                  color: '#1B5E20',
                  backgroundColor: '#F9FDF9',
                  borderColor: '#A5D6A7',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2E7D32';
                  e.target.style.boxShadow = '0 0 0 3px rgba(46, 125, 50, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#A5D6A7';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="رمز عبور"
                dir="ltr"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl text-center flex items-center justify-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: '#2E7D32' }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                در حال ورود...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                ورود به سیستم
              </>
            )}
          </button>

                  </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-green-100 text-center text-xs" style={{ color: '#A5D6A7' }}>
          <p>سیستم فروش حس شیمی © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}