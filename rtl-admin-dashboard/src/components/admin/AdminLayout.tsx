// src/components/admin/AdminLayout.tsx

import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  UserCog,
  Receipt,
  BarChart3,
  LogOut,
  Search,
  X,
  Command,
  Loader2,
  FileText,
  Menu,
  ChevronRight,
  Wallet,          // 🔥 جدید
  History,         // 🔥 جدید
} from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { logout } from "@/services/api";
import { getProducts, getCustomers, getInvoices } from "@/services/api";

const navItems = [
  { to: "/", label: "داشبورد", icon: LayoutDashboard },
  { to: "/products", label: "محصولات", icon: Package },
  { to: "/customers", label: "مشتریان", icon: Users },
  { to: "/users", label: "کاربران", icon: UserCog },
  { to: "/invoices", label: "فاکتورها", icon: Receipt },
  { to: "/sales-invoices", label: "فاکتور فروشندگان", icon: FileText },
  { to: "/inventory", label: "مدیریت موجودی", icon: Package },
  { to: "/customer-settlement", label: "تسویه مشتریان", icon: Wallet },  // 🔥 جدید
  { to: "/payment-history", label: "پرداختی مشتریان", icon: History },   // 🔥 جدید
  { to: "/reports", label: "گزارشات", icon: BarChart3 },
];

interface SearchResult {
  id: number;
  type: "product" | "customer" | "invoice";
  title: string;
  subtitle: string;
  link: string;
  icon: React.ReactNode;
}

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const userData = user ? JSON.parse(user) : { fullName: "کاربر", role: "مدیر" };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const [products, customers, invoices] = await Promise.all([
        getProducts(query),
        getCustomers(query),
        getInvoices(),
      ]);

      const searchResults: SearchResult[] = [];

      products.forEach((p: any) => {
        searchResults.push({
          id: p.id,
          type: "product",
          title: p.name,
          subtitle: `${(p.unitPrice / 10).toLocaleString("fa-IR")} تومان · موجودی: ${p.stock}`,
          link: `/products`,
          icon: <Package className="h-4 w-4 text-blue-500" />,
        });
      });

      customers.forEach((c: any) => {
        searchResults.push({
          id: c.id,
          type: "customer",
          title: c.name,
          subtitle: `${c.phone || "بدون تلفن"} · ${c.totalPurchases.toLocaleString("fa-IR")} تومان`,
          link: `/customers`,
          icon: <Users className="h-4 w-4 text-green-500" />,
        });
      });

      invoices.forEach((inv: any) => {
        if (inv.invoiceNumber.includes(query) || inv.customer?.name?.includes(query)) {
          searchResults.push({
            id: inv.id,
            type: "invoice",
            title: inv.invoiceNumber,
            subtitle: `${inv.customer?.name || "نامشخص"} · ${(inv.finalAmount / 10).toLocaleString("fa-IR")} تومان`,
            link: `/invoices`,
            icon: <Receipt className="h-4 w-4 text-purple-500" />,
          });
        }
      });

      setResults(searchResults.slice(0, 10));
      setSelectedIndex(-1);
    } catch (error) {
      console.error("خطا در جستجو:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const result = results[selectedIndex];
      if (result) {
        window.location.href = result.link;
      }
    } else if (e.key === "Escape") {
      setIsSearchFocused(false);
      setSearchQuery("");
    } else if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    window.location.href = result.link;
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* سایدبار */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-20 flex flex-col bg-[color:var(--sidebar-bg)] text-[color:var(--sidebar-fg)] transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-3">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold text-white">سیستم فروش</h1>
          ) : (
            <span className="text-xl font-bold text-white">SF</span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            {isSidebarOpen ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[color:var(--sidebar-active)] text-white shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                  !isSidebarOpen && "justify-center px-2"
                )}
                title={!isSidebarOpen ? item.label : ""}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={logout}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white",
              !isSidebarOpen && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span>خروج</span>}
          </button>
        </div>
      </aside>

      {/* محتوای اصلی */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          isSidebarOpen ? "mr-64" : "mr-16"
        )}
      >
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>

          <div className="flex-1 max-w-2xl mx-auto px-4" ref={searchRef}>
            <div
              className={cn(
                "relative flex items-center gap-2 rounded-full border transition-all duration-300 bg-background",
                isSearchFocused
                  ? "border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30 scale-[1.02]"
                  : "border-border hover:border-blue-300",
              )}
            >
              <Search className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />

              <Input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="جستجو در محصولات، مشتریان، فاکتورها..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-2 px-0 text-right placeholder:text-muted-foreground/70"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}

              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2 flex-shrink-0" />
              )}

              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded border border-border">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </kbd>
              </div>

              {isSearchFocused && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                  {results.length === 0 && !loading ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">نتیجه‌ای یافت نشد</p>
                      <p className="text-xs mt-1">برای جستجوی کامل Enter را فشار دهید</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      <div className="text-xs text-muted-foreground px-3 py-1.5">
                        {results.length} نتیجه
                      </div>
                      {results.map((result, index) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-right",
                            index === selectedIndex ? "bg-blue-50" : "hover:bg-muted",
                          )}
                        >
                          <div className="flex-shrink-0">{result.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full",
                                result.type === "product"
                                  ? "bg-blue-100 text-blue-600"
                                  : result.type === "customer"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-purple-100 text-purple-600",
                              )}
                            >
                              {result.type === "product"
                                ? "محصول"
                                : result.type === "customer"
                                  ? "مشتری"
                                  : "فاکتور"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-[color:var(--info)] text-xs text-white">
                  {userData.fullName?.charAt(0) || "ک"}
                </AvatarFallback>
              </Avatar>
              <div className="text-right leading-tight">
                <div className="text-xs font-semibold">{userData.fullName || "کاربر"}</div>
                <div className="text-[10px] text-muted-foreground">
                  {userData.role === "admin" ? "مدیر سیستم" : userData.role === "sales" ? "فروشنده" : userData.role === "warehouse" ? "انباردار" : "کاربر"}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}