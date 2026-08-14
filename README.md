# 📚 POS-System - Complete Documentation

## 🌐 English Version

### 📋 Project Overview

**POS-System** is a comprehensive Point of Sale and Inventory Management System built with modern web technologies. The system consists of four separate applications working together to provide a complete business management solution.

---

## 🏗️ System Architecture

### 1. **Backend - Port 5000**
- **Technology:** Node.js + Express + Prisma + SQLite
- **Responsibility:** API management, authentication, database operations
- **Path:** `pos-backend/`

### 2. **Admin Panel - Port 8080**
- **Technology:** React + Vite + TanStack Router + Shadcn/ui
- **Responsibility:** Complete system management (products, customers, users, invoices, inventory, reports, settlements)
- **Path:** `rtl-admin-dashboard/`

### 3. **Sales System - Port 3000**
- **Technology:** Next.js 16 (App Router) + Tailwind CSS
- **Responsibility:** Invoice generation, shopping cart management, invoice printing
- **Path:** `invoice-management-system/`

### 4. **Warehouse System - Port 3001**
- **Technology:** Next.js 16 (App Router) + Tailwind CSS
- **Responsibility:** Inventory management, adding/subtracting stock
- **Path:** `invoice-inventory-system/`

---

## 🔑 Login Credentials

| Role | Phone | Password |
|:---|:---|:---|
| Admin | `09121112233` | `123456` |
| Sales | Created by Admin | - |
| Warehouse | Created by Admin | - |
| Sales Admin | Created by Admin | - |

---

## 📁 Project Structure

### **Backend (`pos-backend/`)**
```
pos-backend/
├── prisma/
│   └── schema.prisma          # Database models
├── src/
│   └── index.ts               # Main Express file (all APIs)
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

### **Admin (`rtl-admin-dashboard/`)**
```
rtl-admin-dashboard/
├── src/
│   ├── routes/                # All admin routes
│   ├── components/            # Admin components
│   └── services/              # API communication
├── .env                       # VITE_API_URL
└── package.json
```

### **Sales System (`invoice-management-system/`)**
```
invoice-management-system/
├── app/
│   ├── page.tsx              # Main invoice page
│   └── login/                # Login page
├── components/               # Invoice components
├── lib/                      # Types and utilities
└── services/                 # API communication
```

### **Warehouse System (`invoice-inventory-system/`)**
```
invoice-inventory-system/
├── app/
│   ├── page.tsx              # Main inventory page
│   └── login/                # Login page
├── components/               # Inventory components
└── services/                 # API communication
```

---

## 🎯 Main Features

### **User Management (Admin)**
- Create, edit, delete users
- Assign roles: `admin`, `sales`, `warehouse`, `sales_admin`
- Enable/disable users

### **Product Management (Admin & Sales)**
- Create, edit, delete products
- Unique product code (optional)
- Barcode support
- Unit types: Bottle, Carton, Liter
- Carton quantity settings
- Unit & carton pricing (auto-calculated)
- Stock and minimum stock levels
- In/Out of stock status

### **Customer Management (Admin & Sales)**
- Create, edit, delete customers
- Purchase history and statistics
- Debt calculation
- Partial payment settlement

### **Invoice Generation (Sales)**
- Customer selection (search & create)
- Product addition with unit selection
- Order and carton calculations
- Discount application (item & total)
- Invoice registration (draft)
- Invoice printing with product codes
- "Draft" watermark for regular sellers
- Display customer's previous debt

### **Inventory Management (Admin & Warehouse)**
- Product list with current stock
- Add stock with reason
- Subtract stock with reason
- Low stock products view
- Negative inventory monitoring

### **Reports (Admin)**
- Sales reports (daily, weekly, monthly)
- Inventory reports (stock, inbound, outbound)
- Customer reports (top 5 customers)
- Seller reports (with 4% commission)
- Excel and PDF export

### **Customer Settlements (Admin)**
- Debtor customer list
- Partial payment recording
- Payment history
- Debt adjustment

---

## 🔧 Installation & Setup

### **Prerequisites**
- Node.js 18+
- npm or pnpm

### **Installation Steps**

```bash
# 1. Clone the repository
git clone https://github.com/here-is-leo/pos-system.git
cd pos-system

# 2. Backend
cd pos-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev

# 3. Admin Panel
cd ../rtl-admin-dashboard
npm install
npm run dev

# 4. Sales System
cd ../invoice-management-system
npm install
npm run dev

# 5. Warehouse System
cd ../invoice-inventory-system
npm install
npm run dev
```

### **Environment Variables**

**Backend (`.env`):**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=5000
```

**Admin (`.env`):**
```env
VITE_API_URL="http://localhost:5000"
```

---

## 📊 Database Models

### **Core Models:**

| Model | Description |
|:---|:---|
| **User** | System users with different roles |
| **Product** | Products with codes, units, pricing |
| **Customer** | Customers with purchase history |
| **Invoice** | Invoices with status (draft, final, paid, settled) |
| **InvoiceItem** | Invoice line items with discounts |
| **Inventory** | Warehouse stock |
| **InventoryLog** | Stock change logs |
| **PaymentTransaction** | Payment transactions |
| **Notification** | System notifications |

---

## 🛠️ Technologies Used

| Section | Technology | Version |
|:---|:---|:---|
| Backend | Node.js + Express | 18+ |
| Database | SQLite (Prisma ORM) | - |
| Admin | React + Vite + TanStack | 19 |
| Sales | Next.js (App Router) | 16 |
| Warehouse | Next.js (App Router) | 16 |
| UI | Tailwind CSS + Shadcn/ui | - |
| Icons | Lucide React | - |
| Charts | Recharts | - |
| Export | XLSX, jsPDF | - |

---

## 🔐 Security Features

- JWT Authentication (7-day expiry)
- bcrypt for password hashing
- Rate Limiting (Brute Force protection)
- Captcha (after 3 failed attempts)
- Role-based access control
- CORS restriction to allowed domains

---

## 🎨 UI/UX Design

- Light mode with subtle colors
- Fully responsive (mobile & desktop)
- Collapsible sidebar
- Smooth animations
- Vazirmatn font
- RTL complete support

---

## 💰 Currency Rules

- **Database:** All amounts stored in **Rial (IRR)**
- **Display:** All amounts shown in **Toman** (divided by 10)
- **Printed Invoice:** Displayed in **Rial** with "Rial" label
- **Carton Formula:** Carton price = Unit price × Quantity per carton

---

## 👤 User Roles & Permissions

| Role | Access |
|:---|:---|
| **Admin** | Full access to all sections |
| **Sales Admin** | Invoice creation + view counts + no watermark + view users |
| **Sales** | Invoice creation only + restrictions + watermark |
| **Warehouse** | Inventory management only |

---

## 📋 Important API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| POST | `/api/auth/login` | User login |
| GET | `/api/products` | Get products |
| POST | `/api/products` | Create product |
| GET | `/api/customers` | Get customers |
| GET | `/api/invoices` | Get invoices |
| POST | `/api/invoices` | Create invoice |
| POST | `/api/invoices/:id/finalize` | Finalize invoice |
| GET | `/api/inventory` | Get inventory |
| POST | `/api/inventory/add` | Add stock |
| POST | `/api/inventory/subtract` | Subtract stock |
| GET | `/api/customers/with-debt` | Customers with debt |
| POST | `/api/payments` | Record payment |

---

## 📄 Export Formats

- **PDF:** Invoices, Reports
- **Excel:** Sales, Sellers, Customers, Inventory reports

---

## 🚀 Deployment

1. Configure environment variables
2. Set `NODE_ENV=production`
3. Switch to PostgreSQL (optional)
4. Use PM2 for process management

---

## 🐛 Troubleshooting

### Common Issues:

1. **Port conflicts:**
   ```bash
   # Kill process on port
   npx kill-port 5000
   ```

2. **Prisma errors:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Dependency issues:**
   ```bash
   rm -rf node_modules
   npm install
   ```

4. **CORS errors:**
   - Check `VITE_API_URL` in admin .env
   - Ensure backend is running

---

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards:
- Use TypeScript
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

---

## 📞 Contact & Support

- **Developer:** Ilya Farahani
- **Email:** ilyafarahanii@gmail.com
- **GitHub:** [https://github.com/here-is-leo](https://github.com/here-is-leo)
- **Project Repository:** [https://github.com/here-is-leo/pos-system](https://github.com/here-is-leo/pos-system)
- **API Documentation:** [Swagger](https://your-domain.com/api-docs)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

---

## 🇮🇷 نسخه فارسی

### 📋 نمای کلی پروژه

**POS-System** یک سیستم جامع فروش و مدیریت انبار است که با استفاده از فناوری‌های مدرن وب ساخته شده است. این سیستم از چهار اپلیکیشن جداگانه تشکیل شده که با هم یک راه‌حل کامل مدیریت کسب‌وکار را ارائه می‌دهند.

---

## 🏗️ معماری سیستم

### 1. **بک‌اند - پورت 5000**
- **تکنولوژی:** Node.js + Express + Prisma + SQLite
- **مسئولیت:** مدیریت API، احراز هویت، عملیات دیتابیس
- **مسیر:** `pos-backend/`

### 2. **پنل ادمین - پورت 8080**
- **تکنولوژی:** React + Vite + TanStack Router + Shadcn/ui
- **مسئولیت:** مدیریت کامل سیستم (محصولات، مشتریان، کاربران، فاکتورها، موجودی، گزارشات، تسویه)
- **مسیر:** `rtl-admin-dashboard/`

### 3. **سیستم فروشنده - پورت 3000**
- **تکنولوژی:** Next.js 16 (App Router) + Tailwind CSS
- **مسئولیت:** صدور فاکتور، مدیریت سبد خرید، چاپ فاکتور
- **مسیر:** `invoice-management-system/`

### 4. **سیستم انباردار - پورت 3001**
- **تکنولوژی:** Next.js 16 (App Router) + Tailwind CSS
- **مسئولیت:** مدیریت موجودی، افزودن/کسر موجودی
- **مسیر:** `invoice-inventory-system/`

---

## 🔑 اطلاعات ورود

| نقش | تلفن | رمز عبور |
|:---|:---|:---|
| ادمین | `09121112233` | `123456` |
| فروشنده | ساخته شده توسط ادمین | - |
| انباردار | ساخته شده توسط ادمین | - |
| فروش(ادمین) | ساخته شده توسط ادمین | - |

---

## 📁 ساختار پروژه

### **بک‌اند (`pos-backend/`)**
```
pos-backend/
├── prisma/
│   └── schema.prisma          # مدل‌های دیتابیس
├── src/
│   └── index.ts               # فایل اصلی Express
├── .env                       # متغیرهای محیطی
├── package.json
└── tsconfig.json
```

### **ادمین (`rtl-admin-dashboard/`)**
```
rtl-admin-dashboard/
├── src/
│   ├── routes/                # همه مسیرهای ادمین
│   ├── components/            # کامپوننت‌های ادمین
│   └── services/              # ارتباط با API
├── .env                       # VITE_API_URL
└── package.json
```

### **سیستم فروشنده (`invoice-management-system/`)**
```
invoice-management-system/
├── app/
│   ├── page.tsx              # صفحه اصلی فاکتور
│   └── login/                # صفحه ورود
├── components/               # کامپوننت‌های فاکتور
├── lib/                      # تایپ‌ها و ابزارها
└── services/                 # ارتباط با API
```

### **سیستم انباردار (`invoice-inventory-system/`)**
```
invoice-inventory-system/
├── app/
│   ├── page.tsx              # صفحه اصلی انبار
│   └── login/                # صفحه ورود
├── components/               # کامپوننت‌های انبار
└── services/                 # ارتباط با API
```

---

## 🎯 قابلیت‌های اصلی

### **مدیریت کاربران (ادمین)**
- ایجاد، ویرایش، حذف کاربران
- تعیین نقش‌ها: `admin`, `sales`, `warehouse`, `sales_admin`
- فعال/غیرفعال کردن کاربران

### **مدیریت محصولات (ادمین و فروشنده)**
- ایجاد، ویرایش، حذف محصولات
- کد کالا (یکتا، اختیاری)
- پشتیبانی از بارکد
- انواع واحد: بطری، کارتن، لیتر
- تنظیم تعداد در کارتن
- قیمت هر واحد و قیمت کارتن (محاسبه خودکار)
- موجودی و حداقل موجودی
- وضعیت موجود/ناموجود

### **مدیریت مشتریان (ادمین و فروشنده)**
- ایجاد، ویرایش، حذف مشتریان
- تاریخچه خرید و آمار
- محاسبه بدهی
- تسویه حساب (پرداخت جزئی)

### **صدور فاکتور (فروشنده)**
- انتخاب مشتری (جستجو و ایجاد جدید)
- افزودن کالا با انتخاب نوع واحد
- محاسبه سفارش و کارتن
- اعمال تخفیف (آیتمی و کلی)
- ثبت فاکتور (پیش‌نویس)
- چاپ فاکتور با کد کالا
- واترمارک "پیش‌نویس" برای فروشندگان عادی
- نمایش بدهی قبلی مشتری

### **مدیریت موجودی (ادمین و انباردار)**
- نمایش لیست محصولات با موجودی
- افزودن موجودی (با دلیل)
- کسر موجودی (با دلیل)
- مشاهده محصولات کم‌موجود
- مشاهده موجودی منفی

### **گزارشات (ادمین)**
- گزارش فروش (روزانه، هفتگی، ماهانه)
- گزارش انبار (موجودی، ورود، خروج)
- گزارش مشتریان (۵ مشتری برتر)
- گزارش فروشندگان (با کمیسیون ۴%)
- خروجی Excel و PDF

### **تسویه مشتریان (ادمین)**
- لیست مشتریان با بدهی
- ثبت پرداخت جزئی
- تاریخچه پرداخت‌ها
- اصلاح بدهی

---

## 🔧 نصب و راه‌اندازی

### **پیش‌نیازها**
- Node.js 18+
- npm یا pnpm

### **مراحل نصب**

```bash
# 1. کلون کردن مخزن
git clone https://github.com/here-is-leo/pos-system.git
cd pos-system

# 2. بک‌اند
cd pos-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev

# 3. پنل ادمین
cd ../rtl-admin-dashboard
npm install
npm run dev

# 4. سیستم فروشنده
cd ../invoice-management-system
npm install
npm run dev

# 5. سیستم انباردار
cd ../invoice-inventory-system
npm install
npm run dev
```

### **متغیرهای محیطی**

**بک‌اند (`.env`):**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=5000
```

**ادمین (`.env`):**
```env
VITE_API_URL="http://localhost:5000"
```

---

## 📊 مدل‌های دیتابیس

### **مدل‌های اصلی:**

| مدل | توضیحات |
|:---|:---|
| **User** | کاربران سیستم با نقش‌های مختلف |
| **Product** | محصولات با کد، واحد، قیمت |
| **Customer** | مشتریان با تاریخچه خرید |
| **Invoice** | فاکتورها با وضعیت (پیش‌نویس، نهایی، پرداخت، تسویه) |
| **InvoiceItem** | آیتم‌های فاکتور با تخفیف |
| **Inventory** | موجودی انبار |
| **InventoryLog** | لاگ تغییرات موجودی |
| **PaymentTransaction** | تراکنش‌های پرداخت |
| **Notification** | نوتیفیکیشن‌ها |

---

## 🛠️ تکنولوژی‌های استفاده‌شده

| بخش | تکنولوژی | نسخه |
|:---|:---|:---|
| بک‌اند | Node.js + Express | 18+ |
| دیتابیس | SQLite (Prisma ORM) | - |
| ادمین | React + Vite + TanStack | 19 |
| فروشنده | Next.js (App Router) | 16 |
| انباردار | Next.js (App Router) | 16 |
| UI | Tailwind CSS + Shadcn/ui | - |
| آیکون‌ها | Lucide React | - |
| نمودار | Recharts | - |
| خروجی | XLSX, jsPDF | - |

---

## 🔐 ویژگی‌های امنیتی

- احراز هویت JWT (انقضای ۷ روز)
- هش کردن رمز عبور با bcrypt
- محدودیت درخواست (محافظت در برابر Brute Force)
- کپچا (بعد از ۳ تلاش ناموفق)
- کنترل دسترسی مبتنی بر نقش
- محدودیت CORS به دامنه‌های مجاز

---

## 🎨 طراحی UI/UX

- لایت مود با رنگ‌های ملایم
- کاملاً ریسپانسیو (موبایل و دسکتاپ)
- سایدبار قابل باز/بسته شدن
- انیمیشن‌های روان
- فونت وزیرمتن
- پشتیبانی کامل از راست‌چینی

---

## 💰 قوانین واحد پول

- **دیتابیس:** همه مبالغ به **ریال** ذخیره می‌شوند
- **نمایش:** همه مبالغ به **تومان** نمایش داده می‌شوند (تقسیم بر ۱۰)
- **فاکتور چاپی:** نمایش به **ریال** با برچسب "ریال"
- **فرمول کارتن:** قیمت کارتن = قیمت هر واحد × تعداد در کارتن

---

## 👤 نقش‌های کاربری و دسترسی‌ها

| نقش | دسترسی |
|:---|:---|
| **ادمین** | دسترسی کامل به همه بخش‌ها |
| **فروش(ادمین)** | صدور فاکتور + دیدن تعداد + بدون واترمارک + دیدن کاربران |
| **فروشنده** | فقط صدور فاکتور + محدودیت + واترمارک |
| **انباردار** | فقط مدیریت موجودی |

---

## 📋 APIهای مهم

| متد | مسیر | توضیح |
|:---|:---|:---|
| POST | `/api/auth/login` | ورود به سیستم |
| GET | `/api/products` | دریافت محصولات |
| POST | `/api/products` | ایجاد محصول |
| GET | `/api/customers` | دریافت مشتریان |
| GET | `/api/invoices` | دریافت فاکتورها |
| POST | `/api/invoices` | ایجاد فاکتور |
| POST | `/api/invoices/:id/finalize` | نهایی‌سازی فاکتور |
| GET | `/api/inventory` | دریافت موجودی |
| POST | `/api/inventory/add` | افزودن موجودی |
| POST | `/api/inventory/subtract` | کسر موجودی |
| GET | `/api/customers/with-debt` | مشتریان با بدهی |
| POST | `/api/payments` | ثبت پرداخت |

---

## 📄 فرمت‌های خروجی

- **PDF:** فاکتورها، گزارشات
- **Excel:** گزارشات فروش، فروشندگان، مشتریان، انبار

---

## 🚀 دیپلوی

1. متغیرهای محیطی را تنظیم کنید
2. `NODE_ENV=production` را فعال کنید
3. دیتابیس را به PostgreSQL تغییر دهید (اختیاری)
4. از PM2 برای مدیریت فرآیندها استفاده کنید

---

## 🐛 عیب‌یابی

### مشکلات رایج:

1. **تداخل پورت:**
   ```bash
   # کشتن فرآیند روی پورت
   npx kill-port 5000
   ```

2. **خطاهای Prisma:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **مشکلات وابستگی‌ها:**
   ```bash
   rm -rf node_modules
   npm install
   ```

4. **خطاهای CORS:**
   - آدرس `VITE_API_URL` را در .env ادمین بررسی کنید
   - مطمئن شوید بک‌اند در حال اجرا است

---

## 👥 مشارکت در توسعه

1. مخزن را Fork کنید
2. یک شاخه ویژگی ایجاد کنید (`git checkout -b feature/AmazingFeature`)
3. تغییرات را commit کنید (`git commit -m 'Add AmazingFeature'`)
4. به شاخه push کنید (`git push origin feature/AmazingFeature`)
5. یک Pull Request باز کنید

### استانداردهای کدنویسی:
- استفاده از TypeScript
- رعایت قوانین ESLint
- نوشتن پیام‌های commit معنادار
- اضافه کردن کامنت برای منطق‌های پیچیده
- به‌روزرسانی مستندات

---

## 📞 اطلاعات تماس و پشتیبانی

- **توسعه‌دهنده:** ایلیا فراهانی
- **ایمیل:** ilyafarahanii@gmail.com
- **گیت‌هاب:** [https://github.com/here-is-leo](https://github.com/here-is-leo)
- **مخزن پروژه:** [https://github.com/here-is-leo/pos-system](https://github.com/here-is-leo/pos-system)
- **مستندات API:** [Swagger](https://your-domain.com/api-docs)

---

## 📜 لایسنس

این پروژه تحت مجوز MIT منتشر شده است - برای جزئیات به فایل [LICENSE](LICENSE) مراجعه کنید.

---

## 🙏 قدردانی

- [Express.js](https://expressjs.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

### 📝 نکات تکمیلی

- برای مشاهده مستندات کامل API، پس از اجرای بک‌اند به آدرس `/api-docs` مراجعه کنید
- تمامی اپلیکیشن‌ها از راست‌چینی کامل پشتیبانی می‌کنند
- سیستم به‌صورت پیش‌فرض از SQLite استفاده می‌کند اما می‌توانید به PostgreSQL مهاجرت کنید
- برای محیط تولید، حتماً `JWT_SECRET` را به یک مقدار امن تغییر دهید
- پروژه به صورت کامل توسط [ایلیا فراهانی](https://github.com/here-is-leo) توسعه داده شده است

---

**توسعه‌دهنده:** ایلیا فراهانی  
**آخرین بروزرسانی:** ۱۴۰۴/۰۵/۲۰