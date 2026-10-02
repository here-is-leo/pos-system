<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=600&size=30&duration=2800&pause=900&color=8FD3A8&center=true&vCenter=true&width=700&lines=POS-System;Four+Apps.+One+Ledger.;Point+of+Sale+%26+Inventory+Platform" alt="Typing SVG" />

<br/>

![Node.js](https://img.shields.io/badge/Node.js-18%2B-8FD3A8?style=for-the-badge&logo=node.js&logoColor=white&labelColor=1A1F25)
![Next.js](https://img.shields.io/badge/Next.js-16-1A1F25?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-1A1F25?style=for-the-badge&logo=react&logoColor=61DAFB)
![Prisma](https://img.shields.io/badge/Prisma-ORM-1A1F25?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-1A1F25?style=for-the-badge&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-D9B36C?style=for-the-badge&labelColor=1A1F25)

![Stars](https://img.shields.io/github/stars/here-is-leo/pos-system?style=flat-square&color=8FD3A8&labelColor=1A1F25)
![Forks](https://img.shields.io/github/forks/here-is-leo/pos-system?style=flat-square&color=8FD3A8&labelColor=1A1F25)
![Last Commit](https://img.shields.io/github/last-commit/here-is-leo/pos-system?style=flat-square&color=8FD3A8&labelColor=1A1F25)
![RTL](https://img.shields.io/badge/RTL-Fully%20Supported-D9B36C?style=flat-square&labelColor=1A1F25)

<br/>

**[🇬🇧 English](#-english)** &nbsp;·&nbsp; **[🇮🇷 فارسی](#-نسخه-فارسی)**

</div>

<br/>

---

<a name="-english"></a>
# 🇬🇧 English

<div align="center">

### A Point-of-Sale and Inventory Management System split into four independent applications — working together as one.

</div>

<br/>

## 🏗️ Architecture

```
                         ┌─────────────────────────┐
                         │      Backend API         │
                         │   Express · Prisma · SQLite│
                         │          :5000            │
                         └────────────┬───────────────┘
                   ┌──────────────────┼──────────────────┐
                   │                  │                  │
         ┌─────────▼────────┐ ┌──────▼───────┐ ┌─────────▼─────────┐
         │   Admin Panel     │ │ Sales System  │ │ Warehouse System   │
         │ React · Vite      │ │  Next.js 16   │ │   Next.js 16       │
         │      :8080        │ │     :3000     │ │       :3001        │
         └───────────────────┘ └───────────────┘ └────────────────────┘
```

<table>
<tr>
<td width="25%" valign="top">

### 🧮 Backend
`:5000`

Node.js + Express + Prisma + SQLite

API, auth, and every database operation.

`pos-backend/`

</td>
<td width="25%" valign="top">

### 🛠️ Admin Panel
`:8080`

React + Vite + TanStack Router + shadcn/ui

Products, customers, users, invoices, inventory, reports, settlements.

`rtl-admin-dashboard/`

</td>
<td width="25%" valign="top">

### 🧾 Sales System
`:3000`

Next.js 16 (App Router)

Cart building, invoice generation and printing.

`invoice-management-system/`

</td>
<td width="25%" valign="top">

### 📦 Warehouse System
`:3001`

Next.js 16 (App Router)

Stock in/out with reasons, low-stock alerts.

`invoice-inventory-system/`

</td>
</tr>
</table>

<br/>

## 🔑 Login Credentials

| Role | Phone | Password |
|:--|:--:|:--:|
| 👑 Admin | `09121112233` | `123456` |
| 🧾 Sales | Created by Admin | — |
| 📦 Warehouse | Created by Admin | — |
| 🧮 Sales Admin | Created by Admin | — |

<br/>

## 🎯 Features

<details open>
<summary><b>🧮 User Management (Admin)</b></summary>
<br/>

- Create, edit, delete users
- Assign roles: `admin`, `sales`, `warehouse`, `sales_admin`
- Enable / disable users

</details>

<details open>
<summary><b>📦 Product & Inventory Management</b></summary>
<br/>

- Create, edit, delete products — optional unique code, barcode support
- Units: Bottle · Carton · Liter, with configurable carton quantity
- Auto-calculated unit & carton pricing
- Stock minimums, in/out-of-stock status
- Add/subtract stock with a logged reason
- Low-stock view and negative-inventory monitoring

</details>

<details open>
<summary><b>🧾 Invoicing (Sales)</b></summary>
<br/>

- Customer search or instant creation
- Product addition with unit selection, order & carton calculation
- Item-level and total discounts
- Draft registration → invoice printing with product codes
- "Draft" watermark for regular sellers
- Customer's previous debt shown at point of sale

</details>

<details open>
<summary><b>👥 Customers & Settlements</b></summary>
<br/>

- Purchase history and statistics
- Debt calculation, partial-payment settlement
- Debtor list, payment history, debt adjustment

</details>

<details open>
<summary><b>📊 Reports</b></summary>
<br/>

- Sales reports — daily / weekly / monthly
- Inventory reports — stock, inbound, outbound
- Top 5 customers
- Seller commission reports (4%)
- Excel & PDF export

</details>

<br/>

## 👤 Role Permissions

| Role | Access |
|:--|:--|
| **Admin** | ████████████████████ Full system access |
| **Sales Admin** | ██████████████░░░░░░ Invoicing + counts + no watermark + view users |
| **Sales** | ████████░░░░░░░░░░░░ Invoicing only, watermarked |
| **Warehouse** | ███████░░░░░░░░░░░░░ Inventory only |

<br/>

## 💰 Currency Rules

```
   STORED              DISPLAYED            PRINTED
   Rial (IRR)    →     Toman (÷10)    →     Rial, labeled
```

> Carton price = Unit price × Quantity per carton

<br/>

## 🔧 Installation

**Prerequisites:** Node.js 18+, npm or pnpm

```bash
# 1. Clone
git clone https://github.com/here-is-leo/pos-system.git
cd pos-system

# 2. Backend — :5000
cd pos-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev

# 3. Admin Panel — :8080
cd ../rtl-admin-dashboard
npm install && npm run dev

# 4. Sales System — :3000
cd ../invoice-management-system
npm install && npm run dev

# 5. Warehouse System — :3001
cd ../invoice-inventory-system
npm install && npm run dev
```

**Backend `.env`:**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=5000
```

**Admin `.env`:**
```env
VITE_API_URL="http://localhost:5000"
```

<br/>

## 📋 Key API Endpoints

| Method | Endpoint | Description |
|:--:|:--|:--|
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/products` | Get products |
| `POST` | `/api/products` | Create product |
| `GET` | `/api/customers` | Get customers |
| `GET` | `/api/invoices` | Get invoices |
| `POST` | `/api/invoices` | Create invoice |
| `POST` | `/api/invoices/:id/finalize` | Finalize invoice |
| `GET` | `/api/inventory` | Get inventory |
| `POST` | `/api/inventory/add` | Add stock |
| `POST` | `/api/inventory/subtract` | Subtract stock |
| `GET` | `/api/customers/with-debt` | Customers with debt |
| `POST` | `/api/payments` | Record payment |

<br/>

## 🛠️ Tech Stack

| Layer | Technology |
|:--|:--|
| Backend | Node.js + Express |
| Database | SQLite via Prisma ORM |
| Admin | React + Vite + TanStack Router |
| Sales / Warehouse | Next.js 16 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| Icons | Lucide React |
| Charts | Recharts |
| Export | XLSX, jsPDF |

<br/>

## 🔐 Security

- 🔑 JWT authentication (7-day expiry)
- 🔒 bcrypt password hashing
- 🚦 Rate limiting (brute-force protection)
- 🧩 Captcha after 3 failed attempts
- 🛡️ Role-based access control
- 🌐 CORS restricted to allowed domains

<br/>

## 🎨 UI/UX

- Light mode with subtle colors
- Fully responsive — mobile & desktop
- Collapsible sidebar, smooth animations
- Vazirmatn font, complete RTL support

<br/>

## 🐛 Troubleshooting

<details>
<summary><b>Port conflicts</b></summary>

```bash
npx kill-port 5000
```
</details>

<details>
<summary><b>Prisma errors</b></summary>

```bash
npx prisma generate
npx prisma migrate dev
```
</details>

<details>
<summary><b>Dependency issues</b></summary>

```bash
rm -rf node_modules
npm install
```
</details>

<details>
<summary><b>CORS errors</b></summary>

- Check `VITE_API_URL` in the admin `.env`
- Ensure the backend is running
</details>

<br/>

## 👥 Contributing

```bash
1. Fork the repository
2. git checkout -b feature/AmazingFeature
3. git commit -m 'Add AmazingFeature'
4. git push origin feature/AmazingFeature
5. Open a Pull Request
```

**Coding standards:** TypeScript · ESLint · meaningful commits · comments on complex logic · updated docs

<br/>

## 📞 Contact & Support

| | |
|:--|:--|
| 👤 Developer | Ilya Farahani |
| 📧 Email | [ilyafarahanii@gmail.com](mailto:ilyafarahanii@gmail.com) |
| 🐙 GitHub | [@here-is-leo](https://github.com/here-is-leo) |
| 📦 Repository | [pos-system](https://github.com/here-is-leo/pos-system) |

<br/>

## 📜 License

Licensed under the **MIT License** — see [LICENSE](./LICENSE).

<br/>

---

<br/>

<a name="-نسخه-فارسی"></a>
<div dir="rtl">

# 🇮🇷 نسخه فارسی

<div align="center">

### یک سیستم فروش و مدیریت انبار که از چهار اپلیکیشن مستقل تشکیل شده — اما همگی با هم کار می‌کنند.

</div>

<br/>

## 🏗️ معماری سیستم

```
                         ┌─────────────────────────┐
                         │          بک‌اند          │
                         │  Express · Prisma · SQLite│
                         │          :5000            │
                         └────────────┬───────────────┘
                   ┌──────────────────┼──────────────────┐
                   │                  │                  │
         ┌─────────▼────────┐ ┌──────▼───────┐ ┌─────────▼─────────┐
         │     پنل ادمین     │ │ سیستم فروشنده │ │  سیستم انباردار    │
         │ React · Vite      │ │  Next.js 16   │ │   Next.js 16       │
         │      :8080        │ │     :3000     │ │       :3001        │
         └───────────────────┘ └───────────────┘ └────────────────────┘
```

<table>
<tr>
<td width="25%" valign="top">

### 🧮 بک‌اند
`:5000`

Node.js + Express + Prisma + SQLite

مدیریت API، احراز هویت و تمام عملیات دیتابیس.

`pos-backend/`

</td>
<td width="25%" valign="top">

### 🛠️ پنل ادمین
`:8080`

React + Vite + TanStack Router + shadcn/ui

محصولات، مشتریان، کاربران، فاکتورها، موجودی، گزارش‌ها، تسویه‌حساب.

`rtl-admin-dashboard/`

</td>
<td width="25%" valign="top">

### 🧾 سیستم فروشنده
`:3000`

Next.js 16 (App Router)

ساخت سبد خرید، صدور و چاپ فاکتور.

`invoice-management-system/`

</td>
<td width="25%" valign="top">

### 📦 سیستم انباردار
`:3001`

Next.js 16 (App Router)

ورود/خروج موجودی با دلیل، هشدار کمبود موجودی.

`invoice-inventory-system/`

</td>
</tr>
</table>

<br/>

## 🔑 اطلاعات ورود

| نقش | تلفن | رمز عبور |
|:--|:--:|:--:|
| 👑 ادمین | `09121112233` | `123456` |
| 🧾 فروشنده | ساخته‌شده توسط ادمین | — |
| 📦 انباردار | ساخته‌شده توسط ادمین | — |
| 🧮 فروش (ادمین) | ساخته‌شده توسط ادمین | — |

<br/>

## 🎯 قابلیت‌ها

<details open>
<summary><b>🧮 مدیریت کاربران (ادمین)</b></summary>
<br/>

- ایجاد، ویرایش، حذف کاربران
- تعیین نقش‌ها: `admin`, `sales`, `warehouse`, `sales_admin`
- فعال/غیرفعال کردن کاربران

</details>

<details open>
<summary><b>📦 مدیریت محصولات و موجودی</b></summary>
<br/>

- ایجاد، ویرایش، حذف محصولات — کد یکتا (اختیاری)، پشتیبانی بارکد
- واحدها: بطری · کارتن · لیتر، با تعداد قابل تنظیم در کارتن
- قیمت واحد و کارتن به‌صورت خودکار محاسبه می‌شود
- حداقل موجودی، وضعیت موجود/ناموجود
- افزودن/کسر موجودی همراه با ثبت دلیل
- نمایش کالاهای کم‌موجود و موجودی منفی

</details>

<details open>
<summary><b>🧾 صدور فاکتور (فروشنده)</b></summary>
<br/>

- جستجوی مشتری یا ایجاد فوری
- افزودن کالا با انتخاب واحد، محاسبه سفارش و کارتن
- تخفیف آیتمی و کلی
- ثبت پیش‌نویس ← چاپ فاکتور با کد کالا
- واترمارک «پیش‌نویس» برای فروشندگان عادی
- نمایش بدهی قبلی مشتری در لحظه فروش

</details>

<details open>
<summary><b>👥 مشتریان و تسویه‌حساب</b></summary>
<br/>

- تاریخچه خرید و آمار
- محاسبه بدهی، تسویه با پرداخت جزئی
- لیست بدهکاران، تاریخچه پرداخت، اصلاح بدهی

</details>

<details open>
<summary><b>📊 گزارش‌ها</b></summary>
<br/>

- گزارش فروش — روزانه / هفتگی / ماهانه
- گزارش انبار — موجودی، ورود، خروج
- ۵ مشتری برتر
- گزارش کمیسیون فروشنده (۴٪)
- خروجی Excel و PDF

</details>

<br/>

## 👤 سطح دسترسی نقش‌ها

| نقش | دسترسی |
|:--|:--|
| **ادمین** | ████████████████████ دسترسی کامل به سیستم |
| **فروش (ادمین)** | ██████████████░░░░░░ فاکتور + آمار + بدون واترمارک + دیدن کاربران |
| **فروشنده** | ████████░░░░░░░░░░░░ فقط فاکتور، واترمارک‌دار |
| **انباردار** | ███████░░░░░░░░░░░░░ فقط موجودی |

<br/>

## 💰 قوانین واحد پول

```
   ذخیره‌شده             نمایش روی صفحه         فاکتور چاپی
   ریال          ←       تومان (÷۱۰)      ←      ریال، با برچسب
```

> قیمت کارتن = قیمت هر واحد × تعداد در کارتن

<br/>

## 🔧 نصب و راه‌اندازی

**پیش‌نیازها:** Node.js 18+، npm یا pnpm

```bash
# ۱. کلون کردن مخزن
git clone https://github.com/here-is-leo/pos-system.git
cd pos-system

# ۲. بک‌اند — :5000
cd pos-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev

# ۳. پنل ادمین — :8080
cd ../rtl-admin-dashboard
npm install && npm run dev

# ۴. سیستم فروشنده — :3000
cd ../invoice-management-system
npm install && npm run dev

# ۵. سیستم انباردار — :3001
cd ../invoice-inventory-system
npm install && npm run dev
```

**بک‌اند `.env`:**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=5000
```

**ادمین `.env`:**
```env
VITE_API_URL="http://localhost:5000"
```

<br/>

## 📋 APIهای کلیدی

| متد | مسیر | توضیح |
|:--:|:--|:--|
| `POST` | `/api/auth/login` | ورود کاربر |
| `GET` | `/api/products` | دریافت محصولات |
| `POST` | `/api/products` | ایجاد محصول |
| `GET` | `/api/customers` | دریافت مشتریان |
| `GET` | `/api/invoices` | دریافت فاکتورها |
| `POST` | `/api/invoices` | ایجاد فاکتور |
| `POST` | `/api/invoices/:id/finalize` | نهایی‌سازی فاکتور |
| `GET` | `/api/inventory` | دریافت موجودی |
| `POST` | `/api/inventory/add` | افزودن موجودی |
| `POST` | `/api/inventory/subtract` | کسر موجودی |
| `GET` | `/api/customers/with-debt` | مشتریان با بدهی |
| `POST` | `/api/payments` | ثبت پرداخت |

<br/>

## 🛠️ تکنولوژی‌های استفاده‌شده

| بخش | تکنولوژی |
|:--|:--|
| بک‌اند | Node.js + Express |
| دیتابیس | SQLite از طریق Prisma ORM |
| ادمین | React + Vite + TanStack Router |
| فروشنده / انباردار | Next.js 16 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| آیکون‌ها | Lucide React |
| نمودار | Recharts |
| خروجی | XLSX, jsPDF |

<br/>

## 🔐 ویژگی‌های امنیتی

- 🔑 احراز هویت JWT (انقضای ۷ روز)
- 🔒 هش کردن رمز عبور با bcrypt
- 🚦 محدودیت درخواست (محافظت در برابر Brute Force)
- 🧩 کپچا پس از ۳ تلاش ناموفق
- 🛡️ کنترل دسترسی مبتنی بر نقش
- 🌐 محدودیت CORS به دامنه‌های مجاز

<br/>

## 🎨 طراحی UI/UX

- لایت مود با رنگ‌های ملایم
- کاملاً ریسپانسیو — موبایل و دسکتاپ
- سایدبار قابل جمع‌شدن، انیمیشن‌های روان
- فونت وزیرمتن، پشتیبانی کامل از راست‌چینی

<br/>

## 🐛 عیب‌یابی

<details>
<summary><b>تداخل پورت</b></summary>

```bash
npx kill-port 5000
```
</details>

<details>
<summary><b>خطاهای Prisma</b></summary>

```bash
npx prisma generate
npx prisma migrate dev
```
</details>

<details>
<summary><b>مشکلات وابستگی‌ها</b></summary>

```bash
rm -rf node_modules
npm install
```
</details>

<details>
<summary><b>خطاهای CORS</b></summary>

- آدرس `VITE_API_URL` را در `.env` پنل ادمین بررسی کنید
- مطمئن شوید بک‌اند در حال اجراست
</details>

<br/>

## 👥 مشارکت در توسعه

```bash
۱. مخزن را Fork کنید
۲. git checkout -b feature/AmazingFeature
۳. git commit -m 'Add AmazingFeature'
۴. git push origin feature/AmazingFeature
۵. یک Pull Request باز کنید
```

**استانداردهای کدنویسی:** TypeScript · رعایت ESLint · پیام‌های commit معنادار · کامنت برای منطق‌های پیچیده · به‌روزرسانی مستندات

<br/>

## 📞 اطلاعات تماس و پشتیبانی

| | |
|:--|:--|
| 👤 توسعه‌دهنده | ایلیا فراهانی |
| 📧 ایمیل | [ilyafarahanii@gmail.com](mailto:ilyafarahanii@gmail.com) |
| 🐙 گیت‌هاب | [@here-is-leo](https://github.com/here-is-leo) |
| 📦 مخزن پروژه | [pos-system](https://github.com/here-is-leo/pos-system) |

<br/>

## 📜 لایسنس

این پروژه تحت مجوز **MIT** منتشر شده است — برای جزئیات به [LICENSE](./LICENSE) مراجعه کنید.

</div>

<br/>

---

<div align="center">

**ساخته‌شده با 🧡 توسط [ایلیا فراهانی](https://github.com/here-is-leo)**

</div>
