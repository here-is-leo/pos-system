'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Phone, Lock, LogIn, FileText } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'sales' || user.role === 'sales_admin') {
          router.replace('/');
        } else if (user.role === 'admin') {
          window.location.href = 'http://localhost:8080';
        } else if (user.role === 'warehouse') {
          window.location.href = 'http://localhost:3001';
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'خطا در ورود');
      }

      const role = data.user.role;
      if (role !== 'sales' && role !== 'sales_admin') {
        setError(' شما دسترسی به این بخش را ندارید. لطفاً با نقش فروشنده وارد شوید.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (role === 'sales' || role === 'sales_admin') {
        router.replace('/');
      } else if (role === 'admin') {
        window.location.href = 'http://localhost:8080';
      } else if (role === 'warehouse') {
        window.location.href = 'http://localhost:3001';
      } else {
        router.replace('/');
      }

    } catch (err: any) {
      setError(err.message || 'خطا در ورود');
    } finally {
      setLoading(false);
    }
  };

  // در حال بارگذاری اولیه
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#D6E4F0' }} dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-blue-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{ backgroundColor: '#191970' }}>
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#191970' }}>سیستم صدور فاکتور</h1>
            <p className="text-sm mt-1" style={{ color: '#4A6A8B' }}>ثبت و صدور فاکتور فروش</p>
          </div>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#191970' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#D6E4F0' }} dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-blue-100">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{ backgroundColor: '#191970' }}>
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#191970' }}>
            سیستم صدور فاکتور
          </h1>
          <p className="text-sm mt-1" style={{ color: '#4A6A8B' }}>ثبت و صدور فاکتور فروش</p>
          <div className="mt-2 flex justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#191970' }}></span>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#4A6A8B' }}></span>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#B8CCE0' }}></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#191970' }}>
              تلفن همراه
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Phone className="h-5 w-5" style={{ color: '#4A6A8B' }} />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  color: '#13135C', 
                  backgroundColor: '#F4F8FC',
                  borderColor: '#B8CCE0'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#191970';
                  e.target.style.boxShadow = '0 0 0 3px rgba(25, 25, 112, 0.10)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#B8CCE0';
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
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#191970' }}>
              رمز عبور
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5" style={{ color: '#4A6A8B' }} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  color: '#13135C', 
                  backgroundColor: '#F4F8FC',
                  borderColor: '#B8CCE0'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#191970';
                  e.target.style.boxShadow = '0 0 0 3px rgba(25, 25, 112, 0.10)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#B8CCE0';
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
            style={{ backgroundColor: '#191970' }}
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

          {/* Quick Info */}
          <div className="text-center text-xs space-y-1" style={{ color: '#4A6A8B' }}>
            
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-blue-100 text-center text-xs" style={{ color: '#B8CCE0' }}>
          <p>سیستم فروش حس شیمی © {new Date().getFullYear()}</p>
          
        </div>
      </div>
    </div>
  );
}