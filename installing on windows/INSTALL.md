📦 راهنمای نصب POS-System - Windows
راهنمای کامل گام‌به‌گام نصب و راه‌اندازی در سیستم‌عامل Windows

📋 فهرست مطالب
پیش‌نیازها

نصب Node.js

نصب فونت Vazirmatn

نصب پروژه

اجرای پروژه

عیب‌یابی

سوالات متداول

🔧 پیش‌نیازها
قبل از شروع، مطمئن شوید که سیستم شما این موارد را دارد:

مورد	حداقل نسخه	توضیح
سیستم‌عامل	Windows 10/11 (64-bit)	نسخه Pro یا Home
پردازنده	Intel Core i3 / AMD Ryzen 3 یا بالاتر	-
رم	4GB یا بیشتر	-
فضای دیسک	2GB فضای خالی	-
Node.js	v18.0.0 یا بالاتر	ضروری
npm	v9.0.0 یا بالاتر	همراه Node.js
مرورگر	Chrome 90+ / Firefox 88+ / Edge 90+	برای اجرا
📥 نصب Node.js
روش ۱: نصب با فایل Installer (توصیه شده)
فایل نصب Node.js را پیدا کنید:

فایل node-v18.20.0-x64.msi را در پوشه pos-system پیدا کنید

یا از سایت رسمی دانلود کنید

اجرای فایل نصب:

روی فایل node-v18.20.0-x64.msi دوبار کلیک کنید

اگر پیام امنیت دریافت کردید، روی Run کلیک کنید

مراحل نصب:

text
✅ Welcome → Next
✅ License Agreement → I accept → Next
✅ Destination Folder → Next (مسیر پیش‌فرض: C:\Program Files\nodejs)
✅ Custom Setup → Next
✅ Ready to install → Install
✅ User Account Control → Yes
✅ Complete → Finish
تأیید نصب:

cmd
# Command Prompt را باز کنید (Win + R → cmd)
node --version
# خروجی: v18.20.0

npm --version
# خروجی: 10.5.0
روش ۲: نصب با Chocolatey
powershell
# PowerShell را به عنوان Administrator اجرا کنید
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
choco install nodejs-lts -y
🖋️ نصب فونت Vazirmatn
روش ۱: نصب سریع (توصیه شده)
فایل Vazirmatn.ttf را در پوشه fonts پیدا کنید

روی فایل راست کلیک کنید

گزینه Install را انتخاب کنید

منتظر بمانید تا نصب کامل شود (حداکثر ۱۰ ثانیه)

روش ۲: نصب دستی
پوشه C:\Windows\Fonts را باز کنید

فایل Vazirmatn.ttf را در آن کپی کنید

سیستم را ری‌استارت کنید (اختیاری)

روش ۳: نصب از طریق Control Panel
Control Panel را باز کنید

به Appearance and Personalization بروید

روی Fonts کلیک کنید

فایل Vazirmatn.ttf را به داخل پنجره بکشید و رها کنید

📂 نصب پروژه
مرحله ۱: استخراج فایل‌ها
فایل pos-system.zip را در یک پوشه مناسب اکسترکت کنید

ساختار پوشه‌ها باید به این شکل باشد:

text
pos-system/
├── pos-backend/
├── rtl-admin-dashboard/
├── invoice-management-system/
├── invoice-inventory-system/
├── fonts/
│   └── Vazirmatn.ttf
├── node-v18.20.0-x64.msi
├── install-all.bat
├── run-all.bat
└── README.md
مرحله ۲: نصب وابستگی‌ها
گزینه A: نصب خودکار با اسکریپت (توصیه شده)
روی فایل install-all.bat دوبار کلیک کنید

اگر پیام امنیت دریافت کردید، روی Run کلیک کنید

صبر کنید تا نصب کامل شود (حدود ۳-۵ دقیقه)

اگر خطایی رخ داد، روی فایل راست کلیک کرده و Run as administrator را انتخاب کنید

گزینه B: نصب دستی
۱. Command Prompt را باز کنید:

Win + R را بزنید

cmd را تایپ کنید

Enter بزنید

۲. به پوشه پروژه بروید:

cmd
cd C:\path\to\pos-system
۳. بک‌اند:

cmd
cd pos-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
cd ..
۴. ادمین:

cmd
cd rtl-admin-dashboard
npm install
cd ..
۵. فروشنده:

cmd
cd invoice-management-system
npm install
cd ..
۶. انباردار:

cmd
cd invoice-inventory-system
npm install
cd ..
🚀 اجرای پروژه
روش ۱: اجرای همه پروژه‌ها با هم (توصیه شده)
روی فایل run-all.bat دوبار کلیک کنید

چهار پنجره Command Prompt باز می‌شود (یکی برای هر پروژه)

صبر کنید تا همه سرورها راه‌اندازی شوند

روش ۲: اجرای جداگانه با Command Prompt
۱. بک‌اند (ابتدا اجرا شود):

cmd
cd C:\path\to\pos-system\pos-backend
npm run dev
۲. ادمین (پس از اجرای بک‌اند):

cmd
cd C:\path\to\pos-system\rtl-admin-dashboard
npm run dev
۳. فروشنده:

cmd
cd C:\path\to\pos-system\invoice-management-system
npm run build
npm run start
۴. انباردار:

cmd
cd C:\path\to\pos-system\invoice-inventory-system
npm run dev
روش ۳: اجرا با PowerShell
۱. PowerShell را باز کنید:

Win + X را بزنید

Windows PowerShell را انتخاب کنید

۲. هر پروژه را اجرا کنید:

powershell
cd C:\path\to\pos-system\pos-backend
npm run dev
آدرس‌های دسترسی:
پروژه	پورت	آدرس
بک‌اند	5000	http://localhost:5000
ادمین	8080	http://localhost:8080
فروشنده	3000	http://localhost:3000
انباردار	3001	http://localhost:3001
🔑 ورود به سیستم
اطلاعات ورود پیش‌فرض:
نقش	تلفن	رمز عبور
ادمین	09121112233	123456
ساخت کاربران جدید (توسط ادمین):
مرورگر را باز کنید

به http://localhost:8080 بروید

با اطلاعات ادمین وارد شوید

به بخش کاربران بروید

روی کاربر جدید کلیک کنید

اطلاعات را وارد کنید و نقش را انتخاب کنید

💾 بک‌آپ گیری خودکار ⭐ جدید
روش ۱: بک‌آپ دستی (ساده)
cmd
cd C:\path\to\pos-system\pos-backend
npm run backup
روش ۲: بک‌آپ خودکار با Task Scheduler
مرحله ۱: ایجاد فایل backup.bat
فایل backup.bat را در پوشه pos-system ایجاد کنید:

batch
@echo off
echo ==============================================
echo 📦 بک‌آپ خودکار دیتابیس POS-System
echo ==============================================

set PROJECT_DIR=C:\path\to\pos-system
cd %PROJECT_DIR%\pos-backend

echo [%date% %time%] شروع بک‌آپ...
npm run backup

echo.
echo ✅ بک‌آپ کامل شد!
echo 📁 پوشه بک‌آپ: %PROJECT_DIR%\pos-backend\backups
echo.
pause
مرحله ۲: تنظیم Task Scheduler
Task Scheduler را باز کنید:

Win + R → taskschd.msc → Enter

Create Basic Task:

Name: POS-System Daily Backup

Description: بک‌آپ خودکار دیتابیس هر روز

Trigger: Daily (هر روز)

Start: 12:00:00 (ظهر)

Action: Start a program

Program: C:\path\to\pos-system\backup.bat

Finish را بزنید.

روش ۳: بک‌آپ با Prisma Studio
cmd
cd pos-backend
npx prisma studio
سپس در مرورگر:

روی دیتابیس راست کلیک کنید

Export → SQL را انتخاب کنید

فایل را ذخیره کنید

روش ۴: بازیابی از بک‌آپ
cmd
cd pos-backend
npm run backup:restore
سپس شماره بک‌آپ مورد نظر را انتخاب کنید.

📁 ساختار پوشه بک‌آپ
text
pos-backend/
├── backups/
│   ├── backup_20240815_120000.db.zip
│   ├── backup_20240814_120000.db.zip
│   ├── backup_20240813_120000.db.zip
│   └── ... (حداکثر 30 فایل)
├── scripts/
│   ├── backup.js
│   └── restore.js
└── prisma/
    └── dev.db
🔑 دستورات بک‌آپ
دستور	توضیح
npm run backup	بک‌آپ گرفتن از دیتابیس
npm run backup:now	بک‌آپ فوری
npm run backup:restore	بازیابی از بک‌آپ
🛠️ عیب‌یابی
1. خطای npm is not recognized
مشکل: دستور npm در Command Prompt شناسایی نمی‌شود

راه‌حل:

Node.js را مجدداً نصب کنید

سیستم را ری‌استارت کنید

Command Prompt را به عنوان Administrator اجرا کنید

مسیر Node.js را به PATH اضافه کنید:

cmd
setx PATH "%PATH%;C:\Program Files\nodejs"
2. خطای PORT already in use
مشکل: پورت مورد نظر توسط برنامه دیگری استفاده می‌شود

راه‌حل:

cmd
# پیدا کردن برنامه‌ای که از پورت استفاده می‌کند
netstat -ano | findstr :5000

# کشتن برنامه با PID (مثلاً PID: 1234)
taskkill /PID 1234 /F
3. خطای Prisma در بک‌اند
مشکل: Prisma Client ساخته نشده است

راه‌حل:

cmd
cd pos-backend
npx prisma generate
npx prisma migrate dev --name init
4. خطای node-gyp
مشکل: نیاز به کامپایلر C++

راه‌حل:

cmd
# نصب Windows Build Tools
npm install --global windows-build-tools
5. خطای CORS
مشکل: اتصال بین پروژه‌ها برقرار نیست

راه‌حل:

مطمئن شوید بک‌اند در حال اجراست

فایل .env در پوشه admin را بررسی کنید

پورت‌ها را چک کنید

6. صفحه سفید در مرورگر
مشکل: پروژه build نشده است

راه‌حل:

cmd
cd rtl-admin-dashboard
npm run build
7. خطای EADDRINUSE
مشکل: پورت در حال استفاده است

راه‌حل:

cmd
# پیدا کردن و کشتن فرآیند روی پورت 3000
for /f "tokens=5" %a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %a
📝 فایل‌های Batch
install-all.bat
batch
@echo off
echo Installing POS-System dependencies...
echo.

echo [1/4] Installing Backend...
cd pos-backend
call npm install
call npx prisma generate
call npx prisma migrate dev --name init
cd ..

echo [2/4] Installing Admin Dashboard...
cd rtl-admin-dashboard
call npm install
cd ..

echo [3/4] Installing Sales System...
cd invoice-management-system
call npm install
cd ..

echo [4/4] Installing Warehouse System...
cd invoice-inventory-system
call npm install
cd ..

echo.
echo All dependencies installed successfully!
echo You can now run run-all.bat to start the project.
pause
run-all.bat
batch
@echo off
echo Starting POS-System...
echo.

start "POS Backend" cmd /c "cd pos-backend && npm run dev"
timeout /t 2 /nobreak >nul
start "POS Admin" cmd /c "cd rtl-admin-dashboard && npm run dev"
timeout /t 2 /nobreak >nul
start "POS Sales" cmd /c "cd invoice-management-system && npm run dev"
timeout /t 2 /nobreak >nul
start "POS Warehouse" cmd /c "cd invoice-inventory-system && npm run dev"

echo.
echo All services starting...
echo.
echo Admin Panel: http://localhost:8080
echo Sales System: http://localhost:3000
echo Warehouse System: http://localhost:3001
echo.
pause
❓ سوالات متداول
Q1: خطای Access Denied در نصب
راه‌حل: فایل را Run as administrator اجرا کنید

Q2: خطای Node.js not found بعد از نصب
راه‌حل: سیستم را ری‌استارت کنید

Q3: خطای Prisma در اجرا
راه‌حل:

cmd
cd pos-backend
npx prisma generate
Q4: خطای Module not found
راه‌حل:

cmd
rm -rf node_modules
npm install
📞 پشتیبانی
توسعه‌دهنده: ایلیا فراهانی

ایمیل: ilyafarahanii@gmail.com

گیت‌هاب: https://github.com/here-is-leo

✅ بررسی نهایی
□ Node.js نصب شده است (node --version)
□ npm نصب شده است (npm --version)
□ فونت Vazirmatn نصب شده است
□ همه پروژه‌ها npm install شده‌اند
□ بک‌اند در پورت 5000 اجرا می‌شود
□ ادمین در پورت 8080 اجرا می‌شود
□ فروشنده در پورت 3000 اجرا می‌شود
□ انباردار در پورت 3001 اجرا می‌شود
□ می‌توانید با ادمین وارد شوید
🎉 تبریک! پروژه شما روی Windows آماده اجراست!

نسخه: 2.0
سیستم‌عامل: Windows 10/11
تاریخ انتشار: مرداد ۱۴۰۴

