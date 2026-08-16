# 📦 Inventory Management System

> **Complete Warehouse & Inventory System for POS-System** - Full-featured inventory management with RTL support

---

## 📋 Overview

**Inventory Management System** is the dedicated warehouse application for the POS-System project. It provides a complete solution for inventory management, stock control, product tracking, stock adjustments, and inventory reporting.

---

## 🚀 Tech Stack

| Technology | Version | Purpose |
|:---|:---|:---|
| **Next.js** | 16 (App Router) | Full-stack framework |
| **React** | 19 | UI library |
| **Tailwind CSS** | 3.x | Styling |
| **Lucide React** | - | Icons |
| **Recharts** | 2.x | Charts & graphs |
| **React Hook Form** | 7.x | Form management |
| **Zod** | 3.x | Validation |
| **TypeScript** | 5.x | Type safety |
| **XLSX** | 0.18 | Excel export |
| **jsPDF** | 2.x | PDF export |

---

## 📁 Project Structure

```
invoice-inventory-system/
├── app/
│   ├── page.tsx                   # Main inventory page (InventoryPage)
│   ├── login/
│   │   └── page.tsx               # Login page (with role check)
│   └── layout.tsx                 # Root layout with RTL support
├── components/
│   └── inventory/
│       ├── InventoryPage.tsx      # Main inventory management page
│       ├── InventoryStats.tsx     # Inventory statistics cards
│       ├── InventoryCard.tsx      # Product inventory card
│       ├── AddStockModal.tsx      # Add stock modal
│       ├── SubtractStockModal.tsx # Subtract stock modal
│       ├── InventoryList.tsx      # Inventory list with filters
│       ├── StockHistory.tsx       # Stock change history
│       ├── LowStockAlert.tsx      # Low stock alerts
│       ├── NegativeStockAlert.tsx # Negative stock alerts
│       └── ExportButton.tsx       # Export to Excel/PDF
├── lib/
│   ├── inventory-types.ts         # Types and utilities for inventory
│   └── utils.ts                   # Utility functions
├── services/
│   └── api.ts                     # Backend communication
├── hooks/
│   ├── useInventory.ts            # Inventory management hook
│   ├── useProducts.ts             # Products management hook
│   └── useAuth.ts                 # Authentication hook
├── types/
│   └── index.ts                   # TypeScript types
├── public/
│   └── favicon.ico
├── .env.local                     # Environment variables
├── .env.example
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

---

## 🎯 Features

### Authentication
- 🔐 Secure login with phone & password
- 👤 Role-based access control (Warehouse only)
- ⏰ Session management (7-day token expiry)
- 🛡️ Protected routes

### Inventory Dashboard
- 📊 Real-time inventory statistics
  - Total products
  - Total stock units
  - Low stock count
  - Out of stock count
- 📈 Stock trends charts
- 🔔 Inventory alerts
- 📋 Quick actions

### Product Management
- 📦 View all products with stock
- 🔍 Search & filter products
- 🏷️ Product code display
- 📊 Stock levels visualization
- 🟢 Stock status indicators
- 📋 Product details

### Stock Management
- ➕ Add stock with reason
  - Purchase
  - Return
  - Adjustment
  - Transfer
  - Other
- ➖ Subtract stock with reason
  - Sale
  - Damage
  - Loss
  - Transfer
  - Adjustment
  - Other
- 📝 Add notes to stock changes
- 📊 Track stock history

### Inventory Monitoring
- 🚨 Low stock alerts (below minimum)
- ⚠️ Negative inventory alerts
- 📊 Stock level indicators
- 📋 Product stock history
- 📈 Stock movement trends

### Stock History
- 📋 Complete stock change log
- 🔍 Filter by date, product, type
- 📊 Stock movement statistics
- 📤 Export to Excel
- 📋 View change details

### Reports
- 📊 Inventory summary report
- 📈 Stock movement report
- 📦 Product stock report
- 🚨 Low stock report
- 📤 Export to Excel & PDF
- 📋 Print reports

---

## 🎨 UI/UX Features

- 🌙 Clean light mode
- 📱 Fully responsive (mobile & desktop)
- 📐 Clean, card-based layout
- ✨ Smooth animations
- 🖋️ Vazirmatn font (RTL)
- 🔄 RTL complete support
- 🎯 Intuitive navigation
- ⚡ Fast page loads (Next.js)
- 🔔 Toast notifications

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Backend server running (port 5000)

### Step-by-Step Installation

```bash
# 1. Navigate to warehouse system directory
cd invoice-inventory-system

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Edit .env.local with your backend URL
# NEXT_PUBLIC_API_URL=http://localhost:5000

# 5. Start development server
npm run dev
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# App Configuration
NEXT_PUBLIC_APP_NAME=POS Warehouse System
NEXT_PUBLIC_APP_VERSION=1.0.0

# Features
NEXT_PUBLIC_ENABLE_EXPORT=true
NEXT_PUBLIC_ENABLE_STATS=true
NEXT_PUBLIC_LOW_STOCK_THRESHOLD=10
```

---

## 📡 API Integration

The warehouse system connects to the backend API endpoints:

| Feature | API Endpoint |
|:---|:---|
| Auth | `/api/auth/login` |
| Products | `/api/products` |
| Inventory | `/api/inventory` |
| Add Stock | `/api/inventory/add` |
| Subtract Stock | `/api/inventory/subtract` |
| Stock Logs | `/api/inventory/logs` |
| Low Stock | `/api/inventory/low` |
| Negative Stock | `/api/inventory/negative` |

---

## 🧩 Key Components

### InventoryPage
```tsx
<InventoryPage>
  <InventoryStats />
  <InventoryList>
    <InventoryCard />
  </InventoryList>
</InventoryPage>
```

### InventoryStats
```tsx
<InventoryStats
  totalProducts={totalProducts}
  totalStock={totalStock}
  lowStockCount={lowStockCount}
  outOfStockCount={outOfStockCount}
/>
```

### InventoryCard
```tsx
<InventoryCard
  product={product}
  stock={stock}
  onAddStock={handleAddStock}
  onSubtractStock={handleSubtractStock}
  onViewHistory={handleViewHistory}
/>
```

### AddStockModal
```tsx
<AddStockModal
  open={isOpen}
  onOpenChange={setIsOpen}
  productId={productId}
  onSuccess={handleSuccess}
/>
```

### SubtractStockModal
```tsx
<SubtractStockModal
  open={isOpen}
  onOpenChange={setIsOpen}
  productId={productId}
  onSuccess={handleSuccess}
/>
```

---

## 📊 State Management

### React Hooks

#### useInventory
```typescript
const {
  inventory,
  loading,
  error,
  addStock,
  subtractStock,
  getInventoryLogs,
  getLowStock,
  getNegativeStock,
  refresh
} = useInventory();
```

#### useProducts
```typescript
const {
  products,
  loading,
  error,
  getProducts,
  getProductById,
  refresh
} = useProducts();
```

---

## 🛠️ Development Scripts

| Script | Description |
|:---|:---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | TypeScript type checking |

---

## 📦 Build & Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Deployment Options

#### Vercel (Recommended)
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

#### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["npm", "start"]
```

#### Self-Hosted
```bash
# Build
npm run build

# Run with PM2
pm2 start npm --name "pos-warehouse" -- start
```

---

## 📱 Responsive Design

The system is fully responsive with breakpoints:

| Breakpoint | Size | Target |
|:---|:---|:---|
| xs | < 640px | Mobile phones |
| sm | 640px - 768px | Tablets |
| md | 768px - 1024px | Laptops |
| lg | > 1024px | Desktops |

### Mobile Features
- 📱 Touch-friendly cards
- 📋 Scrollable lists
- 🎯 Large tap targets
- 📊 Responsive charts

---

## 🔒 Security Features

- JWT token in HTTP-only cookies (recommended)
- Role-based access control (Warehouse only)
- Input validation with Zod
- XSS protection
- CSRF protection
- Protected routes

---

## 🎨 Theme & Styling

### Colors
```css
:root {
  --primary: #2563eb;
  --primary-light: #3b82f6;
  --secondary: #64748b;
  --success: #22c55e;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #06b6d4;
}
```

### Stock Status Colors
- 🟢 In Stock: Green (stock > minimum)
- 🟡 Low Stock: Yellow (stock <= minimum)
- 🔴 Out of Stock: Red (stock = 0)
- ⚫ Negative: Gray (stock < 0)

### Typography
- **Font:** Vazirmatn (RTL)
- **Sizes:** 12px - 28px
- **Directions:** RTL (Right-to-Left)

---

## 💰 Currency Rules

- **Database:** All amounts stored in **Rial (IRR)**
- **Display:** All amounts shown in **Toman** (divided by 10)
- **Stock Values:** Displayed with proper formatting

---

## 👤 User Roles & Permissions

| Role | Access |
|:---|:---|
| **Admin** | Full inventory access + all features |
| **Warehouse** | Full inventory management only |
| **Sales** | View only (no edit) |
| **Sales Admin** | View only (no edit) |

---

## 🔍 Key Features Explained

### Add Stock Modal
- Select product from dropdown
- Enter quantity
- Select reason (Purchase, Return, Adjustment, Transfer, Other)
- Add optional notes
- Submit with confirmation

### Subtract Stock Modal
- Select product from dropdown
- Enter quantity
- Select reason (Sale, Damage, Loss, Transfer, Adjustment, Other)
- Add optional notes
- Validate against current stock
- Submit with confirmation

### Low Stock Alert
- Products with stock below minimum
- Color-coded alerts
- Quick action to add stock
- Export low stock list

### Negative Stock Alert
- Products with negative stock
- Critical alerts
- Immediate action required
- Track negative stock items

### Stock History
- Complete change log
- Filter by product, type, date
- View reason and notes
- User who made the change
- Timestamp of change

---

## 🐛 Troubleshooting

### Common Issues

1. **API connection error:**
   - Check `NEXT_PUBLIC_API_URL` in .env.local
   - Ensure backend is running
   - Check CORS settings

2. **Build errors:**
   ```bash
   rm -rf .next
   rm -rf node_modules
   npm install
   npm run build
   ```

3. **Stock update errors:**
   - Check if product exists
   - Verify stock quantity
   - Check user permissions
   - Validate input values

4. **Negative stock issues:**
   - Verify subtract quantity
   - Check if product has enough stock
   - Review recent stock changes

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

### Code Style
- Use TypeScript
- Follow Next.js conventions
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

**سیستم مدیریت موجودی** اپلیکیشن اختصاصی انبار برای پروژه POS-System است. این سیستم راه‌حلی کامل برای مدیریت موجودی، کنترل انبار، ردیابی محصولات، تنظیمات موجودی و گزارش‌گیری انبار فراهم می‌کند.

---

## 🚀 تکنولوژی‌ها

| تکنولوژی | نسخه | کاربرد |
|:---|:---|:---|
| **Next.js** | 16 (App Router) | فریم‌ورک کامل |
| **React** | 19 | کتابخانه UI |
| **Tailwind CSS** | 3.x | استایل‌دهی |
| **Lucide React** | - | آیکون‌ها |
| **Recharts** | 2.x | نمودارها |
| **React Hook Form** | 7.x | مدیریت فرم |
| **Zod** | 3.x | اعتبارسنجی |
| **TypeScript** | 5.x | امنیت نوع |
| **XLSX** | 0.18 | خروجی Excel |
| **jsPDF** | 2.x | خروجی PDF |

---

## 📁 ساختار پروژه

```
invoice-inventory-system/
├── app/
│   ├── page.tsx                   # صفحه اصلی انبار
│   ├── login/
│   │   └── page.tsx               # صفحه ورود (با بررسی نقش)
│   └── layout.tsx                 # لی‌آوت اصلی با پشتیبانی RTL
├── components/
│   └── inventory/
│       ├── InventoryPage.tsx      # صفحه اصلی مدیریت موجودی
│       ├── InventoryStats.tsx     # کارت‌های آماری موجودی
│       ├── InventoryCard.tsx      # کارت موجودی محصول
│       ├── AddStockModal.tsx      # مودال افزودن موجودی
│       ├── SubtractStockModal.tsx # مودال کسر موجودی
│       ├── InventoryList.tsx      # لیست موجودی با فیلترها
│       ├── StockHistory.tsx       # تاریخچه تغییرات موجودی
│       ├── LowStockAlert.tsx      # هشدار موجودی کم
│       └── NegativeStockAlert.tsx # هشدار موجودی منفی
├── lib/
│   ├── inventory-types.ts         # تایپ‌ها و ابزارهای موجودی
│   └── utils.ts                   # توابع کمکی
├── services/
│   └── api.ts                     # ارتباط با بک‌اند
├── hooks/
│   ├── useInventory.ts            # هوک مدیریت موجودی
│   ├── useProducts.ts             # هوک مدیریت محصولات
│   └── useAuth.ts                 # هوک احراز هویت
├── .env.local                     # متغیرهای محیطی
└── package.json
```

---

## 🎯 قابلیت‌ها

### احراز هویت
- 🔐 ورود امن با تلفن و رمز عبور
- 👤 کنترل دسترسی مبتنی بر نقش (فقط انباردار)
- ⏰ مدیریت نشست (انقضای ۷ روزه)
- 🛡️ مسیرهای محافظت‌شده

### داشبورد موجودی
- 📊 آمار لحظه‌ای موجودی
  - تعداد کل محصولات
  - تعداد کل واحدهای موجودی
  - تعداد محصولات کم‌موجود
  - تعداد محصولات ناموجود
- 📈 نمودارهای روند موجودی
- 🔔 هشدارهای موجودی
- 📋 اقدامات سریع

### مدیریت محصولات
- 📦 مشاهده همه محصولات با موجودی
- 🔍 جستجو و فیلتر محصولات
- 🏷️ نمایش کد کالا
- 📊 نمایش سطح موجودی
- 🟢 وضعیت موجودی
- 📋 جزئیات محصول

### مدیریت موجودی
- ➕ افزودن موجودی با دلیل
  - خرید
  - برگشت
  - تعدیل
  - انتقال
  - سایر
- ➖ کسر موجودی با دلیل
  - فروش
  - آسیب
  - تلفات
  - انتقال
  - تعدیل
  - سایر
- 📝 یادداشت برای تغییرات موجودی
- 📊 ردیابی تاریخچه موجودی

### مانیتورینگ موجودی
- 🚨 هشدار موجودی کم (زیر حداقل)
- ⚠️ هشدار موجودی منفی
- 📊 نشانگرهای سطح موجودی
- 📋 تاریخچه موجودی محصول
- 📈 روند حرکات موجودی

### تاریخچه موجودی
- 📋 لاگ کامل تغییرات موجودی
- 🔍 فیلتر بر اساس تاریخ، محصول، نوع
- 📊 آمار حرکات موجودی
- 📤 خروجی Excel
- 📋 مشاهده جزئیات تغییرات

### گزارشات
- 📊 گزارش خلاصه موجودی
- 📈 گزارش حرکات موجودی
- 📦 گزارش موجودی محصولات
- 🚨 گزارش موجودی کم
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
# 1. رفتن به دایرکتوری سیستم انبار
cd invoice-inventory-system

# 2. نصب وابستگی‌ها
npm install

# 3. ایجاد فایل محیطی
cp .env.example .env.local

# 4. ویرایش .env.local با آدرس بک‌اند
# NEXT_PUBLIC_API_URL=http://localhost:5000

# 5. شروع سرور توسعه
npm run dev
```

### متغیرهای محیطی

```env
# تنظیمات API
NEXT_PUBLIC_API_URL=http://localhost:5000

# تنظیمات برنامه
NEXT_PUBLIC_APP_NAME=POS Warehouse System
NEXT_PUBLIC_APP_VERSION=1.0.0

# قابلیت‌ها
NEXT_PUBLIC_ENABLE_EXPORT=true
NEXT_PUBLIC_ENABLE_STATS=true
NEXT_PUBLIC_LOW_STOCK_THRESHOLD=10
```

---

## 👤 نقش‌های کاربری و دسترسی‌ها

| نقش | دسترسی |
|:---|:---|
| **ادمین** | دسترسی کامل به موجودی + همه قابلیت‌ها |
| **انباردار** | مدیریت کامل موجودی |
| **فروشنده** | فقط مشاهده (بدون ویرایش) |
| **فروش(ادمین)** | فقط مشاهده (بدون ویرایش) |

---

## 🔍 توضیحات قابلیت‌های کلیدی

### مودال افزودن موجودی
- انتخاب محصول از لیست کشویی
- وارد کردن تعداد
- انتخاب دلیل (خرید، برگشت، تعدیل، انتقال، سایر)
- افزودن یادداشت اختیاری
- ارسال با تأیید

### مودال کسر موجودی
- انتخاب محصول از لیست کشویی
- وارد کردن تعداد
- انتخاب دلیل (فروش، آسیب، تلفات، انتقال، تعدیل، سایر)
- افزودن یادداشت اختیاری
- اعتبارسنجی بر اساس موجودی فعلی
- ارسال با تأیید

### هشدار موجودی کم
- محصولات با موجودی زیر حداقل
- هشدارهای رنگی
- اقدام سریع برای افزودن موجودی
- خروجی لیست موجودی کم

### هشدار موجودی منفی
- محصولات با موجودی منفی
- هشدارهای بحرانی
- نیاز به اقدام فوری
- ردیابی محصولات با موجودی منفی

### تاریخچه موجودی
- لاگ کامل تغییرات
- فیلتر بر اساس محصول، نوع، تاریخ
- مشاهده دلیل و یادداشت
- کاربر انجام‌دهنده تغییر
- زمان تغییر

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

---
