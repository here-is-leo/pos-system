// src/update-invoices.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateOldInvoices() {
  try {
    console.log('🔄 شروع آپدیت فاکتورهای قدیمی...');

    // دریافت همه فاکتورها
    const invoices = await prisma.invoice.findMany({
      include: {
        items: true
      }
    });

    console.log(`📋 ${invoices.length} فاکتور پیدا شد`);

    let updatedCount = 0;
    for (const invoice of invoices) {
      // محاسبه remainingDebt
      let remainingDebt = 0;
      if (invoice.status === 'draft') {
        remainingDebt = invoice.finalAmount;
      } else if (invoice.status === 'final' || invoice.status === 'paid') {
        remainingDebt = invoice.finalAmount - (invoice.totalPaid || 0);
      } else {
        remainingDebt = 0;
      }

      // اگر remainingDebt منفی شد، صفر کن
      if (remainingDebt < 0) remainingDebt = 0;

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          totalPaid: invoice.totalPaid || 0,
          remainingDebt: remainingDebt,
          isSettled: remainingDebt <= 0 && invoice.status !== 'draft',
          previousDebt: invoice.previousDebt || 0
        }
      });
      updatedCount++;
    }

    console.log(`✅ ${updatedCount} فاکتور آپدیت شد`);
  } catch (error) {
    console.error('❌ خطا:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOldInvoices();