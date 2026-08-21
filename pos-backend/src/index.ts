// pos-backend/src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

dotenv.config();

export const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'my-secret-key';

// ============================================
// 📌 CORS
// ============================================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ============================================
// 🔥 Auth Middleware
// ============================================
function auth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'توکن یافت نشد' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'توکن نامعتبر است' });
  }
}

// ============================================
// 📌 Health Check
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ message: 'POS API v1.0.0' });
});

// ============================================
// 🔥 توابع کمکی
// ============================================

async function createNotification(
  userId: number,
  type: 'danger' | 'warning' | 'info' | 'success',
  title: string,
  description: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, description, link },
    });
  } catch (error) {
    console.error('خطا در ایجاد نوتیفیکیشن:', error);
  }
}

async function checkLowStock() {
  try {
    const lowStockProducts = await prisma.inventory.findMany({
      where: { quantity: { lt: 10 } },
      include: { product: true },
    });

    if (lowStockProducts.length > 0) {
      const admins = await prisma.user.findMany({
        where: { role: 'admin' },
      });

      for (const admin of admins) {
        await createNotification(
          admin.id,
          'warning',
          'موجودی در آستانه اتمام',
          `${lowStockProducts.length} محصول کم‌موجود هستند`,
          '/products?status=low-stock'
        );
      }
    }
  } catch (error) {
    console.error('خطا در چک کردن موجودی کم:', error);
  }
}

// ============================================
// 📌 AUTH ROUTES
// ============================================

const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(4),
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(401).json({ message: 'کاربر یافت نشد' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'حساب کاربری غیرفعال است' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'رمز عبور اشتباه است' });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// ============================================
// 📌 PRODUCTS ROUTES - با productCode
// ============================================

// 🔥 GET /api/products - با پشتیبانی از productCode
app.get('/api/products', async (req, res) => {
  try {
    const { search } = req.query;
    const where = search
      ? {
          OR: [
            { name: { contains: search as string } },
            { productCode: { contains: search as string } }, // 🔥 اضافه شد
            { barcode: { contains: search as string } },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where,
      include: {
        inventory: true,
        warehouse: true,
      },
      take: 100,
    });

    res.json({
      data: products.map(p => ({
        id: p.id,
        name: p.name,
        productCode: p.productCode || '', // 🔥 اضافه شد
        barcode: p.barcode,
        unitType: p.unitType || 'single',
        cartonSize: p.cartonSize,
        unitPrice: Number(p.unitPrice),
        costPrice: Number(p.costPrice),
        cartonPrice: p.unitType === 'carton' ? Number(p.unitPrice) * (p.cartonSize || 1) : Number(p.unitPrice),
        stock: p.inventory ? Number(p.inventory.quantity) : 0,
        warehouse: p.warehouse.name,
        minStock: p.minStock,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// 🔥 POST /api/products - با productCode
app.post('/api/products', auth, async (req, res) => {
  try {
    const { 
      name, 
      productCode,  // 🔥 اضافه شد
      barcode, 
      unitType, 
      cartonSize, 
      unitPrice, 
      costPrice, 
      warehouseId, 
      minStock, 
      stock 
    } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'نام محصول الزامی است' });
    }

    // بررسی یکتا بودن productCode
    if (productCode) {
      const existing = await prisma.product.findUnique({
        where: { productCode },
      });
      if (existing) {
        return res.status(400).json({ message: 'این کد کالا قبلاً ثبت شده است' });
      }
    }

    // 🔥 محاسبه قیمت نهایی برای کارتن‌ها
    let finalUnitPrice = Number(unitPrice);
    let finalCartonPrice = null;
    
    if (unitType === 'carton' && cartonSize) {
      finalCartonPrice = Number(unitPrice) * Number(cartonSize);
      // قیمت واحد همان قیمت هر عدد باقی می‌ماند
      finalUnitPrice = Number(unitPrice);
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        productCode: productCode || null, // 🔥 اضافه شد
        barcode: barcode || null,
        unitType: unitType || 'single',
        cartonSize: cartonSize ? Number(cartonSize) : null,
        unitPrice: finalUnitPrice, // قیمت هر واحد
        costPrice: Number(costPrice) || 0,
        pricePerCarton: finalCartonPrice, // 🔥 قیمت هر کارتن
        warehouseId: warehouseId || 1,
        minStock: minStock || 5,
        inventory: {
          create: {
            warehouseId: warehouseId || 1,
            quantity: stock !== undefined ? Number(stock) : 0,
          },
        },
      },
      include: {
        warehouse: true,
        inventory: true,
      },
    });

    res.status(201).json({
      id: product.id,
      name: product.name,
      productCode: product.productCode, // 🔥 اضافه شد
      barcode: product.barcode,
      unitType: product.unitType,
      cartonSize: product.cartonSize,
      unitPrice: Number(product.unitPrice),
      costPrice: Number(product.costPrice),
      pricePerCarton: product.pricePerCarton ? Number(product.pricePerCarton) : null, // 🔥 اضافه شد
      cartonPrice: product.unitType === 'carton' && product.pricePerCarton 
        ? Number(product.pricePerCarton) 
        : Number(product.unitPrice),
      stock: product.inventory ? Number(product.inventory.quantity) : 0,
      warehouse: product.warehouse.name,
    });
  } catch (error) {
    console.error('خطا در ایجاد محصول:', error);
    res.status(500).json({ message: 'خطای سرور در ایجاد محصول' });
  }
});

// 🔥 PUT /api/products/:id - با productCode
app.put('/api/products/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      productCode,  // 🔥 اضافه شد
      barcode, 
      unitPrice, 
      costPrice, 
      minStock, 
      stock, 
      cartonSize, 
      unitType 
    } = req.body;

    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'شناسه محصول نامعتبر است' });
    }

    const existing = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });
    if (!existing) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }

    // بررسی یکتا بودن productCode (اگر تغییر کرده باشد)
    if (productCode && productCode !== existing.productCode) {
      const duplicate = await prisma.product.findUnique({
        where: { productCode },
      });
      if (duplicate) {
        return res.status(400).json({ message: 'این کد کالا قبلاً ثبت شده است' });
      }
    }

    let updatedBy = 1;
    if (req.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (userExists) updatedBy = req.user.id;
    }

    // 🔥 محاسبه قیمت نهایی برای کارتن‌ها
    let finalUnitPrice = unitPrice !== undefined ? Number(unitPrice) : existing.unitPrice;
    let finalCartonPrice = null;
    const finalUnitType = unitType || existing.unitType;
    const finalCartonSize = cartonSize !== undefined ? Number(cartonSize) : existing.cartonSize;
    
    if (finalUnitType === 'carton' && finalCartonSize) {
      finalCartonPrice = Number(finalUnitPrice) * finalCartonSize;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name?.trim() || existing.name,
        productCode: productCode || null, // 🔥 اضافه شد
        barcode: barcode || null,
        unitPrice: finalUnitPrice,
        costPrice: costPrice !== undefined ? Number(costPrice) : existing.costPrice,
        minStock: minStock !== undefined ? Number(minStock) : existing.minStock,
        cartonSize: finalCartonSize,
        unitType: finalUnitType,
        pricePerCarton: finalCartonPrice, // 🔥 اضافه شد
      },
      include: {
        warehouse: true,
        inventory: true,
      },
    });

    // به‌روزرسانی موجودی
    if (stock !== undefined && stock !== null) {
      const existingInventory = await prisma.inventory.findUnique({
        where: { productId: productId },
      });

      if (existingInventory) {
        await prisma.inventory.update({
          where: { productId: productId },
          data: {
            quantity: Number(stock),
            updatedBy: updatedBy,
          },
        });

        await prisma.inventoryLog.create({
          data: {
            productId: productId,
            warehouseId: existing.warehouseId,
            changeType: 'add',
            quantity: Number(stock),
            reason: 'adjustment',
            createdBy: updatedBy,
          },
        });
      } else {
        await prisma.inventory.create({
          data: {
            productId: productId,
            warehouseId: existing.warehouseId,
            quantity: Number(stock),
            updatedBy: updatedBy,
          },
        });
      }
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        warehouse: true,
        inventory: true,
      },
    });

    res.json({
      id: updatedProduct.id,
      name: updatedProduct.name,
      productCode: updatedProduct.productCode, // 🔥 اضافه شد
      barcode: updatedProduct.barcode,
      unitType: updatedProduct.unitType,
      cartonSize: updatedProduct.cartonSize,
      unitPrice: Number(updatedProduct.unitPrice),
      costPrice: Number(updatedProduct.costPrice),
      pricePerCarton: updatedProduct.pricePerCarton ? Number(updatedProduct.pricePerCarton) : null, // 🔥 اضافه شد
      cartonPrice: updatedProduct.unitType === 'carton' && updatedProduct.pricePerCarton 
        ? Number(updatedProduct.pricePerCarton) 
        : Number(updatedProduct.unitPrice),
      stock: updatedProduct.inventory ? Number(updatedProduct.inventory.quantity) : 0,
      warehouse: updatedProduct.warehouse.name,
    });
  } catch (error: any) {
    console.error('❌ خطا در ویرایش محصول:', error);
    res.status(500).json({ message: 'خطای سرور در ویرایش محصول' });
  }
});

// 🔥 DELETE /api/products/:id
app.delete('/api/products/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'شناسه محصول نامعتبر است' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }

    const hasActiveInvoices = await prisma.invoiceItem.findFirst({
      where: {
        productId: productId,
        invoice: {
          status: { in: ['final', 'paid'] },
        },
      },
    });

    if (hasActiveInvoices) {
      return res.status(400).json({
        message: 'این محصول در فاکتورهای نهایی استفاده شده و قابل حذف نیست',
      });
    }

    await prisma.inventoryLog.deleteMany({
      where: { productId: productId },
    });

    const inventory = await prisma.inventory.findUnique({
      where: { productId: productId },
    });

    if (inventory) {
      await prisma.inventory.delete({
        where: { id: inventory.id },
      });
    }

    await prisma.invoiceItem.deleteMany({
      where: {
        productId: productId,
        invoice: { status: 'draft' },
      },
    });

    await prisma.product.delete({
      where: { id: productId },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('❌ خطا در حذف محصول:', error);
    res.status(500).json({ message: 'خطای سرور در حذف محصول' });
  }
});

// ============================================
// 📌 CUSTOMERS ROUTES
// ============================================

app.get('/api/customers', async (req, res) => {
  try {
    console.log('🔍 دریافت مشتریان...');
    const { search } = req.query;
    const where = search
      ? {
          OR: [
            { name: { contains: search as string } },
            { phone: { contains: search as string } },
            { nationalId: { contains: search as string } },
          ],
        }
      : {};

    const customers = await prisma.customer.findMany({
      where,
      take: 100,
      orderBy: { totalPurchases: 'desc' },
    });

    console.log(`✅ ${customers.length} مشتری پیدا شد`);
    res.json({
      data: customers.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        nationalId: c.nationalId || '',
        address: c.address || '',
        totalPurchases: Number(c.totalPurchases),
        lastPurchaseDate: c.lastPurchaseDate,
      })),
    });
  } catch (error) {
    console.error('❌ خطا در دریافت مشتریان:', error);
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
});

app.get('/api/customers/suggest', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json([]);
    }

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      take: 10,
      orderBy: { totalPurchases: 'desc' },
    });

    res.json(customers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone || '',
      nationalId: c.nationalId || '',
      address: c.address || '',
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

app.post('/api/customers', auth, async (req, res) => {
  try {
    console.log('📝 درخواست ایجاد مشتری دریافت شد');
    const { name, phone, nationalId, address } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'نام مشتری الزامی است (حداقل ۲ کاراکتر)' });
    }

    let salesUserId = 1;
    if (req.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (userExists) salesUserId = req.user.id;
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone || null,
        nationalId: nationalId || null,
        address: address || null,
        salesUserId: salesUserId,
      },
    });

    console.log('✅ مشتری ایجاد شد:', customer);

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
    });

    for (const admin of admins) {
      await createNotification(
        admin.id,
        'info',
        'مشتری جدید ثبت شد',
        `مشتری ${customer.name} با موفقیت ثبت شد`,
        '/customers'
      );
    }

    res.status(201).json({
      id: customer.id,
      name: customer.name,
      phone: customer.phone || '',
      nationalId: customer.nationalId || '',
      address: customer.address || '',
      totalPurchases: Number(customer.totalPurchases),
      lastPurchaseDate: customer.lastPurchaseDate,
    });
  } catch (error: any) {
    console.error('❌ خطا در ایجاد مشتری:', error);
    res.status(500).json({ message: 'خطای سرور در ایجاد مشتری' });
  }
});

app.put('/api/customers/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, nationalId, address } = req.body;

    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: 'شناسه مشتری نامعتبر است' });
    }

    const existing = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'مشتری یافت نشد' });
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: name?.trim() || existing.name,
        phone: phone || null,
        nationalId: nationalId || null,
        address: address || null,
      },
    });

    res.json({
      id: customer.id,
      name: customer.name,
      phone: customer.phone || '',
      nationalId: customer.nationalId || '',
      address: customer.address || '',
      totalPurchases: Number(customer.totalPurchases),
      lastPurchaseDate: customer.lastPurchaseDate,
    });
  } catch (error) {
    console.error('خطا در ویرایش مشتری:', error);
    res.status(500).json({ message: 'خطای سرور در ویرایش مشتری' });
  }
});

app.delete('/api/customers/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: 'شناسه مشتری نامعتبر است' });
    }

    const existing = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'مشتری یافت نشد' });
    }

    const hasInvoices = await prisma.invoice.findFirst({
      where: { customerId: customerId },
    });

    if (hasInvoices) {
      return res.status(400).json({
        message: 'این مشتری دارای فاکتور است و قابل حذف نیست',
      });
    }

    await prisma.customer.delete({
      where: { id: customerId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('خطا در حذف مشتری:', error);
    res.status(500).json({ message: 'خطای سرور در حذف مشتری' });
  }
});

// ============================================
// 📌 INVOICES ROUTES
// ============================================

const invoiceItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  discountType: z.enum(['percentage', 'fixed']).default('fixed'),
  discountValue: z.number().min(0).default(0),
});

const invoiceSchema = z.object({
  customerId: z.number().int().positive(),
  items: z.array(invoiceItemSchema).min(1),
});

app.get('/api/invoices', auth, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        salesUser: {
          select: { 
            id: true, 
            fullName: true,
            role: true  // 🔥 این خط رو اضافه کن
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      data: invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customer: inv.customer,
        salesUser: {
          id: inv.salesUser?.id,
          fullName: inv.salesUser?.fullName,
          role: inv.salesUser?.role || 'sales', // 🔥 این خط رو اضافه کن
        },
        totalAmount: Number(inv.totalAmount),
        totalDiscount: Number(inv.totalDiscount),
        finalAmount: Number(inv.finalAmount),
        status: inv.status,
        createdAt: inv.createdAt,
        items: inv.items.map(item => ({
          id: item.id,
          product: item.product,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discountType: item.discountType,
          discountValue: Number(item.discountValue),
          discountPercentage: Number(item.discountPercentage),
          finalPrice: Number(item.finalPrice),
        })),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

app.get('/api/invoices/next-number', auth, async (req, res) => {
  try {
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { id: 'desc' },
    });
    const nextNumber = lastInvoice ? lastInvoice.id + 1 : 1;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;
    res.json({ invoiceNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

app.get('/api/invoices/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(id);
    if (isNaN(invoiceId)) {
      return res.status(400).json({ message: 'شناسه فاکتور نامعتبر است' });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        salesUser: {
          select: { id: true, fullName: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'فاکتور یافت نشد' });
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

app.post('/api/invoices', auth, async (req, res) => {
  try {
    console.log('📝 ایجاد فاکتور...');
    console.log('📋 داده:', JSON.stringify(req.body, null, 2));
    console.log('👤 کاربر:', req.user);

    const data = invoiceSchema.parse(req.body);

    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      return res.status(400).json({ message: 'مشتری یافت نشد' });
    }
    console.log('✅ مشتری پیدا شد:', customer.name);

    let salesUserId = 1;

    if (req.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (userExists) {
        salesUserId = req.user.id;
        console.log('✅ استفاده از salesUserId:', salesUserId);
      } else {
        console.log('⚠️ کاربر با ID', req.user.id, 'وجود ندارد، استفاده از پیش‌فرض 1');
      }
    } else {
      console.log('⚠️ req.user.id وجود ندارد، استفاده از پیش‌فرض 1');
    }

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return res.status(400).json({ 
          message: `محصول با ID ${item.productId} یافت نشد` 
        });
      }
      console.log(`✅ محصول پیدا شد: ${product.name}`);
    }

    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { id: 'desc' },
    });
    const nextNumber = lastInvoice ? lastInvoice.id + 1 : 1;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;

    let totalAmount = 0;
    let totalDiscount = 0;
    const itemsWithPrice = data.items.map((item) => {
      const itemTotal = item.quantity * item.unitPrice;
      let discountValue = item.discountValue;
      let discountPercentage = 0;
      let finalPrice = itemTotal;

      if (item.discountType === 'percentage') {
        discountPercentage = Math.min(100, Math.max(0, item.discountValue));
        discountValue = (itemTotal * discountPercentage) / 100;
        finalPrice = itemTotal - discountValue;
      } else {
        discountValue = Math.min(item.discountValue, itemTotal);
        discountPercentage = itemTotal > 0 ? (discountValue / itemTotal) * 100 : 0;
        finalPrice = itemTotal - discountValue;
      }

      totalAmount += itemTotal;
      totalDiscount += discountValue;

      return {
        ...item,
        discountValue,
        discountPercentage,
        finalPrice,
      };
    });

    const finalAmount = totalAmount - totalDiscount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: data.customerId,
        salesUserId: salesUserId,
        totalAmount,
        totalDiscount,
        finalAmount,
        status: 'draft',
        items: {
          create: itemsWithPrice.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountType: item.discountType,
            discountValue: item.discountValue,
            discountPercentage: item.discountPercentage,
            finalPrice: item.finalPrice,
          })),
        },
      },
      include: {
        customer: true,
        salesUser: {
          select: { id: true, fullName: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log('✅ فاکتور ایجاد شد:', invoice.invoiceNumber);
    res.status(201).json(invoice);
  } catch (error: any) {
    console.error('❌ خطا در ایجاد فاکتور:');
    console.error('📋 پیام:', error.message);
    console.error('📋 نام:', error.name);
    console.error('📋 کد:', error.code);
    console.error('📋 Stack:', error.stack);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ 
      message: 'خطای سرور در ایجاد فاکتور',
      error: error.message 
    });
  }
});

app.put('/api/invoices/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(id);
    if (isNaN(invoiceId)) {
      return res.status(400).json({ message: 'شناسه فاکتور نامعتبر است' });
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!existingInvoice) {
      return res.status(404).json({ message: 'فاکتور یافت نشد' });
    }

    if (existingInvoice.status !== 'draft') {
      return res.status(400).json({ message: 'فقط فاکتورهای پیش‌نویس قابل ویرایش هستند' });
    }

    if (req.user.role !== 'admin' && req.user.id !== existingInvoice.salesUserId) {
      return res.status(403).json({ message: 'شما اجازه ویرایش این فاکتور را ندارید' });
    }

    const data = invoiceSchema.parse(req.body);

    let totalAmount = 0;
    let totalDiscount = 0;
    const itemsWithPrice = data.items.map((item) => {
      const itemTotal = item.quantity * item.unitPrice;
      let discountValue = item.discountValue;
      let discountPercentage = 0;
      let finalPrice = itemTotal;

      if (item.discountType === 'percentage') {
        discountPercentage = Math.min(100, Math.max(0, item.discountValue));
        discountValue = (itemTotal * discountPercentage) / 100;
        finalPrice = itemTotal - discountValue;
      } else {
        discountValue = Math.min(item.discountValue, itemTotal);
        discountPercentage = itemTotal > 0 ? (discountValue / itemTotal) * 100 : 0;
        finalPrice = itemTotal - discountValue;
      }

      totalAmount += itemTotal;
      totalDiscount += discountValue;

      return {
        ...item,
        discountValue,
        discountPercentage,
        finalPrice,
      };
    });

    const finalAmount = totalAmount - totalDiscount;

    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: invoiceId },
    });

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        customerId: data.customerId,
        totalAmount,
        totalDiscount,
        finalAmount,
        items: {
          create: itemsWithPrice.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountType: item.discountType,
            discountValue: item.discountValue,
            discountPercentage: item.discountPercentage,
            finalPrice: item.finalPrice,
          })),
        },
      },
      include: {
        customer: true,
        salesUser: {
          select: { id: true, fullName: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(updatedInvoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(e => e.message) });
    }
    console.error('خطا در ویرایش فاکتور:', error);
    res.status(500).json({ message: 'خطای سرور در ویرایش فاکتور' });
  }
});

app.post('/api/invoices/:id/finalize', auth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(id);
    if (isNaN(invoiceId)) {
      return res.status(400).json({ message: 'شناسه فاکتور نامعتبر است' });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'فاکتور یافت نشد' });
    }

    if (invoice.status === 'final' || invoice.status === 'paid') {
      return res.status(400).json({ message: 'فاکتور قبلاً نهایی شده است' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'sales_admin') {
      return res.status(403).json({ message: 'فقط ادمین یا فروش(ادمین) می‌تواند فاکتور را نهایی کند' });
    }

    let updatedBy = 1;
    if (req.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (userExists) updatedBy = req.user.id;
    }

    const warnings: string[] = [];
    const errors: string[] = [];

    for (const item of invoice.items) {
      console.log(`🔍 بررسی موجودی برای محصول: ${item.product.name}`);
      
      const inventory = await prisma.inventory.findUnique({
        where: { productId: item.productId },
      });

      if (!inventory) {
        console.error(`❌ موجودی محصول ${item.product.name} یافت نشد`);
        errors.push(`موجودی محصول ${item.product.name} یافت نشد`);
        continue;
      }

      const newQuantity = inventory.quantity - item.quantity;
      
      if (inventory.quantity < item.quantity) {
        const shortage = (item.quantity - inventory.quantity);
        warnings.push(
          `⚠️ موجودی کافی برای محصول "${item.product.name}" وجود ندارد. ` +
          `موجودی فعلی: ${inventory.quantity}، نیاز: ${item.quantity}، کمبود: ${shortage}`
        );
        console.warn(`⚠️ کمبود موجودی برای ${item.product.name}: ${shortage}`);
      }

      await prisma.inventory.update({
        where: { productId: item.productId },
        data: {
          quantity: newQuantity,
          updatedBy: updatedBy,
        },
      });

      await prisma.inventoryLog.create({
        data: {
          productId: item.productId,
          warehouseId: item.product.warehouseId,
          changeType: 'subtract',
          quantity: item.quantity,
          reason: 'sale',
          referenceInvoiceId: invoice.id,
          createdBy: updatedBy,
        },
      });
      
      console.log(`✅ موجودی محصول ${item.product.name} به‌روزرسانی شد (موجودی جدید: ${newQuantity})`);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'خطا در نهایی‌سازی فاکتور',
        errors: errors,
        warnings: warnings,
      });
    }

    await prisma.customer.update({
      where: { id: invoice.customerId },
      data: {
        totalPurchases: invoice.customer.totalPurchases + invoice.finalAmount,
        lastPurchaseDate: new Date(),
      },
    });

    const remainingDebt = invoice.finalAmount - (invoice.totalPaid || 0);
    const isSettled = remainingDebt <= 0;

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { 
        status: 'final',
        remainingDebt: remainingDebt > 0 ? remainingDebt : 0,
        isSettled: isSettled
      },
      include: {
        customer: true,
        salesUser: {
          select: { id: true, fullName: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(`✅ فاکتور ${invoice.invoiceNumber} نهایی شد`);

    if (warnings.length > 0) {
      const admins = await prisma.user.findMany({
        where: { role: 'admin' },
      });

      for (const admin of admins) {
        await createNotification(
          admin.id,
          'warning',
          '⚠️ کمبود موجودی در فاکتور',
          `فاکتور ${invoice.invoiceNumber}: ${warnings.length} محصول با کمبود موجودی مواجه شد.`,
          `/invoices/${invoice.id}`
        );
      }

      await createNotification(
        invoice.salesUserId,
        'warning',
        '⚠️ کمبود موجودی در فاکتور شما',
        `فاکتور ${invoice.invoiceNumber}: لطفاً موجودی محصولات را بررسی کنید.`,
        `/invoices/${invoice.id}`
      );
    }

    await createNotification(
      invoice.salesUserId,
      'info',
      'فاکتور نهایی شد',
      `فاکتور ${invoice.invoiceNumber} توسط ${req.user.fullName} نهایی شد`,
      `/invoices/${invoice.id}`
    );

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
    });

    for (const admin of admins) {
      if (admin.id !== invoice.salesUserId) {
        await createNotification(
          admin.id,
          'info',
          'فاکتور نهایی شد',
          `فاکتور ${invoice.invoiceNumber} توسط ${req.user.fullName} نهایی شد`,
          `/invoices/${invoice.id}`
        );
      }
    }

    res.json({
      ...updated,
      warnings: warnings,
      hasWarnings: warnings.length > 0,
      message: warnings.length > 0 
        ? `فاکتور نهایی شد اما ${warnings.length} هشدار وجود دارد. لطفاً موجودی را بررسی کنید.`
        : 'فاکتور با موفقیت نهایی شد'
    });
  } catch (error: any) {
    console.error('❌ خطا در نهایی‌سازی فاکتور:');
    console.error('📋 پیام:', error.message);
    console.error('📋 نام:', error.name);
    console.error('📋 کد:', error.code);
    console.error('📋 Stack:', error.stack);
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: 'خطا در ارتباط با کاربر. لطفاً دوباره وارد شوید.',
        code: error.code,
      });
    }
    
    res.status(500).json({
      message: 'خطای سرور در نهایی‌سازی فاکتور',
      error: error.message,
      code: error.code,
    });
  }
});

app.delete('/api/invoices/:id', auth, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const invoiceId = parseInt(id);
    if (isNaN(invoiceId)) {
      return res.status(400).json({ message: 'شناسه فاکتور نامعتبر است' });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'فاکتور یافت نشد' });
    }

    if (req.user.role !== 'admin' && req.user.id !== invoice.salesUserId) {
      return res.status(403).json({ message: 'شما اجازه حذف این فاکتور را ندارید' });
    }

    console.log(`🗑️ شروع حذف فاکتور ${invoice.invoiceNumber}...`);

    await prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.deleteMany({
        where: { invoiceId: invoiceId },
      });

      await tx.invoiceItem.deleteMany({
        where: { invoiceId: invoiceId },
      });

      await tx.invoice.delete({
        where: { id: invoiceId },
      });
    });

    console.log(`✅ فاکتور ${invoice.invoiceNumber} با موفقیت حذف شد`);

    await createNotification(
      req.user.id,
      'info',
      'فاکتور حذف شد',
      `فاکتور ${invoice.invoiceNumber} توسط ${req.user.fullName} حذف شد`,
      `/invoices`
    );

    res.status(204).send();
  } catch (error: any) {
    console.error('❌ خطا در حذف فاکتور:', error);
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: '❌ این فاکتور دارای وابستگی‌های سیستمی است و قابل حذف نمی‌باشد.',
        code: error.code,
      });
    }

    res.status(500).json({
      message: 'خطای سرور در حذف فاکتور',
      error: error.message,
    });
  }
});

// ============================================
// 📌 USERS ROUTES
// ============================================

app.get('/api/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'sales_admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error('خطا در دریافت کاربران:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

const createUserSchema = z.object({
  fullName: z.string().min(2, 'نام حداقل ۲ کاراکتر باشد'),
  phone: z.string().min(10, 'شماره تلفن حداقل ۱۰ رقم باشد'),
  password: z.string().min(4, 'رمز عبور حداقل ۴ کاراکتر باشد'),
  role: z.enum(['admin', 'sales', 'warehouse', 'sales_admin']),
  isActive: z.boolean().default(true),
});

app.post('/api/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const data = createUserSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { phone: data.phone },
    });
    if (existing) {
      return res.status(400).json({ message: 'این شماره تلفن قبلاً ثبت شده است' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        passwordHash: hashedPassword,
        role: data.role,
        isActive: data.isActive,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
    });

    for (const admin of admins) {
      await createNotification(
        admin.id,
        'info',
        'کاربر جدید ثبت شد',
        `کاربر ${user.fullName} با نقش ${user.role} ثبت شد`,
        `/users`
      );
    }

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(e => e.message) });
    }
    console.error('خطا در ایجاد کاربر:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

const updateUserSchema = z.object({
  fullName: z.string().min(2, 'نام حداقل ۲ کاراکتر باشد').optional(),
  role: z.enum(['admin', 'sales', 'warehouse', 'sales_admin']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(4, 'رمز عبور حداقل ۴ کاراکتر باشد').optional(),
});

app.put('/api/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'شناسه کاربر نامعتبر است' });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!currentUser) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    if (req.user.id === userId && data.role) {
      return res.status(400).json({ message: 'نمی‌توانید نقش خودتان را تغییر دهید' });
    }

    if (req.user.id === userId && data.isActive === false) {
      return res.status(400).json({ message: 'نمی‌توانید خودتان را غیرفعال کنید' });
    }

    const updateData: any = {};
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.role) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(e => e.message) });
    }
    console.error('خطا در ویرایش کاربر:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

app.delete('/api/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const { id } = req.params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'شناسه کاربر نامعتبر است' });
    }

    if (req.user.id === userId) {
      return res.status(400).json({ message: 'نمی‌توانید خودتان را حذف کنید' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    const adminCount = await prisma.user.count({
      where: { role: 'admin' },
    });

    if (targetUser.role === 'admin' && adminCount <= 1) {
      return res.status(400).json({ message: 'نمی‌توانید آخرین ادمین را حذف کنید' });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('خطا در حذف کاربر:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// ============================================
// 📌 NOTIFICATIONS ROUTES
// ============================================

app.get('/api/notifications', auth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(notifications);
  } catch (error) {
    console.error('خطا در دریافت نوتیفیکیشن‌ها:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

app.get('/api/notifications/stats', auth, async (req, res) => {
  try {
    const [total, unread, danger, warning, info, success] = await Promise.all([
      prisma.notification.count({ where: { userId: req.user.id } }),
      prisma.notification.count({ where: { userId: req.user.id, read: false } }),
      prisma.notification.count({ where: { userId: req.user.id, type: 'danger' } }),
      prisma.notification.count({ where: { userId: req.user.id, type: 'warning' } }),
      prisma.notification.count({ where: { userId: req.user.id, type: 'info' } }),
      prisma.notification.count({ where: { userId: req.user.id, type: 'success' } }),
    ]);

    res.json({ total, unread, danger, warning, info, success });
  } catch (error) {
    console.error('خطا در دریافت آمار:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

app.patch('/api/notifications/:id/read', auth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('خطا:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

app.patch('/api/notifications/read-all', auth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('خطا:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

app.delete('/api/notifications/:id', auth, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('خطا:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// ============================================
// 📌 SALES INVOICES ROUTES
// ============================================

app.get('/api/invoices/sales/:userId', auth, async (req, res) => {
  try {
    const salesUserId = parseInt(req.params.userId);
    if (isNaN(salesUserId)) {
      return res.status(400).json({ message: 'شناسه فروشنده نامعتبر است' });
    }

    if (req.user.role !== 'admin' && req.user.id !== salesUserId) {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const invoices = await prisma.invoice.findMany({
      where: { salesUserId },
      include: {
        customer: true,
        salesUser: {
          select: { id: true, fullName: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      data: invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customer: inv.customer,
        salesUser: inv.salesUser,
        totalAmount: Number(inv.totalAmount),
        totalDiscount: Number(inv.totalDiscount),
        finalAmount: Number(inv.finalAmount),
        status: inv.status,
        createdAt: inv.createdAt,
        items: inv.items.map(item => ({
          id: item.id,
          product: item.product,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discountType: item.discountType,
          discountValue: Number(item.discountValue),
          discountPercentage: Number(item.discountPercentage),
          finalPrice: Number(item.finalPrice),
        })),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

app.get('/api/invoices/sales-stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const salesUsers = await prisma.user.findMany({
      where: { role: 'sales' },
      select: {
        id: true,
        fullName: true,
        phone: true,
        invoices: {
          select: {
            finalAmount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (salesUsers.length === 0) {
      return res.json([]);
    }

    const stats = salesUsers.map(user => {
      const totalSales = user.invoices.reduce((sum, inv) => {
        return sum + (inv.status === 'final' || inv.status === 'paid' ? Number(inv.finalAmount) : 0);
      }, 0);

      const totalInvoices = user.invoices.filter(inv => inv.status === 'final' || inv.status === 'paid').length;
      const todayInvoices = user.invoices.filter(inv => {
        const today = new Date().toDateString();
        return (inv.status === 'final' || inv.status === 'paid') && new Date(inv.createdAt).toDateString() === today;
      }).length;

      return {
        userId: user.id,
        fullName: user.fullName,
        phone: user.phone,
        totalSales: Math.round(totalSales / 10),
        totalInvoices,
        todayInvoices,
      };
    });

    res.json(stats);
  } catch (error) {
    console.error('خطا در sales-stats:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// ============================================
// 📌 INVENTORY ROUTES
// ============================================

app.get('/api/inventory', auth, async (req, res) => {
  try {
    console.log('🔍 دریافت لیست موجودی...');
    
    const inventory = await prisma.inventory.findMany({
      include: {
        product: {
          include: {
            warehouse: true,
          },
        },
        updatedByUser: {
          select: { id: true, fullName: true },
        },
      },
    });

    console.log(`✅ ${inventory.length} آیتم موجودی پیدا شد`);
    res.json(inventory);
  } catch (error) {
    console.error('❌ خطا در دریافت موجودی:', error);
    res.status(500).json({ 
      message: 'خطای سرور در دریافت موجودی',
      error: error.message 
    });
  }
});

app.get('/api/inventory/low-stock', auth, async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      where: {
        quantity: {
          lt: 10,
        },
      },
      include: {
        product: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: { quantity: 'asc' },
      take: 10,
    });

    res.json(inventory);
  } catch (error) {
    console.error('خطا در دریافت محصولات کم‌موجود:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

app.post('/api/inventory/add', auth, async (req, res) => {
  try {
    if (req.user.role !== 'warehouse' && req.user.role !== 'admin' && req.user.role !== 'sales_admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'اطلاعات نامعتبر است' });
    }

    let updatedBy = 1;
    if (req.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (userExists) updatedBy = req.user.id;
    }

    const existing = await prisma.inventory.findUnique({
      where: { productId: Number(productId) },
    });

    let inventory;
    if (existing) {
      inventory = await prisma.inventory.update({
        where: { productId: Number(productId) },
        data: {
          quantity: existing.quantity + Number(quantity),
          updatedBy: updatedBy,
        },
        include: {
          product: true,
        },
      });
    } else {
      const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
      });
      if (!product) {
        return res.status(404).json({ message: 'محصول یافت نشد' });
      }

      inventory = await prisma.inventory.create({
        data: {
          productId: Number(productId),
          warehouseId: product.warehouseId,
          quantity: Number(quantity),
          updatedBy: updatedBy,
        },
        include: {
          product: true,
        },
      });
    }

    await prisma.inventoryLog.create({
      data: {
        productId: Number(productId),
        warehouseId: inventory.product.warehouseId,
        changeType: 'add',
        quantity: Number(quantity),
        reason: reason || 'adjustment',
        createdBy: updatedBy,
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
    });

    for (const admin of admins) {
      await createNotification(
        admin.id,
        'info',
        'موجودی اضافه شد',
        `${quantity} عدد به موجودی ${inventory.product.name} اضافه شد`,
        '/products'
      );
    }

    res.json(inventory);
  } catch (error) {
    console.error('خطا در اضافه کردن موجودی:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// ============================================
// 📌 PAYMENT TRANSACTIONS ROUTES
// ============================================

// 1. دریافت مشتریان با بدهی
app.get('/api/customers/with-debt', auth, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    console.log('🔍 دریافت مشتریان با بدهی...');

    const customers = await prisma.customer.findMany({
      include: {
        invoices: {
          where: {
            status: { in: ['final', 'paid'] },
            isSettled: false
          },
          select: {
            id: true,
            invoiceNumber: true,
            finalAmount: true,
            totalPaid: true,
            remainingDebt: true,
            createdAt: true,
            salesUser: {
              select: { fullName: true }
            }
          }
        }
      }
    });

    const result = customers
      .filter(c => c.invoices.some(inv => inv.remainingDebt > 0))
      .map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        totalDebt: c.invoices.reduce((sum, inv) => sum + inv.remainingDebt, 0),
        invoices: c.invoices.filter(inv => inv.remainingDebt > 0)
      }))
      .sort((a, b) => b.totalDebt - a.totalDebt);

    console.log(`✅ ${result.length} مشتری با بدهی پیدا شد`);
    res.json(result);
  } catch (error) {
    console.error('❌ خطا:', error);
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
});

// 2. دریافت بدهی یک مشتری
app.get('/api/customers/:id/debt', auth, async (req: any, res: any) => {
  try {
    const customerId = parseInt(req.params.id);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: 'شناسه مشتری نامعتبر است' });
    }

    const result = await prisma.invoice.aggregate({
      where: {
        customerId,
        isSettled: false,
        status: { in: ['final', 'paid'] }
      },
      _sum: {
        remainingDebt: true
      }
    });

    res.json({
      customerId,
      totalDebt: result._sum.remainingDebt || 0
    });
  } catch (error) {
    console.error('خطا:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// 3. دریافت تراکنش‌های یک مشتری
app.get('/api/customers/:id/payments', auth, async (req: any, res: any) => {
  try {
    const customerId = parseInt(req.params.id);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: 'شناسه مشتری نامعتبر است' });
    }

    const payments = await prisma.paymentTransaction.findMany({
      where: { customerId },
      include: {
        invoice: {
          select: { invoiceNumber: true, finalAmount: true }
        },
        user: {
          select: { fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    console.error('خطا:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// 4. دریافت همه تراکنش‌ها
app.get('/api/payments', auth, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const { customerId, startDate, endDate, paymentType } = req.query;
    
    const where: any = {};
    if (customerId) where.customerId = Number(customerId);
    if (paymentType) where.paymentType = paymentType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const payments = await prisma.paymentTransaction.findMany({
      where,
      include: {
        customer: true,
        invoice: {
          select: { invoiceNumber: true, finalAmount: true }
        },
        user: {
          select: { fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json(payments);
  } catch (error) {
    console.error('خطا:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// 5. ثبت پرداخت جدید
app.post('/api/payments', auth, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const { invoiceId, amount, paymentType, description } = req.body;

    if (!invoiceId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'اطلاعات نامعتبر است' });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'فاکتور یافت نشد' });
    }

    if (invoice.status === 'draft') {
      return res.status(400).json({ message: 'فاکتور پیش‌نویس قابل تسویه نیست' });
    }

    if (invoice.isSettled) {
      return res.status(400).json({ message: 'این فاکتور قبلاً تسویه شده است' });
    }

    const remainingDebt = invoice.remainingDebt || (invoice.finalAmount - invoice.totalPaid);
    if (amount > remainingDebt) {
      return res.status(400).json({ 
        message: `مبلغ پرداختی (${amount.toLocaleString('fa-IR')}) بیشتر از بدهی باقیمانده (${remainingDebt.toLocaleString('fa-IR')}) است` 
      });
    }

    const payment = await prisma.paymentTransaction.create({
      data: {
        invoiceId,
        customerId: invoice.customerId,
        amount,
        paymentType: paymentType || 'cash',
        description,
        createdBy: req.user.id
      }
    });

    const newTotalPaid = invoice.totalPaid + amount;
    const newRemainingDebt = invoice.finalAmount - newTotalPaid;
    const isSettled = newRemainingDebt <= 0;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        totalPaid: newTotalPaid,
        remainingDebt: newRemainingDebt,
        isSettled,
        status: isSettled ? 'settled' : invoice.status
      }
    });

    await createNotification(
      req.user.id,
      'success',
      'پرداخت جدید ثبت شد',
      `مبلغ ${amount.toLocaleString('fa-IR')} برای فاکتور ${invoice.invoiceNumber} ثبت شد`,
      `/payment-history`
    );

    res.status(201).json({
      payment,
      invoice: {
        ...invoice,
        totalPaid: newTotalPaid,
        remainingDebt: newRemainingDebt,
        isSettled
      }
    });
  } catch (error) {
    console.error('❌ خطا:', error);
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
});

// ============================================
// 📌 دریافت محصولات با موجودی منفی
// ============================================
app.get('/api/inventory/negative-stock', auth, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const negativeStock = await prisma.inventory.findMany({
      where: {
        quantity: {
          lt: 0
        }
      },
      include: {
        product: {
          include: {
            warehouse: true
          }
        },
        updatedByUser: {
          select: { fullName: true }
        }
      },
      orderBy: { quantity: 'asc' }
    });

    res.json(negativeStock);
  } catch (error) {
    console.error('❌ خطا در دریافت موجودی منفی:', error);
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
});

// ============================================
// 📌 کسر موجودی (Subtract Stock)
// ============================================
app.post('/api/inventory/subtract', auth, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'warehouse' && req.user.role !== 'admin' && req.user.role !== 'sales_admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }

    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'اطلاعات نامعتبر است' });
    }

    let updatedBy = 1;
    if (req.user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (userExists) updatedBy = req.user.id;
    }

    const existing = await prisma.inventory.findUnique({
      where: { productId: Number(productId) },
      include: { product: true },
    });

    if (!existing) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }

    if (existing.quantity < quantity) {
      return res.status(400).json({
        message: `موجودی کافی نیست. موجودی فعلی: ${existing.quantity}، درخواست: ${quantity}`,
        currentStock: existing.quantity,
      });
    }

    const inventory = await prisma.inventory.update({
      where: { productId: Number(productId) },
      data: {
        quantity: existing.quantity - Number(quantity),
        updatedBy: updatedBy,
      },
      include: {
        product: true,
      },
    });

    await prisma.inventoryLog.create({
      data: {
        productId: Number(productId),
        warehouseId: inventory.product.warehouseId,
        changeType: 'subtract',
        quantity: Number(quantity),
        reason: reason || 'adjustment',
        createdBy: updatedBy,
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
    });

    for (const admin of admins) {
      await createNotification(
        admin.id,
        'info',
        'موجودی کسر شد',
        `${quantity} عدد از موجودی ${inventory.product.name} کسر شد`,
        '/products'
      );
    }

    res.json({
      ...inventory,
      message: `${quantity} عدد از موجودی ${inventory.product.name} با موفقیت کسر شد`,
    });
  } catch (error) {
    console.error('خطا در کسر موجودی:', error);
    res.status(500).json({ message: 'خطای سرور', error: error.message });
  }
});

// ============================================
// 📌 SEED FUNCTIONS
// ============================================

async function seedAdmin() {
  const existing = await prisma.user.findUnique({
    where: { phone: '09121112233' },
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await prisma.user.create({
      data: {
        fullName: 'مدیر سیستم',
        phone: '09121112233',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
      },
    });
    console.log('✅ کاربر ادمین ساخته شد: 09121112233 / 123456');
  }
}

async function seedWarehouse() {
  const existing = await prisma.warehouse.findFirst();
  if (!existing) {
    await prisma.warehouse.create({
      data: {
        name: 'انبار مرکزی',
        address: 'تهران، خیابان اصلی',
      },
    });
    console.log('✅ انبار مرکزی ساخته شد');
  }
}

async function seedProducts() {
  const count = await prisma.product.count();
  if (count === 0) {
    const warehouse = await prisma.warehouse.findFirst();
    if (warehouse) {
      await prisma.product.createMany({
        data: [
          { 
            name: 'لپ‌تاپ ایسوس X515', 
            productCode: 'ASUS-X515', // 🔥 اضافه شد
            barcode: '6221031005001', 
            unitPrice: 28500000, 
            costPrice: 25000000, 
            warehouseId: warehouse.id, 
            minStock: 5 
          },
          { 
            name: 'کیبورد لاجیتک K380', 
            productCode: 'LOG-K380', // 🔥 اضافه شد
            barcode: '5099206088078', 
            unitPrice: 1800000, 
            costPrice: 1400000, 
            warehouseId: warehouse.id, 
            minStock: 10 
          },
          { 
            name: 'موس بی‌سیم HP', 
            productCode: 'HP-MOUSE', // 🔥 اضافه شد
            barcode: '0193808540327', 
            unitPrice: 950000, 
            costPrice: 700000, 
            warehouseId: warehouse.id, 
            minStock: 10 
          },
          { 
            name: 'مانیتور سامسونگ ۲۴', 
            productCode: 'SAMSUNG-24', // 🔥 اضافه شد
            barcode: '8806094803259', 
            unitPrice: 9200000, 
            costPrice: 7900000, 
            warehouseId: warehouse.id, 
            minStock: 3 
          },
          { 
            name: 'کابل HDMI ۲متری', 
            productCode: 'HDMI-2M', // 🔥 اضافه شد
            barcode: '6971536924331', 
            unitPrice: 250000, 
            costPrice: 150000, 
            warehouseId: warehouse.id, 
            minStock: 20 
          },
        ],
      });
      console.log('✅ محصولات نمونه ساخته شدند');
    }
  }
}

// ============================================
// 📌 MAIN
// ============================================

async function main() {
  try {
    await seedAdmin();
    await seedWarehouse();
    await seedProducts();
    await checkLowStock();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('📋 API endpoints:');
      console.log('   POST /api/auth/login');
      console.log('   GET  /api/products');
      console.log('   POST /api/products');
      console.log('   PUT  /api/products/:id');
      console.log('   DELETE /api/products/:id');
      console.log('   GET  /api/customers');
      console.log('   GET  /api/customers/suggest');
      console.log('   POST /api/customers');
      console.log('   PUT  /api/customers/:id');
      console.log('   DELETE /api/customers/:id');
      console.log('   GET  /api/invoices');
      console.log('   GET  /api/invoices/:id');
      console.log('   GET  /api/invoices/next-number');
      console.log('   POST /api/invoices');
      console.log('   PUT  /api/invoices/:id');
      console.log('   POST /api/invoices/:id/finalize');
      console.log('   DELETE /api/invoices/:id');
      console.log('   GET  /api/users');
      console.log('   POST /api/users');
      console.log('   PUT  /api/users/:id');
      console.log('   DELETE /api/users/:id');
      console.log('   GET  /api/inventory');
      console.log('   GET  /api/inventory/low-stock');
      console.log('   POST /api/inventory/add');
      console.log('   GET  /api/notifications');
      console.log('   GET  /api/notifications/stats');
      console.log('   PATCH /api/notifications/:id/read');
      console.log('   PATCH /api/notifications/read-all');
      console.log('   DELETE /api/notifications/:id');
      console.log('   GET  /api/invoices/sales/:userId');
      console.log('   GET  /api/invoices/sales-stats');
      console.log('   GET  /api/customers/with-debt');
      console.log('   GET  /api/customers/:id/debt');
      console.log('   GET  /api/customers/:id/payments');
      console.log('   GET  /api/payments');
      console.log('   POST /api/payments');
      console.log('   GET  /api/inventory/negative-stock');

    });
  } catch (error) {
    console.error('❌ خطا:', error);
    process.exit(1);
  }
}

main();