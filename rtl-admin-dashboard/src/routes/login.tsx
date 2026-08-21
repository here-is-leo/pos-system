import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { login } from "@/services/api";
import { Loader2, Phone, Lock, LogIn, Shield, UserCog } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // 🔥 بررسی نقش - فقط ادمین و فروش(ادمین) به پنل مدیریت دسترسی دارند
        if (user.role === "admin" || user.role === "sales_admin") {
          window.location.href = "/";
        } else if (user.role === "sales") {
          window.location.href = "http://localhost:3000";
        } else if (user.role === "warehouse") {
          window.location.href = "http://localhost:3001";
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(phone, password);
      
      // 🔥 بررسی نقش - فقط ادمین و فروش(ادمین) به پنل مدیریت دسترسی دارند
      const role = result.user.role;
      if (role !== "admin" && role !== "sales_admin") {
        setError(" شما دسترسی به پنل مدیریت را ندارید. لطفاً با نقش ادمین وارد شوید.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      if (role === "admin" || role === "sales_admin") {
        window.location.href = "/";
      } else if (role === "sales") {
        window.location.href = "http://localhost:3000";
      } else if (role === "warehouse") {
        window.location.href = "http://localhost:3001";
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطا در ورود");
    } finally {
      setLoading(false);
    }
  };

  // در حال بارگذاری اولیه
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F0FA' }} dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-purple-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{ backgroundColor: '#4B0082' }}>
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#4B0082' }}>
              سیستم مدیریت
            </h1>
            <p className="text-sm mt-1" style={{ color: '#9B6DB5' }}>داشبورد فروش و انبار</p>
          </div>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4B0082' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F0FA' }} dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-purple-100">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md" style={{ backgroundColor: '#4B0082' }}>
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#4B0082' }}>
            سیستم مدیریت
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9B6DB5' }}>داشبورد فروش و انبار</p>
          <div className="mt-2 flex justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#4B0082' }}></span>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#9B6DB5' }}></span>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#D5C6E0' }}></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B0082' }}>
              تلفن همراه
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Phone className="h-5 w-5" style={{ color: '#9B6DB5' }} />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  color: '#3A0068', 
                  backgroundColor: '#FBF9FD',
                  borderColor: '#D5C6E0'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4B0082';
                  e.target.style.boxShadow = '0 0 0 3px rgba(75, 0, 130, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D5C6E0';
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
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#4B0082' }}>
              رمز عبور
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5" style={{ color: '#9B6DB5' }} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  color: '#3A0068', 
                  backgroundColor: '#FBF9FD',
                  borderColor: '#D5C6E0'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4B0082';
                  e.target.style.boxShadow = '0 0 0 3px rgba(75, 0, 130, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D5C6E0';
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
              <span></span>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: '#4B0082' }}
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
        <div className="mt-6 pt-4 border-t border-purple-100 text-center text-xs" style={{ color: '#D5C6E0' }}>
          <p>سیستم فروش حس شیمی © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}