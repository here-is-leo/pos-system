📦 POS-Backend
Backend API for POS-System - Complete RESTful API for Point of Sale and Inventory Management

🌐 English Version
📋 Overview
POS-Backend is the core API server for the POS-System project. It provides all backend functionality including authentication, user management, product management, invoice processing, inventory control, customer management, and reporting.

🚀 Tech Stack
Technology	Version	Purpose
Node.js	18+	Runtime environment
Express.js	4.x	Web framework
Prisma	5.x	ORM for database
SQLite	3.x	Database (development)
PostgreSQL	14+	Database (production - optional)
TypeScript	5.x	Type safety
JWT	-	Authentication
bcrypt	-	Password hashing
📁 Project Structure
text
pos-backend/
├── prisma/
│   └── schema.prisma              # Database schema with all models
├── src/
│   ├── index.ts                   # Main application entry point
│   ├── config/
│   │   └── database.ts            # Database connection
│   ├── middleware/
│   │   ├── auth.ts                # JWT authentication middleware
│   │   ├── rateLimit.ts           # Rate limiting
│   │   └── roleCheck.ts           # Role-based access control
│   └── routes/
│       ├── auth.ts                # Authentication routes
│       ├── users.ts               # User management
│       ├── products.ts            # Product management
│       ├── customers.ts           # Customer management
│       ├── invoices.ts            # Invoice management
│       ├── inventory.ts           # Inventory management
│       ├── payments.ts            # Payment transactions
│       └── reports.ts             # Reporting endpoints
├── .env                           # Environment variables
├── .env.example                   # Example environment file
├── package.json
├── tsconfig.json
└── README.md
🗄️ Database Models
User
prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  phone     String   @unique
  password  String
  role      Role     @default(sales)  // admin, sales, warehouse, sales_admin
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  invoices  Invoice[]
  // ... relations
}
Product
prisma
model Product {
  id              Int      @id @default(autoincrement())
  code            String?  @unique
  name            String
  barcode         String?  @unique
  unitType        UnitType // bottle, carton, liter
  qtyPerCarton    Int?     // for carton type
  unitPrice       Float    // price per unit (in Rial)
  cartonPrice     Float?   // auto-calculated
  stock           Float    @default(0)
  minStock        Float    @default(0)
  isAvailable     Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  inventory       Inventory[]
  invoiceItems    InvoiceItem[]
}
Customer
prisma
model Customer {
  id              Int      @id @default(autoincrement())
  name            String
  phone           String?  @unique
  address         String?
  debt            Float    @default(0) // in Rial
  totalPurchases  Float    @default(0)
  lastPurchase    DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  invoices        Invoice[]
  payments        PaymentTransaction[]
}
Invoice
prisma
model Invoice {
  id              Int      @id @default(autoincrement())
  number          String   @unique
  customerId      Int
  userId          Int
  status          InvoiceStatus // draft, final, paid, settled
  discount        Float    @default(0)
  total           Float    // in Rial
  paidAmount      Float    @default(0)
  debtAmount      Float    @default(0)
  watermark       String?  // "پیش‌نویس" for draft
  finalizedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  customer        Customer @relation(fields: [customerId], references: [id])
  user            User     @relation(fields: [userId], references: [id])
  items           InvoiceItem[]
  payments        PaymentTransaction[]
}
🔐 Authentication & Security
JWT Authentication
Token expires in 7 days

Stored in HTTP-only cookies (recommended) or Authorization header

Secret key from .env

Password Security
Passwords hashed with bcrypt (10 rounds)

Minimum password length: 6 characters

No plain-text storage

Rate Limiting
100 requests per minute per IP

3 failed login attempts triggers Captcha

Role-Based Access Control
Role	Access Level
admin	Full access to all endpoints
sales_admin	Invoice + basic access + no watermark
sales	Invoice creation only (draft watermark)
warehouse	Inventory management only
📡 API Endpoints
Authentication
Method	Endpoint	Description	Auth
POST	/api/auth/login	Login with phone & password	❌
POST	/api/auth/logout	Logout (clear token)	✅
GET	/api/auth/me	Get current user profile	✅
POST	/api/auth/refresh	Refresh token	✅
Users (Admin only)
Method	Endpoint	Description
GET	/api/users	Get all users
GET	/api/users/:id	Get user by ID
POST	/api/users	Create new user
PUT	/api/users/:id	Update user
DELETE	/api/users/:id	Delete user
PATCH	/api/users/:id/status	Toggle active status
Products
Method	Endpoint	Description	Auth
GET	/api/products	Get all products	✅
GET	/api/products/:id	Get product by ID	✅
POST	/api/products	Create product	Admin
PUT	/api/products/:id	Update product	Admin
DELETE	/api/products/:id	Delete product	Admin
GET	/api/products/search	Search products	✅
GET	/api/products/low-stock	Get low stock products	✅
Customers
Method	Endpoint	Description	Auth
GET	/api/customers	Get all customers	✅
GET	/api/customers/:id	Get customer by ID	✅
POST	/api/customers	Create customer	Admin
PUT	/api/customers/:id	Update customer	Admin
DELETE	/api/customers/:id	Delete customer	Admin
GET	/api/customers/with-debt	Get customers with debt	Admin
GET	/api/customers/:id/stats	Get customer purchase stats	✅
Invoices
Method	Endpoint	Description	Auth
GET	/api/invoices	Get all invoices	✅
GET	/api/invoices/:id	Get invoice by ID	✅
POST	/api/invoices	Create invoice (draft)	Sales
PUT	/api/invoices/:id	Update invoice	Sales
DELETE	/api/invoices/:id	Delete invoice	Admin
POST	/api/invoices/:id/finalize	Finalize invoice	Sales
POST	/api/invoices/:id/print	Get printable invoice	Sales
GET	/api/invoices/my	Get current user's invoices	Sales
Inventory
Method	Endpoint	Description	Auth
GET	/api/inventory	Get all inventory	✅
GET	/api/inventory/product/:id	Get product inventory	✅
POST	/api/inventory/add	Add stock	Admin/Warehouse
POST	/api/inventory/subtract	Subtract stock	Admin/Warehouse
GET	/api/inventory/logs	Get inventory logs	Admin
GET	/api/inventory/negative	Get negative stock items	Admin
GET	/api/inventory/low	Get low stock items	Admin
Payments
Method	Endpoint	Description	Auth
POST	/api/payments	Create payment transaction	Admin
GET	/api/payments	Get all payments	Admin
GET	/api/payments/customer/:id	Get customer payments	Admin
GET	/api/payments/invoice/:id	Get invoice payments	Admin
Reports (Admin only)
Method	Endpoint	Description
GET	/api/reports/sales	Sales report (daily/weekly/monthly)
GET	/api/reports/inventory	Inventory report
GET	/api/reports/customers/top	Top customers report
GET	/api/reports/sellers	Sellers performance report
GET	/api/reports/export/excel	Export to Excel
GET	/api/reports/export/pdf	Export to PDF
🔧 Installation & Setup
Prerequisites
Node.js 18+

npm or pnpm

SQLite (default) or PostgreSQL

Step-by-Step Installation
bash
# 1. Clone the repository
git clone https://github.com/here-is-leo/pos-system.git
cd pos-system/pos-backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your configuration
# DATABASE_URL="file:./dev.db"  # SQLite
# JWT_SECRET="your-secret-key"
# PORT=5000

# 5. Generate Prisma client
npx prisma generate

# 6. Run migrations
npx prisma migrate dev --name init

# 7. Seed database (create default admin)
npx prisma db seed

# 8. Start development server
npm run dev
Environment Variables
env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"  # SQLite
# DATABASE_URL="postgresql://user:password@localhost:5432/pos_db"  # PostgreSQL

# Security
JWT_SECRET="your-very-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:8080"

# Rate Limiting
RATE_LIMIT_WINDOW=60000  # 1 minute
RATE_LIMIT_MAX=100       # 100 requests per minute

# Development
LOG_LEVEL=debug
🧪 Testing
bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test
npm test -- auth.test.ts
📦 Scripts
Script	Description
npm run dev	Start development server (with auto-reload)
npm run build	Build for production
npm start	Start production server
npm run lint	Run ESLint
npm run format	Format code with Prettier
npm run prisma:studio	Open Prisma Studio
npm run db:seed	Seed database
npm run db:reset	Reset database
🗄️ Database Migrations
bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
🚀 Production Deployment
Using PM2
bash
# Install PM2 globally
npm install -g pm2

# Build project
npm run build

# Start with PM2
pm2 start dist/index.js --name pos-backend

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
Using Docker
dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "dist/index.js"]
Production Environment Variables
env
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/pos_db"
JWT_SECRET="very-long-secret-key-32-characters-minimum"
ALLOWED_ORIGINS="https://your-domain.com"
LOG_LEVEL=error
🔒 Security Best Practices
Use HTTPS in production

Set strong JWT secret (32+ characters)

Enable CORS properly (restrict to your domains)

Use environment variables for sensitive data

Regularly update dependencies

Implement audit logging

Use proper password policies

Sanitize user input

Implement request validation

Regular security audits

🐛 Error Handling
HTTP Status Codes
Code	Description
200	Success
201	Created
400	Bad Request
401	Unauthorized
403	Forbidden
404	Not Found
409	Conflict
422	Unprocessable Entity
429	Too Many Requests
500	Internal Server Error
Error Response Format
json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
📊 Logging
The system uses winston for logging with different levels:

javascript
// Log levels
logger.error('Error message');
logger.warn('Warning message');
logger.info('Info message');
logger.debug('Debug message');
🤝 Contributing
Fork the repository

Create feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open Pull Request

Code Style
Use TypeScript

Follow ESLint rules

Write meaningful comments

Add JSDoc for functions

Write unit tests for new features

📞 Support
Developer: Ilya Farahani

Email: ilyafarahanii@gmail.com

GitHub: https://github.com/here-is-leo

Project: https://github.com/here-is-leo/pos-system

📜 License
MIT License - see LICENSE file for details.

🇮🇷 نسخه فارسی
📋 نمای کلی
POS-Backend سرور اصلی API برای پروژه POS-System است. این بک‌اند تمام قابلیت‌های بک‌اند شامل احراز هویت، مدیریت کاربران، مدیریت محصولات، پردازش فاکتور، کنترل موجودی، مدیریت مشتریان و گزارش‌گیری را فراهم می‌کند.

🚀 تکنولوژی‌ها
تکنولوژی	نسخه	کاربرد
Node.js	18+	محیط اجرا
Express.js	4.x	فریم‌ورک وب
Prisma	5.x	ORM دیتابیس
SQLite	3.x	دیتابیس (توسعه)
PostgreSQL	14+	دیتابیس (تولید - اختیاری)
TypeScript	5.x	امنیت نوع
JWT	-	احراز هویت
bcrypt	-	هش کردن رمز عبور
📁 ساختار پروژه
text
pos-backend/
├── prisma/
│   └── schema.prisma              # شمای دیتابیس
├── src/
│   ├── index.ts                   # نقطه ورود اصلی
│   ├── config/
│   │   └── database.ts            # اتصال دیتابیس
│   ├── middleware/
│   │   ├── auth.ts                # میان‌افزار احراز هویت JWT
│   │   ├── rateLimit.ts           # محدودیت درخواست
│   │   └── roleCheck.ts           # کنترل دسترسی بر اساس نقش
│   └── routes/
│       ├── auth.ts                # مسیرهای احراز هویت
│       ├── users.ts               # مدیریت کاربران
│       ├── products.ts            # مدیریت محصولات
│       ├── customers.ts           # مدیریت مشتریان
│       ├── invoices.ts            # مدیریت فاکتورها
│       ├── inventory.ts           # مدیریت موجودی
│       ├── payments.ts            # تراکنش‌های پرداخت
│       └── reports.ts             # گزارش‌گیری
├── .env                           # متغیرهای محیطی
├── .env.example                   # فایل نمونه متغیرهای محیطی
├── package.json
├── tsconfig.json
└── README.md
🗄️ مدل‌های دیتابیس
کاربر (User)
prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  phone     String   @unique
  password  String
  role      Role     @default(sales)  // admin, sales, warehouse, sales_admin
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  invoices  Invoice[]
  // ... روابط دیگر
}
محصول (Product)
prisma
model Product {
  id              Int      @id @default(autoincrement())
  code            String?  @unique
  name            String
  barcode         String?  @unique
  unitType        UnitType // bottle, carton, liter
  qtyPerCarton    Int?     // برای نوع کارتن
  unitPrice       Float    // قیمت هر واحد (به ریال)
  cartonPrice     Float?   // محاسبه خودکار
  stock           Float    @default(0)
  minStock        Float    @default(0)
  isAvailable     Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  inventory       Inventory[]
  invoiceItems    InvoiceItem[]
}
مشتری (Customer)
prisma
model Customer {
  id              Int      @id @default(autoincrement())
  name            String
  phone           String?  @unique
  address         String?
  debt            Float    @default(0) // به ریال
  totalPurchases  Float    @default(0)
  lastPurchase    DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  invoices        Invoice[]
  payments        PaymentTransaction[]
}
فاکتور (Invoice)
prisma
model Invoice {
  id              Int      @id @default(autoincrement())
  number          String   @unique
  customerId      Int
  userId          Int
  status          InvoiceStatus // draft, final, paid, settled
  discount        Float    @default(0)
  total           Float    // به ریال
  paidAmount      Float    @default(0)
  debtAmount      Float    @default(0)
  watermark       String?  // "پیش‌نویس" برای حالت پیش‌نویس
  finalizedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  customer        Customer @relation(fields: [customerId], references: [id])
  user            User     @relation(fields: [userId], references: [id])
  items           InvoiceItem[]
  payments        PaymentTransaction[]
}
🔐 احراز هویت و امنیت
احراز هویت JWT
توکن در ۷ روز منقضی می‌شود

در کوکی HTTP-only ذخیره می‌شود (توصیه شده) یا در هدر Authorization

کلید مخفی از فایل .env

امنیت رمز عبور
رمز عبور با bcrypt هش می‌شود (۱۰ دور)

حداقل طول رمز عبور: ۶ کاراکتر

عدم ذخیره‌سازی متن ساده

محدودیت درخواست
۱۰۰ درخواست در دقیقه برای هر IP

۳ تلاش ناموفق برای ورود باعث فعال شدن کپچا می‌شود

کنترل دسترسی بر اساس نقش
نقش	سطح دسترسی
admin	دسترسی کامل به همه مسیرها
sales_admin	فاکتور + دسترسی پایه + بدون واترمارک
sales	فقط صدور فاکتور (با واترمارک پیش‌نویس)
warehouse	فقط مدیریت موجودی
📡 APIهای موجود
احراز هویت
متد	مسیر	توضیح	احراز هویت
POST	/api/auth/login	ورود با تلفن و رمز عبور	❌
POST	/api/auth/logout	خروج (پاک کردن توکن)	✅
GET	/api/auth/me	دریافت پروفایل کاربر جاری	✅
POST	/api/auth/refresh	تمدید توکن	✅
کاربران (فقط ادمین)
متد	مسیر	توضیح
GET	/api/users	دریافت همه کاربران
GET	/api/users/:id	دریافت کاربر با ID
POST	/api/users	ایجاد کاربر جدید
PUT	/api/users/:id	بروزرسانی کاربر
DELETE	/api/users/:id	حذف کاربر
PATCH	/api/users/:id/status	تغییر وضعیت فعال/غیرفعال
محصولات
متد	مسیر	توضیح	احراز هویت
GET	/api/products	دریافت همه محصولات	✅
GET	/api/products/:id	دریافت محصول با ID	✅
POST	/api/products	ایجاد محصول	ادمین
PUT	/api/products/:id	بروزرسانی محصول	ادمین
DELETE	/api/products/:id	حذف محصول	ادمین
GET	/api/products/search	جستجوی محصولات	✅
GET	/api/products/low-stock	دریافت محصولات کم‌موجود	✅
مشتریان
متد	مسیر	توضیح	احراز هویت
GET	/api/customers	دریافت همه مشتریان	✅
GET	/api/customers/:id	دریافت مشتری با ID	✅
POST	/api/customers	ایجاد مشتری	ادمین
PUT	/api/customers/:id	بروزرسانی مشتری	ادمین
DELETE	/api/customers/:id	حذف مشتری	ادمین
GET	/api/customers/with-debt	دریافت مشتریان بدهکار	ادمین
GET	/api/customers/:id/stats	دریافت آمار خرید مشتری	✅
فاکتورها
متد	مسیر	توضیح	احراز هویت
GET	/api/invoices	دریافت همه فاکتورها	✅
GET	/api/invoices/:id	دریافت فاکتور با ID	✅
POST	/api/invoices	ایجاد فاکتور (پیش‌نویس)	فروشنده
PUT	/api/invoices/:id	بروزرسانی فاکتور	فروشنده
DELETE	/api/invoices/:id	حذف فاکتور	ادمین
POST	/api/invoices/:id/finalize	نهایی‌سازی فاکتور	فروشنده
POST	/api/invoices/:id/print	دریافت فاکتور قابل چاپ	فروشنده
GET	/api/invoices/my	دریافت فاکتورهای کاربر جاری	فروشنده
موجودی
متد	مسیر	توضیح	احراز هویت
GET	/api/inventory	دریافت همه موجودی	✅
GET	/api/inventory/product/:id	دریافت موجودی محصول	✅
POST	/api/inventory/add	افزودن موجودی	ادمین/انباردار
POST	/api/inventory/subtract	کسر موجودی	ادمین/انباردار
GET	/api/inventory/logs	دریافت لاگ‌های موجودی	ادمین
GET	/api/inventory/negative	دریافت موجودی منفی	ادمین
GET	/api/inventory/low	دریافت موجودی کم	ادمین
🔧 نصب و راه‌اندازی
پیش‌نیازها
Node.js 18+

npm یا pnpm

SQLite (پیش‌فرض) یا PostgreSQL

مراحل نصب
bash
# 1. کلون کردن مخزن
git clone https://github.com/here-is-leo/pos-system.git
cd pos-system/pos-backend

# 2. نصب وابستگی‌ها
npm install

# 3. ایجاد فایل محیطی
cp .env.example .env

# 4. ویرایش فایل .env با تنظیمات خود
# DATABASE_URL="file:./dev.db"  # SQLite
# JWT_SECRET="your-secret-key"
# PORT=5000

# 5. تولید Prisma client
npx prisma generate

# 6. اجرای مهاجرت‌ها
npx prisma migrate dev --name init

# 7. پر کردن دیتابیس (ایجاد ادمین پیش‌فرض)
npx prisma db seed

# 8. شروع سرور توسعه
npm run dev
📞 پشتیبانی
توسعه‌دهنده: ایلیا فراهانی

ایمیل: ilyafarahanii@gmail.com

گیت‌هاب: https://github.com/here-is-leo

پروژه: https://github.com/here-is-leo/pos-system

📜 لایسنس
مجوز MIT - برای جزئیات به فایل LICENSE مراجعه کنید.

توسعه‌دهنده: ایلیا فراهانی
آخرین بروزرسانی: ۱۴۰۴/۰۵/۲۰

