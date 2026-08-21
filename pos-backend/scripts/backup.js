// pos-backend/scripts/backup.js
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================================
// تنظیمات
// ==============================================
const PROJECT_ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(PROJECT_ROOT, 'prisma', 'dev.db');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backups');
const MAX_BACKUPS = 30;

// ==============================================
// ایجاد پوشه بک‌آپ
// ==============================================
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('📁 پوشه بک‌آپ ایجاد شد:', BACKUP_DIR);
}

// ==============================================
// گرفتن تاریخ و زمان
// ==============================================
const now = new Date();
const dateStr = 
  now.getFullYear() +
  String(now.getMonth() + 1).padStart(2, '0') +
  String(now.getDate()).padStart(2, '0') + '_' +
  String(now.getHours()).padStart(2, '0') +
  String(now.getMinutes()).padStart(2, '0') +
  String(now.getSeconds()).padStart(2, '0');

const backupName = `backup_${dateStr}.db`;
const backupPath = path.join(BACKUP_DIR, backupName);

// ==============================================
// ۱. بک‌آپ گرفتن
// ==============================================
console.log('==============================================');
console.log('📦 شروع بک‌آپ دیتابیس...');
console.log(`📁 مسیر دیتابیس: ${DB_PATH}`);
console.log(`📁 مسیر بک‌آپ: ${backupPath}`);
console.log('==============================================');

// بررسی وجود دیتابیس
if (!fs.existsSync(DB_PATH)) {
  console.error('❌ خطا: فایل دیتابیس وجود ندارد!');
  console.error(`📁 مسیر: ${DB_PATH}`);
  process.exit(1);
}

// کپی فایل
try {
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`✅ بک‌آپ ذخیره شد: ${backupPath}`);
} catch (err) {
  console.error('❌ خطا در کپی فایل:', err.message);
  process.exit(1);
}

// ==============================================
// ۲. فشرده‌سازی (اختیاری)
// ==============================================
console.log('📦 در حال فشرده‌سازی...');

const zipPath = backupPath + '.zip';

// ویندوز
if (process.platform === 'win32') {
  exec(
    `powershell Compress-Archive -Path "${backupPath}" -DestinationPath "${zipPath}" -Force`,
    (err) => {
      if (!err) {
        fs.unlinkSync(backupPath);
        console.log(`✅ فشرده شد: ${zipPath}`);
        cleanOldBackups();
      } else {
        console.log('⚠️ فشرده‌سازی انجام نشد (فایل بدون فشرده‌سازی ذخیره شد)');
        cleanOldBackups();
      }
    }
  );
}
// لینوکس/مک
else {
  exec(`gzip -f "${backupPath}"`, (err) => {
    if (!err) {
      console.log(`✅ فشرده شد: ${backupPath}.gz`);
      cleanOldBackups();
    } else {
      console.log('⚠️ فشرده‌سازی انجام نشد (فایل بدون فشرده‌سازی ذخیره شد)');
      cleanOldBackups();
    }
  });
}

// ==============================================
// ۳. حذف بک‌آپ‌های قدیمی
// ==============================================
function cleanOldBackups() {
  console.log('🧹 در حال حذف بک‌آپ‌های قدیمی...');

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup_'))
    .sort();

  // فایل‌های با پسوندهای مختلف
  const allFiles = files.filter(f => 
    f.endsWith('.db') || f.endsWith('.zip') || f.endsWith('.gz')
  );

  if (allFiles.length > MAX_BACKUPS) {
    const toDelete = allFiles.slice(0, allFiles.length - MAX_BACKUPS);
    toDelete.forEach(f => {
      const filePath = path.join(BACKUP_DIR, f);
      fs.unlinkSync(filePath);
      console.log(`🗑️ حذف شد: ${f}`);
    });
  }

  // ==============================================
  // ۴. گزارش نهایی
  // ==============================================
  console.log('==============================================');
  console.log('📊 گزارش بک‌آپ');
  console.log('==============================================');
  console.log(`📁 پوشه: ${BACKUP_DIR}`);
  console.log(`📄 تعداد کل بک‌آپ‌ها: ${allFiles.length}`);
  console.log(`📅 آخرین بک‌آپ:`);
  
  const lastBackup = allFiles[allFiles.length - 1];
  if (lastBackup) {
    console.log(`   ${lastBackup}`);
  }
  
  console.log('==============================================');
  console.log('✅ بک‌آپ با موفقیت کامل شد!');
  console.log(`🕐 زمان: ${now.toLocaleString('fa-IR')}`);
  console.log('==============================================');
}

// ==============================================
// ۵. مدیریت خطا
// ==============================================
process.on('uncaughtException', (err) => {
  console.error('❌ خطای ناخواسته:', err.message);
  process.exit(1);
});