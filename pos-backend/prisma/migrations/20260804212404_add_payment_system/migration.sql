-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "payment_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_type" TEXT NOT NULL DEFAULT 'cash',
    "description" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payment_transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payment_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_invoices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_number" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "sales_user_id" INTEGER NOT NULL,
    "total_amount" REAL NOT NULL DEFAULT 0,
    "total_discount" REAL NOT NULL DEFAULT 0,
    "final_amount" REAL NOT NULL DEFAULT 0,
    "total_paid" REAL NOT NULL DEFAULT 0,
    "remaining_debt" REAL NOT NULL DEFAULT 0,
    "is_settled" BOOLEAN NOT NULL DEFAULT false,
    "previous_debt" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_sales_user_id_fkey" FOREIGN KEY ("sales_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_invoices" ("created_at", "customer_id", "final_amount", "id", "invoice_number", "sales_user_id", "status", "total_amount", "total_discount", "updated_at") SELECT "created_at", "customer_id", "final_amount", "id", "invoice_number", "sales_user_id", "status", "total_amount", "total_discount", "updated_at" FROM "invoices";
DROP TABLE "invoices";
ALTER TABLE "new_invoices" RENAME TO "invoices";
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
