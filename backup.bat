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