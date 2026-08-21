// pos-backend/scripts/restore.js
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(PROJECT_ROOT, 'prisma', 'dev.db');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backups');

// ایجاد رابط خط فرمان
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('==============================================');
console.log('♻️  بازیابی دیتابیس از بک‌آپ');
console.log('==============================================');

// لیست بک‌آپ‌ها
const backups = fs.readdirSync(BACKUP_DIR)
  .filter(f => f.startsWith('backup_'))
  .sort()
  .reverse();

if (backups.length === 0) {
  console.log('❌ هیچ بک‌آپی پیدا نشد!');
  process.exit(1);
}

console.log('\n📋 لیست بک‌آپ‌های موجود:');
backups.forEach((f, i) => {
  const stats = fs.statSync(path.join(BACKUP_DIR, f));
  const size = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`  ${i + 1}. ${f} (${size} MB)`);
});

rl.question('\n🔢 شماره بک‌آپ را انتخاب کنید (یا 0 برای انصراف): ', (answer) => {
  const num = parseInt(answer);
  
  if (num === 0 || isNaN(num)) {
    console.log('❌ بازیابی لغو شد.');
    rl.close();
    process.exit(0);
  }

  if (num < 1 || num > backups.length) {
    console.log('❌ شماره نامعتبر!');
    rl.close();
    process.exit(1);
  }

  const selected = backups[num - 1];
  const backupPath = path.join(BACKUP_DIR, selected);

  console.log(`\n📁 انتخاب شد: ${selected}`);

  // هشدار
  console.log('\n⚠️  هشدار: این کار دیتابیس فعلی را بازنویسی می‌کند!');
  rl.question('آیا مطمئن هستید؟ (yes/no): ', (confirm) => {
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ بازیابی لغو شد.');
      rl.close();
      process.exit(0);
    }

    // بررسی فرمت فایل
    let sourceFile = backupPath;
    if (selected.endsWith('.zip')) {
      console.log('📦 در حال اکسترکت فایل zip...');
      exec(
        `powershell Expand-Archive -Path "${backupPath}" -DestinationPath "${BACKUP_DIR}" -Force`,
        (err) => {
          if (err) {
            console.error('❌ خطا در اکسترکت:', err.message);
            rl.close();
            process.exit(1);
          }
          const dbFile = backupPath.replace('.zip', '.db');
          restoreDatabase(dbFile);
        }
      );
    } else if (selected.endsWith('.gz')) {
      console.log('📦 در حال اکسترکت فایل gz...');
      exec(`gunzip -f "${backupPath}"`, (err) => {
        if (err) {
          console.error('❌ خطا در اکسترکت:', err.message);
          rl.close();
          process.exit(1);
        }
        const dbFile = backupPath.replace('.gz', '');
        restoreDatabase(dbFile);
      });
    } else {
      restoreDatabase(backupPath);
    }
  });
});

function restoreDatabase(sourceFile) {
  console.log('♻️  در حال بازیابی دیتابیس...');
  
  try {
    // بک‌آپ از دیتابیس فعلی (قبل از بازنویسی)
    const now = new Date();
    const dateStr = 
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    
    const autoBackup = path.join(BACKUP_DIR, `auto_backup_before_restore_${dateStr}.db`);
    fs.copyFileSync(DB_PATH, autoBackup);
    console.log(`💾 بک‌آپ خودکار از دیتابیس فعلی: ${autoBackup}`);

    // بازنویسی دیتابیس
    fs.copyFileSync(sourceFile, DB_PATH);
    console.log('✅ دیتابیس با موفقیت بازیابی شد!');
    console.log(`📁 مسیر: ${DB_PATH}`);
    
    rl.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ خطا در بازیابی:', err.message);
    rl.close();
    process.exit(1);
  }
}