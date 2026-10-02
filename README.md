<!-- ============================================================
     POS-SYSTEM · Point of Sale & Inventory Management
     Author: Ilya Farahani (@here-is-leo)
     License: MIT
     ============================================================ -->

<div align="center">

<!-- Animated Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0ea5e9,100:6366f1&height=220&section=header&text=POS-SYSTEM&fontSize=70&fontAlignY=38&desc=Point%20of%20Sale%20%26%20Inventory%20Management%20System&descAlignY=60&descSize=18&animation=fadeIn&fontColor=ffffff" width="100%"/>

<!-- Typing Animation -->
<a href="https://github.com/here-is-leo/pos-system">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=6366F1&center=true&vCenter=true&width=800&lines=Modern+Point+of+Sale+System;Full+Inventory+Management;Multi-Role+%26+Multi-Platform;Built+with+Next.js+%2B+React+%2B+Node.js;RTL+%26+LTR+Support+%F0%9F%8C%90" alt="Typing SVG" />
</a>

<!-- Badges -->
<p>
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge&logo=semver" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge&logo=opensourceinitiative" />
  <img src="https://img.shields.io/badge/status-Active-success?style=for-the-badge&logo=statuspage" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge&logo=github" />
</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
</p>

<!-- Language Switcher -->
<p>
  <a href="#-english-version"><img src="https://img.shields.io/badge/🇬🇧_English-Click_Here-0ea5e9?style=for-the-badge" /></a>
  &nbsp;
  <a href="#-نسخه-فارسی"><img src="https://img.shields.io/badge/🇮🇷_فارسی-اینجا_کلیک_کنید-6366f1?style=for-the-badge" /></a>
</p>

</div>

---

<!-- ============================================================ -->
<!--                    ENGLISH VERSION                            -->
<!-- ============================================================ -->

# 🇬🇧 English Version

<div align="center">
  <h3>🚀 A Complete, Modern & Bilingual Point of Sale System</h3>
  <p><i>Four applications. One powerful business management solution.</i></p>
</div>

---

## 📖 Table of Contents

<details open>
<summary><b>Click to expand / collapse</b></summary>

- [✨ Overview](#-overview)
- [🏗️ System Architecture](#️-system-architecture)
- [🎯 Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔑 Default Credentials](#-default-credentials)
- [👤 User Roles & Permissions](#-user-roles--permissions)
- [💰 Currency Rules](#-currency-rules)
- [📊 Database Models](#-database-models)
- [📡 API Endpoints](#-api-endpoints)
- [🔐 Security Features](#-security-features)
- [🎨 UI / UX Design](#-ui--ux-design)
- [📄 Export Formats](#-export-formats)
- [🐛 Troubleshooting](#-troubleshooting)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📞 Contact](#-contact)
- [📜 License](#-license)

</details>

---

## ✨ Overview

**POS-System** is a comprehensive **Point of Sale & Inventory Management System** built with cutting-edge web technologies. It consists of **four independent applications** that work together seamlessly to deliver a complete business management solution.

<div align="center">

| 🎯 | **Complete Solution** | From invoice generation to inventory tracking |
|:--:|:--|:--|
| 🔒 | **Secure** | JWT auth, bcrypt, rate limiting, CAPTCHA |
| 🌐 | **Bilingual** | Full RTL & LTR support |
| 📱 | **Responsive** | Works on mobile, tablet & desktop |
| ⚡ | **Fast** | Next.js 16 + Vite + Prisma |

</div>

---

## 🏗️ System Architecture

<div align="center">
┌─────────────────────────────────────────────────────────────────┐
│ POS-SYSTEM ECOSYSTEM │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 🛠️ BACKEND │ │ 👑 ADMIN │ │ 🧾 SALES │ │ 📦 WAREHOUSE │
│ Port 5000 │◄──◄│ Port 8080 │ │ Port 3000 │ │ Port 3001 │
│ │ │ │ │ │ │ │
│ Node+Express │ │ React + Vite │ │ Next.js 16 │ │ Next.js 16 │
│ Prisma │ │ TanStack │ │ App Router │ │ App Router │
│ SQLite │ │ Shadcn/ui │ │ Tailwind │ │ Tailwind │
└──────┬───────┘ └──────────────┘ └──────────────┘ └──────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 💾 DATABASE (SQLite) │
│ Users · Products · Customers · Invoices · Inventory │
└─────────────────────────────────────────────────────────────┘

text

</div>

### Application Details

| # | Application | Port | Tech Stack | Responsibility |
|:-:|:--|:--:|:--|:--|
| 1️⃣ | **Backend API** | `5000` | Node.js + Express + Prisma + SQLite | API, Auth, Database |
| 2️⃣ | **Admin Panel** | `8080` | React + Vite + TanStack Router + Shadcn/ui | Full System Management |
| 3️⃣ | **Sales System** | `3000` | Next.js 16 + Tailwind CSS | Invoices & Cart |
| 4️⃣ | **Warehouse** | `3001` | Next.js 16 + Tailwind CSS | Stock In/Out |

---

## 🎯 Key Features

<table>
<tr>
<td width="50%" valign="top">

### 👥 User Management
- ✅ Create / Edit / Delete users
- ✅ Role assignment
- ✅ Enable / disable accounts
- ✅ Role-based access

### 📦 Product Management
- ✅ Unique product code
- ✅ Barcode support
- ✅ Units: Bottle / Carton / Liter
- ✅ Carton quantity settings
- ✅ Auto-calculated pricing
- ✅ Stock & min-stock levels

### 👤 Customer Management
- ✅ Full CRUD operations
- ✅ Purchase history
- ✅ Debt calculation
- ✅ Partial payments

</td>
<td width="50%" valign="top">

### 🧾 Invoice Generation
- ✅ Customer search & create
- ✅ Unit selection
- ✅ Order & carton calc
- ✅ Item & total discounts
- ✅ Draft & final invoices
- ✅ Print with product codes
- ✅ "Draft" watermark
- ✅ Previous debt display

### 📊 Reports
- ✅ Sales (daily/weekly/monthly)
- ✅ Inventory (in/out)
- ✅ Top 5 customers
- ✅ Sellers with 4% commission
- ✅ Excel & PDF export

### 💳 Settlements
- ✅ Debtor customer list
- ✅ Partial payment recording
- ✅ Payment history
- ✅ Debt adjustment

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

### UI & Utilities
![Shadcn/ui](https://img.shields.io/badge/Shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-F56565?style=for-the-badge&logo=lucide&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-8884d8?style=for-the-badge)
![jsPDF](https://img.shields.io/badge/jsPDF-FF0000?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)

</div>

---

## 📁 Project Structure

<details>
<summary><b>🗂️ Click to view full structure</b></summary>

### 🔧 Backend (`pos-backend/`)
pos-backend/
├── prisma/
│ └── schema.prisma # Database models
├── src/
│ └── index.ts # Main Express server
├── .env # Environment variables
├── package.json
└── tsconfig.json

text

### 👑 Admin (`rtl-admin-dashboard/`)
rtl-admin-dashboard/
├── src/
│ ├── routes/ # All admin routes
│ ├── components/ # Reusable components
│ └── services/ # API communication
├── .env # VITE_API_URL
└── package.json

text

### 🧾 Sales (`invoice-management-system/`)
invoice-management-system/
├── app/
│ ├── page.tsx # Main invoice page
│ └── login/ # Login page
├── components/ # Invoice components
├── lib/ # Types & utilities
└── services/ # API communication

text

### 📦 Warehouse (`invoice-inventory-system/`)
invoice-inventory-system/
├── app/
│ ├── page.tsx # Main inventory page
│ └── login/ # Login page
├── components/ # Inventory components
└── services/ # API communication

text

</details>

---

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** `18+`
- **npm** or **pnpm**

### ⚡ Installation (5 Steps)


# 1️⃣ Clone the repository
git clone https://github.com/here-is-leo/pos-system.git
cd pos-system

# 2️⃣ Setup Backend
cd pos-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev           # 🚀 Running on port 5000

# 3️⃣ Setup Admin Panel
cd ../rtl-admin-dashboard
npm install
npm run dev           # 🚀 Running on port 8080

# 4️⃣ Setup Sales System
cd ../invoice-management-system
npm install
npm run dev           # 🚀 Running on port 3000

# 5️⃣ Setup Warehouse System
cd ../invoice-inventory-system
npm install
npm run dev           # 🚀 Running on port 3001
🔐 Environment Variables
<details> <summary><b>Backend .env</b></summary>
env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-key"
PORT=5000
</details><details> <summary><b>Admin .env</b></summary>
env
VITE_API_URL="http://localhost:5000"
</details>
🔑 Default Credentials
<div align="center">
👤 Role	📱 Phone	🔒 Password
👑 Admin	09121112233	123456
🧾 Sales	Created by Admin	—
📦 Warehouse	Created by Admin	—
🧑‍💼 Sales Admin	Created by Admin	—
⚠️ Important: Change the default password immediately after first login!

</div>
👤 User Roles & Permissions
<div align="center">
🎭 Role	🔓 Access Level
👑 Admin	Full access to all sections
🧑‍💼 Sales Admin	Invoice creation + counts + no watermark + view users
🧾 Sales	Invoice creation only + restrictions + watermark
📦 Warehouse	Inventory management only
</div>
💰 Currency Rules
<div align="center">
🗄️ Where	📏 Unit	🔢 Format
Database	Rial (IRR)	Stored as integer
UI Display	Toman	Divided by 10
Printed Invoice	Rial (IRR)	With "ریال" label
Carton Formula	—	Unit Price × Qty per Carton
</div>
📊 Database Models
<div align="center">
📦 Model	📝 Description
User	System users with different roles
Product	Products with codes, units, pricing
Customer	Customers with purchase history
Invoice	Invoices (draft / final / paid / settled)
InvoiceItem	Line items with discounts
Inventory	Warehouse stock
InventoryLog	Stock change logs
PaymentTransaction	Payment transactions
Notification	System notifications
</div>
📡 API Endpoints
<details open> <summary><b>🔌 Click to view all endpoints</b></summary>
🔧 Method	🛣️ Endpoint	📄 Description
POST	/api/auth/login	User login
GET	/api/products	Get products
POST	/api/products	Create product
GET	/api/customers	Get customers
GET	/api/invoices	Get invoices
POST	/api/invoices	Create invoice
POST	/api/invoices/:id/finalize	Finalize invoice
GET	/api/inventory	Get inventory
POST	/api/inventory/add	Add stock
POST	/api/inventory/subtract	Subtract stock
GET	/api/customers/with-debt	Customers with debt
POST	/api/payments	Record payment
📖 Full API docs available at /api-docs after starting the backend.

</details>
🔐 Security Features
<div align="center">
🛡️ Feature	📝 Description
🔑 JWT Authentication	7-day token expiry
🔒 bcrypt	Password hashing
⏱️ Rate Limiting	Brute-force protection
🤖 CAPTCHA	After 3 failed attempts
🎭 RBAC	Role-based access control
🌐 CORS	Restricted to allowed domains
</div>
🎨 UI / UX Design
<div align="center">
🎨 Feature	📝 Description
☀️ Light Mode	Subtle, eye-friendly colors
📱 Responsive	Mobile, tablet & desktop
📂 Collapsible Sidebar	Smooth transitions
✨ Animations	Fluid micro-interactions
🔤 Vazirmatn Font	Beautiful Persian typography
↔️ Full RTL	Complete right-to-left support
</div>
📄 Export Formats
<div align="center">
📄 Format	📊 Usage
PDF	Invoices, Reports
Excel	Sales, Sellers, Customers, Inventory
</div>
🐛 Troubleshooting
<details> <summary><b>⚠️ Port already in use</b></summary>
bash
npx kill-port 5000    # Or 3000, 3001, 8080
</details><details> <summary><b>⚠️ Prisma errors</b></summary>
bash
npx prisma generate
npx prisma migrate dev
</details><details> <summary><b>⚠️ Dependency issues</b></summary>
bash
rm -rf node_modules
npm install
</details><details> <summary><b>⚠️ CORS errors</b></summary>
Check VITE_API_URL in admin .env

Ensure backend is running on port 5000

</details>
🚀 Deployment
bash
# 1. Configure environment variables
# 2. Set production mode
export NODE_ENV=production

# 3. (Optional) Switch to PostgreSQL
# 4. Use PM2 for process management
pm2 start npm --name "pos-backend" -- run start
🤝 Contributing
We ❤️ contributions! Here's how:

🍴 Fork the repository

🌿 Create a feature branch

bash
git checkout -b feature/AmazingFeature
💾 Commit your changes

bash
git commit -m 'Add AmazingFeature'
🚀 Push to the branch

bash
git push origin feature/AmazingFeature
🎉 Open a Pull Request

📏 Coding Standards
✅ Use TypeScript

✅ Follow ESLint rules

✅ Write meaningful commit messages

✅ Comment complex logic

✅ Update documentation

📞 Contact
<div align="center">
👨‍💻 Developer: Ilya Farahani

https://img.shields.io/badge/Email-ilyafarahanii@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white
https://img.shields.io/badge/GitHub-here--is--leo-181717?style=for-the-badge&logo=github&logoColor=white
https://img.shields.io/badge/Repository-pos--system-0ea5e9?style=for-the-badge&logo=github&logoColor=white

</div>
📜 License
This project is licensed under the MIT License — see the LICENSE file for details.

text
MIT License · Copyright (c) 2025 Ilya Farahani
🙏 Acknowledgments
<div align="center">
https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white
https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white
https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white
https://img.shields.io/badge/Shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white
https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white

</div><div align="center"> <a href="#-نسخه-فارسی"> <img src="https://img.shields.io/badge/🇮🇷_رفتن_به_نسخه_فارسی-6366f1?style=for-the-badge" /> </a> </div>
<!-- ============================================================ <--<!-- PERSIAN VERSION <--<!-- ============================================================ <--
🇮🇷 نسخه فارسی
<div align="center" dir="rtl"> <h3>🚀 یک سیستم فروش مدرن، کامل و دوزبانه</h3> <p><i>چهار اپلیکیشن. یک راه‌حل قدرتمند مدیریت کسب‌وکار.</i></p> </div>
📖 فهرست مطالب
<details open dir="rtl"> <summary><b>برای باز / بسته کردن کلیک کنید</b></summary>
✨ نمای کلی

🏗️ معماری سیستم

🎯 قابلیت‌های اصلی

🛠️ تکنولوژی‌ها

📁 ساختار پروژه

🚀 نصب سریع

🔑 اطلاعات ورود پیش‌فرض

👤 نقش‌ها و دسترسی‌ها

💰 قوانین واحد پول

📊 مدل‌های دیتابیس

📡 APIها

🔐 ویژگی‌های امنیتی

🎨 طراحی UI / UX

📄 فرمت‌های خروجی

🐛 عیب‌یابی

🚀 دیپلوی

🤝 مشارکت

📞 تماس

📜 لایسنس

</details>
✨ نمای کلی
<div dir="rtl">
POS-System یک سیستم جامع فروش و مدیریت انبار است که با استفاده از پیشرفته‌ترین فناوری‌های وب ساخته شده. این سیستم از چهار اپلیکیشن مستقل تشکیل شده که با هماهنگی کامل، یک راه‌حل جامع مدیریت کسب‌وکار ارائه می‌دهند.

</div><div align="center" dir="rtl">
🎯	راه‌حل کامل	از صدور فاکتور تا رهگیری موجودی
🔒	امن	JWT، bcrypt، محدودیت درخواست، کپچا
🌐	دوزبانه	پشتیبانی کامل RTL و LTR
📱	ریسپانسیو	روی موبایل، تبلت و دسکتاپ
⚡	سریع	Next.js 16 + Vite + Prisma
</div>
🏗️ معماری سیستم
<div align="center" dir="rtl">
text
┌─────────────────────────────────────────────────────────────────┐
│                    اکوسیستم POS-SYSTEM                          │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │  🛠️ بک‌اند    │    │ 👑 ادمین     │    │ 🧾 فروشنده  │    │ 📦 انباردار │
  │  پورت 5000   │◄──◄│  پورت 8080   │    │  پورت 3000   │    │  پورت 3001   │
  │              │    │              │    │              │    │              │
  │ Node+Express │    │ React + Vite │    │  Next.js 16  │    │  Next.js 16  │
  │   Prisma     │    │  TanStack    │    │  App Router  │    │  App Router  │
  │   SQLite     │    │  Shadcn/ui   │    │  Tailwind    │    │  Tailwind    │
  └──────┬───────┘    └──────────────┘    └──────────────┘    └──────────────┘
         │
         ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                    💾 دیتابیس (SQLite)                      │
  │    کاربران · محصولات · مشتریان · فاکتورها · موجودی          │
  └─────────────────────────────────────────────────────────────┘
</div>
جزئیات اپلیکیشن‌ها
<div dir="rtl">
#	اپلیکیشن	پورت	تکنولوژی	مسئولیت
۱️⃣	بک‌اند API	5000	Node.js + Express + Prisma + SQLite	API، احراز هویت، دیتابیس
۲️⃣	پنل ادمین	8080	React + Vite + TanStack + Shadcn/ui	مدیریت کامل سیستم
۳️⃣	سیستم فروشنده	3000	Next.js 16 + Tailwind	فاکتور و سبد خرید
۴️⃣	سیستم انباردار	3001	Next.js 16 + Tailwind	ورود / خروج انبار
</div>
🎯 قابلیت‌های اصلی
<div dir="rtl"><table> <tr> <td width="50%" valign="top">
👥 مدیریت کاربران
✅ ایجاد / ویرایش / حذف کاربران

✅ تعیین نقش

✅ فعال / غیرفعال کردن

✅ دسترسی مبتنی بر نقش

📦 مدیریت محصولات
✅ کد کالای یکتا

✅ پشتیبانی از بارکد

✅ واحد: بطری / کارتن / لیتر

✅ تنظیم تعداد در کارتن

✅ محاسبه خودکار قیمت

✅ موجودی و حداقل موجودی

👤 مدیریت مشتریان
✅ CRUD کامل

✅ تاریخچه خرید

✅ محاسبه بدهی

✅ پرداخت جزئی

</td> <td width="50%" valign="top">
🧾 صدور فاکتور
✅ جستجو و ایجاد مشتری

✅ انتخاب واحد

✅ محاسبه سفارش و کارتن

✅ تخفیف آیتمی و کلی

✅ فاکتور پیش‌نویس و نهایی

✅ چاپ با کد کالا

✅ واترمارک «پیش‌نویس»

✅ نمایش بدهی قبلی

📊 گزارشات
✅ فروش (روزانه / هفتگی / ماهانه)

✅ انبار (ورود / خروج)

✅ ۵ مشتری برتر

✅ فروشندگان با کمیسیون ۴٪

✅ خروجی Excel و PDF

💳 تسویه حساب
✅ لیست مشتریان بدهکار

✅ ثبت پرداخت جزئی

✅ تاریخچه پرداخت

✅ اصلاح بدهی

</td> </tr> </table></div>
🛠️ تکنولوژی‌ها
<div align="center">
بک‌اند
https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white
https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white
https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white
https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white

فرانت‌اند
https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black
https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white
https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white

</div>
📁 ساختار پروژه
<details dir="rtl"> <summary><b>🗂️ برای مشاهده ساختار کامل کلیک کنید</b></summary>
🔧 بک‌اند (pos-backend/)
text
pos-backend/
├── prisma/
│   └── schema.prisma          # مدل‌های دیتابیس
├── src/
│   └── index.ts               # فایل اصلی Express
├── .env                       # متغیرهای محیطی
├── package.json
└── tsconfig.json
👑 ادمین (rtl-admin-dashboard/)
text
rtl-admin-dashboard/
├── src/
│   ├── routes/                # مسیرهای ادمین
│   ├── components/            # کامپوننت‌ها
│   └── services/              # ارتباط با API
├── .env                       # VITE_API_URL
└── package.json
🧾 فروشنده (invoice-management-system/)
text
invoice-management-system/
├── app/
│   ├── page.tsx               # صفحه اصلی فاکتور
│   └── login/                 # صفحه ورود
├── components/                # کامپوننت‌های فاکتور
├── lib/                       # تایپ‌ها و ابزارها
└── services/                  # ارتباط با API
📦 انباردار (invoice-inventory-system/)
text
invoice-inventory-system/
├── app/
│   ├── page.tsx               # صفحه اصلی انبار
│   └── login/                 # صفحه ورود
├── components/                # کامپوننت‌های انبار
└── services/                  # ارتباط با API
</details>
🚀 نصب سریع
📋 پیش‌نیازها
Node.js 18+

npm یا pnpm

⚡ نصب در ۵ مرحله
<div dir="rtl">
bash
# 1️⃣ کلون کردن مخزن
git clone https://github.com/here-is-leo/pos-system.git
cd pos-system

# 2️⃣ راه‌اندازی بک‌اند
cd pos-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev           # 🚀 اجرا روی پورت 5000

# 3️⃣ راه‌اندازی پنل ادمین
cd ../rtl-admin-dashboard
npm install
npm run dev           # 🚀 اجرا روی پورت 8080

# 4️⃣ راه‌اندازی سیستم فروشنده
cd ../invoice-management-system
npm install
npm run dev           # 🚀 اجرا روی پورت 3000

# 5️⃣ راه‌اندازی سیستم انباردار
cd ../invoice-inventory-system
npm install
npm run dev           # 🚀 اجرا روی پورت 3001
</div>
🔐 متغیرهای محیطی
<details dir="rtl"> <summary><b>بک‌اند (`.env`)</b></summary>
env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-key"
PORT=5000
</details><details dir="rtl"> <summary><b>ادمین (`.env`)</b></summary>
env
VITE_API_URL="http://localhost:5000"
</details>
🔑 اطلاعات ورود پیش‌فرض
<div align="center" dir="rtl">
👤 نقش	📱 تلفن	🔒 رمز عبور
👑 ادمین	09121112233	123456
🧾 فروشنده	ساخته‌شده توسط ادمین	—
📦 انباردار	ساخته‌شده توسط ادمین	—
🧑‍💼 فروش (ادمین)	ساخته‌شده توسط ادمین	—
⚠️ مهم: بعد از اولین ورود، رمز پیش‌فرض را حتماً تغییر دهید!

</div>
👤 نقش‌ها و دسترسی‌ها
<div align="center" dir="rtl">
🎭 نقش	🔓 سطح دسترسی
👑 ادمین	دسترسی کامل به همه بخش‌ها
🧑‍💼 فروش (ادمین)	صدور فاکتور + مشاهده تعداد + بدون واترمارک + مشاهده کاربران
🧾 فروشنده	فقط صدور فاکتور + محدودیت + واترمارک
📦 انباردار	فقط مدیریت موجودی
</div>
💰 قوانین واحد پول
<div align="center" dir="rtl">
🗄️ محل	📏 واحد	🔢 فرمت
دیتابیس	ریال (IRR)	ذخیره به صورت عدد صحیح
نمایش در UI	تومان	تقسیم بر ۱۰
فاکتور چاپی	ریال (IRR)	با برچسب «ریال»
فرمول کارتن	—	قیمت واحد × تعداد در کارتن
</div>
📊 مدل‌های دیتابیس
<div align="center" dir="rtl">
📦 مدل	📝 توضیح
User	کاربران سیستم با نقش‌های مختلف
Product	محصولات با کد، واحد و قیمت
Customer	مشتریان با تاریخچه خرید
Invoice	فاکتورها (پیش‌نویس / نهایی / پرداخت‌شده / تسویه)
InvoiceItem	آیتم‌های فاکتور با تخفیف
Inventory	موجودی انبار
InventoryLog	لاگ تغییرات موجودی
PaymentTransaction	تراکنش‌های پرداخت
Notification	نوتیفیکیشن‌های سیستم
</div>
📡 APIها
<details open dir="rtl"> <summary><b>🔌 برای مشاهده همه APIها کلیک کنید</b></summary>
🔧 متد	🛣️ مسیر	📄 توضیح
POST	/api/auth/login	ورود به سیستم
GET	/api/products	دریافت محصولات
POST	/api/products	ایجاد محصول
GET	/api/customers	دریافت مشتریان
GET	/api/invoices	دریافت فاکتورها
POST	/api/invoices	ایجاد فاکتور
POST	/api/invoices/:id/finalize	نهایی‌سازی فاکتور
GET	/api/inventory	دریافت موجودی
POST	/api/inventory/add	افزودن موجودی
POST	/api/inventory/subtract	کسر موجودی
GET	/api/customers/with-debt	مشتریان بدهکار
POST	/api/payments	ثبت پرداخت
📖 مستندات کامل API پس از اجرای بک‌اند در آدرس /api-docs قابل مشاهده است.

</details>
🔐 ویژگی‌های امنیتی
<div align="center" dir="rtl">
🛡️ ویژگی	📝 توضیح
🔑 احراز هویت JWT	انقضای ۷ روزه توکن
🔒 bcrypt	هش کردن رمز عبور
⏱️ Rate Limiting	محافظت در برابر Brute Force
🤖 کپچا	بعد از ۳ تلاش ناموفق
🎭 RBAC	کنترل دسترسی مبتنی بر نقش
🌐 CORS	محدود به دامنه‌های مجاز
</div>
🎨 طراحی UI / UX
<div align="center" dir="rtl">
🎨 ویژگی	📝 توضیح
☀️ لایت مود	رنگ‌های ملایم و چشمنواز
📱 ریسپانسیو	موبایل، تبلت و دسکتاپ
📂 سایدبار تاشو	انتقال نرم
✨ انیمیشن‌ها	میکرو-اینتراکشن‌های روان
🔤 فونت وزیرمتن	تایپوگرافی زیبای فارسی
↔️ RTL کامل	پشتیبانی کامل از راست‌چین
</div>
📄 فرمت‌های خروجی
<div align="center" dir="rtl">
📄 فرمت	📊 کاربرد
PDF	فاکتورها، گزارشات
Excel	فروش، فروشندگان، مشتریان، انبار
</div>
🐛 عیب‌یابی
<details dir="rtl"> <summary><b>⚠️ پورت اشغال است</b></summary>
bash
npx kill-port 5000    # یا 3000، 3001، 8080
</details><details dir="rtl"> <summary><b>⚠️ خطاهای Prisma</b></summary>
bash
npx prisma generate
npx prisma migrate dev
</details><details dir="rtl"> <summary><b>⚠️ مشکلات وابستگی‌ها</b></summary>
bash
rm -rf node_modules
npm install
</details><details dir="rtl"> <summary><b>⚠️ خطاهای CORS</b></summary>
مقدار VITE_API_URL را در .env ادمین بررسی کنید

مطمئن شوید بک‌اند روی پورت 5000 در حال اجراست

</details>
🚀 دیپلوی
<div dir="rtl">
bash
# 1. متغیرهای محیطی را تنظیم کنید
# 2. حالت production را فعال کنید
export NODE_ENV=production

# 3. (اختیاری) به PostgreSQL مهاجرت کنید
# 4. از PM2 برای مدیریت فرآیندها استفاده کنید
pm2 start npm --name "pos-backend" -- run start
</div>
🤝 مشارکت
<div dir="rtl">
ما عاشق مشارکت هستیم! مراحل:

🍴 Fork کردن مخزن

🌿 ایجاد شاخه ویژگی

bash
git checkout -b feature/AmazingFeature
💾 Commit تغییرات

bash
git commit -m 'Add AmazingFeature'
🚀 Push به شاخه

bash
git push origin feature/AmazingFeature
🎉 باز کردن Pull Request

📏 استانداردهای کدنویسی
✅ استفاده از TypeScript

✅ رعایت قوانین ESLint

✅ پیام‌های commit معنادار

✅ کامنت برای منطق‌های پیچیده

✅ به‌روزرسانی مستندات

</div>
📞 تماس
<div align="center" dir="rtl">
👨‍💻 توسعه‌دهنده: ایلیا فراهانی

https://img.shields.io/badge/%D8%A7%DB%8C%D9%85%DB%8C%D9%84-ilyafarahanii@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white
https://img.shields.io/badge/%DA%AF%DB%8C%D8%AA%E2%80%8C%D9%87%D8%A7%D8%A8-here--is--leo-181717?style=for-the-badge&logo=github&logoColor=white
https://img.shields.io/badge/%D9%85%D8%AE%D8%B2%D9%86-pos--system-0ea5e9?style=for-the-badge&logo=github&logoColor=white

</div>
📜 لایسنس
<div dir="rtl">
این پروژه تحت مجوز MIT منتشر شده است — برای جزئیات به فایل LICENSE مراجعه کنید.

text
مجوز MIT · کپی‌رایت (c) ۲۰۲۵ ایلیا فراهانی
</div>
🙏 قدردانی
<div align="center">
https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white
https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white
https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white
https://img.shields.io/badge/Shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white
https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white

</div><div align="center"> <a href="#-english-version"> <img src="https://img.shields.io/badge/🇬🇧_Back_to_English_Version-0ea5e9?style=for-the-badge" /> </a> </div>
<div align="center">
🌟 اگر این پروژه برایتان مفید بود، یک ⭐ ستاره بدهید!
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:0ea5e9&height=120&section=footer&animation=fadeIn" width="100%"/>
ساخته‌شده با ❤️ توسط ایلیا فراهانی

Last updated / آخرین بروزرسانی: ۱۴۰۴/۰۵/۲۰ — 2025

</div>
