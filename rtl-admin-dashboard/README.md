# 🎛️ RTL Admin Dashboard

> **Complete Admin Panel for POS-System** - Full-featured management dashboard with RTL support

---

## 📋 Overview

**RTL Admin Dashboard** is the comprehensive administration panel for the POS-System project. It provides complete system management capabilities including product management, customer management, user management, invoice management, inventory control, payment settlements, and advanced reporting.

---

## 🚀 Tech Stack

| Technology | Version | Purpose |
|:---|:---|:---|
| **React** | 19 | UI library |
| **Vite** | 5.x | Build tool |
| **TanStack Router** | 1.x | Type-safe routing |
| **TanStack Query** | 5.x | Server state management |
| **Shadcn/ui** | - | Component library |
| **Tailwind CSS** | 3.x | Styling |
| **Recharts** | 2.x | Charts & graphs |
| **XLSX** | 0.18 | Excel export |
| **jsPDF** | 2.x | PDF export |
| **Lucide React** | - | Icons |
| **TypeScript** | 5.x | Type safety |

---

## 📁 Project Structure

```
rtl-admin-dashboard/
├── src/
│   ├── routes/
│   │   ├── __root.tsx              # Root route with QueryClient
│   │   ├── index.tsx               # Dashboard with stats cards & charts
│   │   ├── products.tsx            # Product management (CRUD)
│   │   ├── customers.tsx           # Customer management with purchase stats
│   │   ├── users.tsx               # User management (roles: admin, sales, warehouse, sales_admin)
│   │   ├── invoices.tsx            # Invoice management (details, print, finalize, delete)
│   │   ├── sales-invoices.tsx      # Sales invoices view
│   │   ├── inventory.tsx           # Inventory management (add/subtract)
│   │   ├── customer-settlement.tsx # Customer settlement (partial payments)
│   │   ├── payment-history.tsx     # Payment history with filters & export
│   │   └── reports.tsx             # Complete reports (sales, inventory, customers, sellers)
│   ├── components/
│   │   └── admin/
│   │       ├── AdminLayout.tsx     # Main layout with collapsible sidebar
│   │       ├── StatsCard.tsx       # Dashboard statistics cards
│   │       ├── DataTable.tsx       # Reusable data table with sorting & pagination
│   │       ├── SearchBar.tsx       # Global search component
│   │       └── ExportButton.tsx    # Export to Excel/PDF
│   ├── services/
│   │   └── api.ts                  # API communication (all API functions)
│   ├── hooks/
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── useProducts.ts          # Products management hook
│   │   ├── useCustomers.ts         # Customers management hook
│   │   └── useInvoices.ts          # Invoices management hook
│   ├── lib/
│   │   ├── utils.ts               # Utility functions
│   │   └── validations.ts         # Form validations
│   ├── types/
│   │   └── index.ts               # TypeScript types & interfaces
│   └── styles/
│       └── globals.css            # Global styles (RTL + Vazirmatn font)
├── public/
│   └── favicon.svg
├── .env                           # VITE_API_URL
├── .env.example                   # Example environment file
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🎯 Features

### Dashboard
- 📊 Real-time statistics cards
  - Total revenue (today, this week, this month)
  - Number of invoices
  - Active customers
  - Low stock alerts
- 📈 Sales charts (daily/weekly/monthly)
- 🔔 Recent activities
- 🏷️ Quick access to key sections

### Product Management
- ✅ Full CRUD operations
- 🔍 Search & filter products
- 🏷️ Unique product code (optional)
- 📦 Unit types: Bottle, Carton, Liter
- 📊 Carton quantity settings
- 💰 Unit & carton pricing (auto-calculated)
- 📦 Stock & minimum stock levels
- 🟢 In/Out of stock status
- 📋 Bulk import/export (Excel)

### Customer Management
- ✅ Full CRUD operations
- 🔍 Search & filter customers
- 📊 Purchase history & statistics
- 💰 Debt calculation
- 📅 Last purchase date
- 🏆 Top customers ranking
- 📤 Export to Excel/PDF

### User Management (Admin only)
- ✅ Full CRUD operations
- 👤 Roles: `admin`, `sales`, `warehouse`, `sales_admin`
- 🔒 Enable/disable users
- 🔑 Reset password
- 📋 User activity logs

### Invoice Management
- 📄 View all invoices
- 🔍 Filter by status (draft, final, paid, settled)
- 📋 Invoice details with items
- 🖨️ Print invoice
- ✅ Finalize draft invoices
- 🗑️ Delete invoices (with confirmation)
- 📊 Sales invoice view

### Inventory Management
- 📦 View all products with stock
- ➕ Add stock with reason
- ➖ Subtract stock with reason
- 🚨 Low stock products view
- ⚠️ Negative inventory monitoring
- 📋 Inventory logs
- 📊 Stock history

### Customer Settlement
- 💰 List of customers with debt
- 💳 Register partial payments
- 📝 Add payment notes
- 📊 Payment history
- 🔄 Adjust customer debt
- 📤 Export payment history

### Reports
- 📊 Sales reports (daily/weekly/monthly)
- 📦 Inventory reports (stock, inbound, outbound)
- 👥 Customer reports (top 5 customers)
- 👤 Seller reports (with 4% commission)
- 📈 Sales trends
- 📊 Product performance
- 📤 Export to Excel & PDF
- 📋 Print reports

### Payment History
- 💳 Complete payment history
- 🔍 Filter by date, customer, invoice
- 📊 Payment statistics
- 📤 Export to Excel
- 📋 View payment details

---

## 🎨 UI/UX Features

- 🌙 Light mode with subtle colors
- 📱 Fully responsive (mobile & desktop)
- 📐 Collapsible sidebar
- ✨ Smooth animations
- 🖋️ Vazirmatn font
- 🔄 RTL complete support
- 🎯 Intuitive navigation
- ⚡ Fast loading with Vite
- ♿ Accessibility (WAI-ARIA)

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Backend server running (port 5000)

### Step-by-Step Installation

```bash
# 1. Navigate to admin directory
cd rtl-admin-dashboard

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your backend URL
# VITE_API_URL=http://localhost:5000

# 5. Start development server
npm run dev
```

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=POS Admin Panel
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_EXCEL_EXPORT=true
VITE_ENABLE_PDF_EXPORT=true
VITE_ENABLE_NOTIFICATIONS=true
```

---

## 📡 API Integration

The dashboard connects to the backend API endpoints:

| Feature | API Endpoint |
|:---|:---|
| Auth | `/api/auth/*` |
| Users | `/api/users/*` |
| Products | `/api/products/*` |
| Customers | `/api/customers/*` |
| Invoices | `/api/invoices/*` |
| Inventory | `/api/inventory/*` |
| Payments | `/api/payments/*` |
| Reports | `/api/reports/*` |

---

## 🧩 Key Components

### AdminLayout
```tsx
<AdminLayout>
  {/* Sidebar with navigation */}
  {/* Main content area */}
  {/* Header with user info */}
</AdminLayout>
```

### DataTable
```tsx
<DataTable
  data={data}
  columns={columns}
  loading={isLoading}
  onSearch={handleSearch}
  onSort={handleSort}
  pagination={pagination}
/>
```

### StatsCard
```tsx
<StatsCard
  title="Total Revenue"
  value={totalRevenue}
  icon={<DollarSign />}
  trend={+12.5}
  color="blue"
/>
```

---

## 📊 State Management

### TanStack Query
- Server state caching
- Automatic refetching
- Optimistic updates
- Query invalidation

```typescript
// Example: Products query
const { data: products, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: () => api.getProducts(),
});

// Example: Mutation
const createProduct = useMutation({
  mutationFn: api.createProduct,
  onSuccess: () => {
    queryClient.invalidateQueries(['products']);
  },
});
```

### TanStack Router
- Type-safe routing
- Nested routes
- Route pre-loading
- Search parameters

```typescript
// Example: Route definition
export const Route = createFileRoute('/products')({
  component: ProductsPage,
  loader: () => fetchProducts(),
});
```

---

## 🛠️ Development Scripts

| Script | Description |
|:---|:---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | TypeScript type checking |

---

## 📦 Build & Deployment

### Production Build
```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

### Deployment Options

#### Vercel
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

#### Netlify
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

#### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📱 Responsive Design

The dashboard is fully responsive with breakpoints:

| Breakpoint | Size | Target |
|:---|:---|:---|
| xs | < 640px | Mobile phones |
| sm | 640px - 768px | Tablets |
| md | 768px - 1024px | Laptops |
| lg | 1024px - 1280px | Desktops |
| xl | > 1280px | Large screens |

### Mobile Features
- 🗂️ Collapsible sidebar (hamburger menu)
- 📱 Touch-friendly buttons
- 📋 Scrollable tables
- 📊 Optimized charts

---

## 🔒 Security

- JWT token stored in HTTP-only cookies
- Role-based route protection
- API request interceptor for auth
- Form validation
- XSS protection
- CSRF protection

---

## 🎨 Theme & Styling

### Colors
```css
:root {
  --primary: #3b82f6;
  --secondary: #64748b;
  --success: #22c55e;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #06b6d4;
}
```

### Typography
- **Font:** Vazirmatn
- **Directions:** RTL (Right-to-Left)
- **Sizes:** 12px - 32px

---

## 🐛 Troubleshooting

### Common Issues

1. **API connection error:**
   - Check `VITE_API_URL` in .env
   - Ensure backend is running
   - Check CORS settings

2. **Build errors:**
   ```bash
   rm -rf node_modules
   rm -rf dist
   npm install
   npm run build
   ```

3. **Typescript errors:**
   ```bash
   npm run type-check
   ```

4. **Routing issues:**
   - Check route paths
   - Ensure routes are registered

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

### Code Style
- Use TypeScript
- Follow ESLint rules
- Use functional components
- Add JSDoc comments
- Write unit tests

---

## 📞 Support

- **Developer:** Ilya Farahani
- **Email:** ilyafarahanii@gmail.com
- **GitHub:** https://github.com/here-is-leo
- **Project:** https://github.com/here-is-leo/pos-system

---

## 📜 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

## 🇮🇷 نسخه فارسی

### 📋 نمای کلی

**RTL Admin Dashboard** پنل مدیریت جامع برای پروژه POS-System است. این پنل قابلیت‌های کامل مدیریت سیستم شامل مدیریت محصولات، مدیریت مشتریان، مدیریت کاربران، مدیریت فاکتورها، کنترل موجودی، تسویه حساب مشتریان و گزارش‌گیری پیشرفته را فراهم می‌کند.

---

## 🚀 تکنولوژی‌ها

| تکنولوژی | نسخه | کاربرد |
|:---|:---|:---|
| **React** | 19 | کتابخانه UI |
| **Vite** | 5.x | ابزار ساخت |
| **TanStack Router** | 1.x | مسیریابی نوع‌امن |
| **TanStack Query** | 5.x | مدیریت state سرور |
| **Shadcn/ui** | - | کتابخانه کامپوننت |
| **Tailwind CSS** | 3.x | استایل‌دهی |
| **Recharts** | 2.x | نمودارها |
| **XLSX** | 0.18 | خروجی Excel |
| **jsPDF** | 2.x | خروجی PDF |
| **Lucide React** | - | آیکون‌ها |
| **TypeScript** | 5.x | امنیت نوع |

---

## 📁 ساختار پروژه

```
rtl-admin-dashboard/
├── src/
│   ├── routes/
│   │   ├── __root.tsx              # مسیر ریشه با QueryClient
│   │   ├── index.tsx               # داشبورد با کارت‌های آماری و نمودار
│   │   ├── products.tsx            # مدیریت محصولات (CRUD)
│   │   ├── customers.tsx           # مدیریت مشتریان با آمار خرید
│   │   ├── users.tsx               # مدیریت کاربران (نقش‌ها)
│   │   ├── invoices.tsx            # مدیریت فاکتورها
│   │   ├── sales-invoices.tsx      # فاکتورهای فروشندگان
│   │   ├── inventory.tsx           # مدیریت موجودی
│   │   ├── customer-settlement.tsx # تسویه مشتریان
│   │   ├── payment-history.tsx     # تاریخچه پرداخت‌ها
│   │   └── reports.tsx             # گزارشات کامل
│   ├── components/
│   │   └── admin/
│   │       ├── AdminLayout.tsx     # لی‌آوت اصلی با سایدبار
│   │       ├── StatsCard.tsx       # کارت‌های آمار داشبورد
│   │       ├── DataTable.tsx       # جدول داده قابل استفاده مجدد
│   │       └── ExportButton.tsx    # دکمه خروجی
│   ├── services/
│   │   └── api.ts                  # ارتباط با API
│   ├── hooks/
│   │   ├── useAuth.ts              # هوک احراز هویت
│   │   ├── useProducts.ts          # هوک مدیریت محصولات
│   │   └── useCustomers.ts         # هوک مدیریت مشتریان
│   ├── lib/
│   │   ├── utils.ts               # توابع کمکی
│   │   └── validations.ts         # اعتبارسنجی فرم‌ها
│   ├── types/
│   │   └── index.ts               # تایپ‌های TypeScript
│   └── styles/
│       └── globals.css            # استایل‌های عمومی (RTL)
├── .env                           # VITE_API_URL
├── .env.example
├── package.json
└── README.md
```

---

## 🎯 قابلیت‌ها

### داشبورد
- 📊 کارت‌های آمار لحظه‌ای
  - درآمد کل (امروز، این هفته، این ماه)
  - تعداد فاکتورها
  - مشتریان فعال
  - هشدار موجودی کم
- 📈 نمودارهای فروش (روزانه/هفتگی/ماهانه)
- 🔔 فعالیت‌های اخیر
- 🏷️ دسترسی سریع به بخش‌های اصلی

### مدیریت محصولات
- ✅ عملیات کامل CRUD
- 🔍 جستجو و فیلتر محصولات
- 🏷️ کد کالا (یکتا، اختیاری)
- 📦 انواع واحد: بطری، کارتن، لیتر
- 📊 تنظیم تعداد در کارتن
- 💰 قیمت هر واحد و کارتن (محاسبه خودکار)
- 📦 موجودی و حداقل موجودی
- 🟢 وضعیت موجود/ناموجود
- 📋 واردات/خروجی انبوه (Excel)

### مدیریت مشتریان
- ✅ عملیات کامل CRUD
- 🔍 جستجو و فیلتر مشتریان
- 📊 تاریخچه و آمار خرید
- 💰 محاسبه بدهی
- 📅 تاریخ آخرین خرید
- 🏆 رتبه‌بندی مشتریان برتر
- 📤 خروجی Excel/PDF

### مدیریت کاربران (فقط ادمین)
- ✅ عملیات کامل CRUD
- 👤 نقش‌ها: `admin`, `sales`, `warehouse`, `sales_admin`
- 🔒 فعال/غیرفعال کردن کاربران
- 🔑 بازنشانی رمز عبور
- 📋 لاگ فعالیت‌های کاربران

### مدیریت فاکتورها
- 📄 مشاهده همه فاکتورها
- 🔍 فیلتر بر اساس وضعیت (پیش‌نویس، نهایی، پرداخت، تسویه)
- 📋 جزئیات فاکتور با آیتم‌ها
- 🖨️ چاپ فاکتور
- ✅ نهایی‌سازی فاکتورهای پیش‌نویس
- 🗑️ حذف فاکتورها (با تأیید)
- 📊 مشاهده فاکتورهای فروشندگان

### مدیریت موجودی
- 📦 مشاهده همه محصولات با موجودی
- ➕ افزودن موجودی با دلیل
- ➖ کسر موجودی با دلیل
- 🚨 مشاهده محصولات کم‌موجود
- ⚠️ مانیتورینگ موجودی منفی
- 📋 لاگ‌های موجودی
- 📊 تاریخچه موجودی

### تسویه مشتریان
- 💰 لیست مشتریان با بدهی
- 💳 ثبت پرداخت جزئی
- 📝 یادداشت پرداخت
- 📊 تاریخچه پرداخت‌ها
- 🔄 اصلاح بدهی مشتری
- 📤 خروجی تاریخچه پرداخت

### گزارشات
- 📊 گزارش فروش (روزانه/هفتگی/ماهانه)
- 📦 گزارش انبار (موجودی، ورود، خروج)
- 👥 گزارش مشتریان (۵ مشتری برتر)
- 👤 گزارش فروشندگان (با کمیسیون ۴%)
- 📈 روند فروش
- 📊 عملکرد محصولات
- 📤 خروجی Excel و PDF
- 📋 چاپ گزارشات

---

## 🔧 نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 18+
- npm یا pnpm
- سرور بک‌اند در حال اجرا (پورت 5000)

### مراحل نصب

```bash
# 1. رفتن به دایرکتوری ادمین
cd rtl-admin-dashboard

# 2. نصب وابستگی‌ها
npm install

# 3. ایجاد فایل محیطی
cp .env.example .env

# 4. ویرایش .env با آدرس بک‌اند
# VITE_API_URL=http://localhost:5000

# 5. شروع سرور توسعه
npm run dev
```

---

## 📞 پشتیبانی

- **توسعه‌دهنده:** ایلیا فراهانی
- **ایمیل:** ilyafarahanii@gmail.com
- **گیت‌هاب:** https://github.com/here-is-leo
- **پروژه:** https://github.com/here-is-leo/pos-system

---

## 📜 لایسنس

مجوز MIT - برای جزئیات به فایل [LICENSE](../LICENSE) مراجعه کنید.

---

**توسعه‌دهنده:** ایلیا فراهانی  
**آخرین بروزرسانی:** ۱۴۰۴/۰۵/۲۰