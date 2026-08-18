# 📦 Installation Guide - POS-System 
 
## 🔧 Prerequisites 
- Node.js 18+ 
- npm or pnpm 
- 4GB RAM 
- 2GB free disk space 
 
## 📥 Installation 
 
### 1. Install Node.js 
Download from [nodejs.org](https://nodejs.org) 
 
### 2. Install Dependencies 
```bash 
# Backend 
cd pos-backend 
npm install 
npx prisma generate 
npx prisma migrate dev --name init 
 
# Admin Panel 
cd ../rtl-admin-dashboard 
npm install 
 
# Sales System 
cd ../invoice-management-system 
npm install 
 
# Warehouse System 
cd ../invoice-inventory-system 
npm install 
``` 
 
### 3. Run the Project 
```bash 
# Backend (Terminal 1) 
cd pos-backend && npm run dev 
 
# Admin Panel (Terminal 2) 
cd rtl-admin-dashboard && npm run dev 
 
# Sales System (Terminal 3) 
cd invoice-management-system && npm run dev 
 
# Warehouse System (Terminal 4) 
cd invoice-inventory-system && npm run dev 
``` 
 
### 4. Login 
- **Phone:** 09121112233 
- **Password:** 123456 
