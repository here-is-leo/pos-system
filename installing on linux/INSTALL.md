📦 راهنمای نصب POS-System - Linux
راهنمای کامل گام‌به‌گام نصب و راه‌اندازی در سیستم‌عامل Linux (Ubuntu/Debian)

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
سیستم‌عامل	Ubuntu 20.04+ / Debian 11+	یا توزیع‌های مشابه
پردازنده	Intel Core i3 / AMD Ryzen 3 یا بالاتر	-
رم	4GB یا بیشتر	-
فضای دیسک	2GB فضای خالی	-
Node.js	v18.0.0 یا بالاتر	ضروری
npm	v9.0.0 یا بالاتر	همراه Node.js
مرورگر	Chrome 90+ / Firefox 88+	برای اجرا
📥 نصب Node.js
روش ۱: نصب با NodeSource (توصیه شده)
bash
# 1. اضافه کردن NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 2. نصب Node.js
sudo apt-get install -y nodejs

# 3. تأیید نصب
node --version
# خروجی: v18.20.0

npm --version
# خروجی: 10.5.0
روش ۲: نصب با NVM (مدیریت چند نسخه)
bash
# 1. نصب NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. بستن و باز کردن ترمینال
exec $SHELL

# 3. نصب نسخه LTS Node.js
nvm install --lts

# 4. استفاده از نسخه نصب شده
nvm use --lts

# 5. تأیید نصب
node --version
npm --version
روش ۳: نصب با Package Manager (Ubuntu/Debian)
bash
# نصب از مخازن رسمی (نسخه قدیمی‌تر)
sudo apt update
sudo apt install nodejs npm

# ارتقا به نسخه جدید (اختیاری)
sudo npm install -g n
sudo n stable
🖋️ نصب فونت Vazirmatn
روش ۱: نصب سیستمی (توصیه شده)
bash
# 1. ایجاد پوشه فونت‌ها
sudo mkdir -p /usr/share/fonts/truetype/vazirmatn

# 2. کپی فونت
sudo cp /path/to/pos-system/fonts/Vazirmatn.ttf /usr/share/fonts/truetype/vazirmatn/

# 3. به‌روزرسانی کش فونت
sudo fc-cache -fv

# 4. تأیید نصب
fc-list | grep Vazirmatn
روش ۲: نصب کاربری
bash
# 1. ایجاد پوشه فونت‌های کاربری
mkdir -p ~/.local/share/fonts

# 2. کپی فونت
cp /path/to/pos-system/fonts/Vazirmatn.ttf ~/.local/share/fonts/

# 3. به‌روزرسانی کش فونت
fc-cache -fv

# 4. تأیید نصب
fc-list | grep Vazirmatn
📂 نصب پروژه
مرحله ۱: استخراج فایل‌ها
bash
# 1. باز کردن ترمینال
# Ctrl + Alt + T

# 2. رفتن به پوشه فایل‌ها
cd /path/to/pos-system

# 3. اکسترکت فایل (اگر zip است)
unzip pos-system.zip -d pos-system

# 4. رفتن به پوشه پروژه
cd pos-system
ساختار پوشه‌ها باید به این شکل باشد:

text
pos-system/
├── pos-backend/
├── rtl-admin-dashboard/
├── invoice-management-system/
├── invoice-inventory-system/
├── fonts/
│   └── Vazirmatn.ttf
├── install-all.sh
├── run-all.sh
└── README.md
مرحله ۲: تنظیم مجوزهای اجرا
bash
# مجوز اجرا برای اسکریپت‌ها
chmod +x install-all.sh
chmod +x run-all.sh
مرحله ۳: نصب وابستگی‌ها
گزینه A: نصب خودکار با اسکریپت (توصیه شده)
bash
# اجرای اسکریپت نصب
./install-all.sh
گزینه B: نصب دستی
bash
# 1. بک‌اند
cd pos-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
cd ..

# 2. ادمین
cd rtl-admin-dashboard
npm install
cd ..

# 3. فروشنده
cd invoice-management-system
npm install
cd ..

# 4. انباردار
cd invoice-inventory-system
npm install
cd ..
🚀 اجرای پروژه
روش ۱: اجرای همه پروژه‌ها با هم (توصیه شده)
bash
# اجرای اسکریپت اجرا
./run-all.sh
روش ۲: اجرای جداگانه با Terminal
۱. بک‌اند (ابتدا اجرا شود):

bash
cd /path/to/pos-system/pos-backend
npm run dev
۲. ادمین (پس از اجرای بک‌اند):

bash
cd /path/to/pos-system/rtl-admin-dashboard
npm run dev
۳. فروشنده:

bash
cd /path/to/pos-system/invoice-management-system
npm run dev
۴. انباردار:

bash
cd /path/to/pos-system/invoice-inventory-system
npm run dev
روش ۳: اجرا با Tmux (چند ترمینال)
bash
# 1. نصب tmux
sudo apt install tmux

# 2. شروع tmux
tmux new -s pos

# 3. پنجره اول - بک‌اند
cd pos-backend && npm run dev
# Ctrl+B سپس C برای پنجره جدید

# 4. پنجره دوم - ادمین
cd rtl-admin-dashboard && npm run dev
# Ctrl+B سپس C

# 5. پنجره سوم - فروشنده
cd invoice-management-system && npm run dev
# Ctrl+B سپس C

# 6. پنجره چهارم - انباردار
cd invoice-inventory-system && npm run dev
روش ۴: اجرا با PM2 (مدیریت فرآیند)
bash
# 1. نصب PM2
sudo npm install -g pm2

# 2. ایجاد فایل ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'pos-backend',
    cwd: './pos-backend',
    script: 'npm',
    args: 'run dev'
  }, {
    name: 'pos-admin',
    cwd: './rtl-admin-dashboard',
    script: 'npm',
    args: 'run dev'
  }, {
    name: 'pos-sales',
    cwd: './invoice-management-system',
    script: 'npm',
    args: 'run dev'
  }, {
    name: 'pos-warehouse',
    cwd: './invoice-inventory-system',
    script: 'npm',
    args: 'run dev'
  }]
}
EOF

# 3. اجرا با PM2
pm2 start ecosystem.config.js

# 4. مشاهده وضعیت
pm2 status

# 5. مشاهده لاگ‌ها
pm2 logs
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

🛠️ عیب‌یابی
1. خطای EACCES: permission denied
مشکل: دسترسی به پورت‌های پایین‌تر از 1024

راه‌حل:

bash
# روش 1: استفاده از پورت‌های بالاتر
# تغییر پورت در فایل .env

# روش 2: اجرا با sudo (توصیه نمی‌شود)
sudo npm run dev

# روش 3: تنظیم دسترسی‌های Node.js
sudo setcap cap_net_bind_service=+ep $(which node)
2. خطای node-gyp
مشکل: نیاز به ابزارهای کامپایل

راه‌حل:

bash
sudo apt update
sudo apt install build-essential
sudo apt install python3
sudo apt install g++ make
3. خطای Prisma در بک‌اند
مشکل: Prisma Client ساخته نشده است

راه‌حل:

bash
cd pos-backend
npx prisma generate
npx prisma migrate dev --name init
4. خطای PORT already in use
مشکل: پورت مورد نظر توسط برنامه دیگری استفاده می‌شود

راه‌حل:

bash
# پیدا کردن PID استفاده‌کننده از پورت
sudo lsof -i :5000

# کشتن برنامه (مثلاً PID: 1234)
sudo kill -9 1234
5. خطای CORS
مشکل: اتصال بین پروژه‌ها برقرار نیست

راه‌حل:

مطمئن شوید بک‌اند در حال اجراست

فایل .env در پوشه admin را بررسی کنید

پورت‌ها را چک کنید

6. خطای NODE_ENV not set
راه‌حل:

bash
export NODE_ENV=development
7. خطای npm install کند
راه‌حل:

bash
# استفاده از آینه ایران
npm config set registry https://registry.npmmirror.com

# یا استفاده از pnpm به جای npm
npm install -g pnpm
pnpm install
📝 فایل‌های Shell
install-all.sh
bash
#!/bin/bash
echo "Installing POS-System dependencies..."
echo

echo "[1/4] Installing Backend..."
cd pos-backend || exit
npm install
npx prisma generate
npx prisma migrate dev --name init
cd ..

echo "[2/4] Installing Admin Dashboard..."
cd rtl-admin-dashboard || exit
npm install
cd ..

echo "[3/4] Installing Sales System..."
cd invoice-management-system || exit
npm install
cd ..

echo "[4/4] Installing Warehouse System..."
cd invoice-inventory-system || exit
npm install
cd ..

echo
echo "All dependencies installed successfully!"
echo "You can now run ./run-all.sh to start the project."
run-all.sh
bash
#!/bin/bash
echo "Starting POS-System..."
echo

# شروع بک‌اند در پس‌زمینه
cd pos-backend || exit
npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

# شروع ادمین
cd rtl-admin-dashboard || exit
npm run dev &
ADMIN_PID=$!
cd ..

sleep 2

# شروع فروشنده
cd invoice-management-system || exit
npm run dev &
SALES_PID=$!
cd ..

sleep 2

# شروع انباردار
cd invoice-inventory-system || exit
npm run dev &
WAREHOUSE_PID=$!
cd ..

echo
echo "All services starting..."
echo
echo "Admin Panel: http://localhost:8080"
echo "Sales System: http://localhost:3000"
echo "Warehouse System: http://localhost:3001"
echo
echo "Press Ctrl+C to stop all services"
echo

# منتظر ماندن برای خروج
wait
❓ سوالات متداول
Q1: خطای Module not found
راه‌حل:

bash
rm -rf node_modules
npm install
Q2: خطای Connection refused به دیتابیس
راه‌حل:

bash
cd pos-backend
npx prisma generate
npx prisma migrate dev
Q3: تغییر پورت در لینوکس
راه‌حل:

bash
# تغییر در فایل .env
echo "PORT=5005" >> .env
Q4: اجرا در پس‌زمینه
راه‌حل:

bash
# استفاده از nohup
nohup npm run dev > output.log 2>&1 &

# یا استفاده از screen
screen -S pos-backend
npm run dev
# Ctrl+A سپس D برای Detach
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
🎉 تبریک! پروژه شما روی Linux آماده اجراست!

نسخه: 2.0
سیستم‌عامل: Linux (Ubuntu/Debian)
تاریخ انتشار: مرداد ۱۴۰۴