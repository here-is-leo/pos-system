/*
  Warnings:

  - You are about to drop the column `is_active` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `inventory_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `inventory_logs` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `discount_type` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `is_read` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `products` table. All the data in the column will be lost.
  - You are about to alter the column `min_stock` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to drop the column `is_active` on the `warehouses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[product_id]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `change_type` to the `inventory_logs` table without a default value. This is not possible if the table is not empty.
  - Made the column `reason` on table `inventory_logs` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `unit_price` to the `invoice_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "inventory_product_id_warehouse_id_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "national_id" TEXT,
    "total_purchases" REAL NOT NULL DEFAULT 0,
    "last_purchase_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sales_user_id" INTEGER,
    CONSTRAINT "customers_sales_user_id_fkey" FOREIGN KEY ("sales_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_customers" ("address", "created_at", "id", "last_purchase_date", "name", "national_id", "phone", "sales_user_id", "total_purchases") SELECT "address", "created_at", "id", "last_purchase_date", "name", "national_id", "phone", "sales_user_id", "total_purchases" FROM "customers";
DROP TABLE "customers";
ALTER TABLE "new_customers" RENAME TO "customers";
CREATE TABLE "new_inventory_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "product_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "change_type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "reference_invoice_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    CONSTRAINT "inventory_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_logs_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_inventory_logs" ("created_at", "id", "product_id", "quantity", "reason", "warehouse_id") SELECT "created_at", "id", "product_id", "quantity", "reason", "warehouse_id" FROM "inventory_logs";
DROP TABLE "inventory_logs";
ALTER TABLE "new_inventory_logs" RENAME TO "inventory_logs";
CREATE TABLE "new_invoice_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "unit_price" REAL NOT NULL,
    "discount_type" TEXT NOT NULL DEFAULT 'fixed',
    "discount_value" REAL NOT NULL DEFAULT 0,
    "discount_percentage" REAL NOT NULL DEFAULT 0,
    "final_price" REAL NOT NULL,
    CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invoice_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_invoice_items" ("discount_type", "final_price", "id", "invoice_id", "product_id", "quantity") SELECT "discount_type", "final_price", "id", "invoice_id", "product_id", "quantity" FROM "invoice_items";
DROP TABLE "invoice_items";
ALTER TABLE "new_invoice_items" RENAME TO "invoice_items";
CREATE TABLE "new_invoices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoice_number" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "sales_user_id" INTEGER NOT NULL,
    "total_amount" REAL NOT NULL DEFAULT 0,
    "total_discount" REAL NOT NULL DEFAULT 0,
    "final_amount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_sales_user_id_fkey" FOREIGN KEY ("sales_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_invoices" ("created_at", "customer_id", "final_amount", "id", "invoice_number", "sales_user_id", "status", "updated_at") SELECT "created_at", "customer_id", "final_amount", "id", "invoice_number", "sales_user_id", "status", "updated_at" FROM "invoices";
DROP TABLE "invoices";
ALTER TABLE "new_invoices" RENAME TO "invoices";
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
CREATE TABLE "new_notifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_notifications" ("created_at", "id", "link", "title", "type", "user_id") SELECT "created_at", "id", "link", "title", "type", "user_id" FROM "notifications";
DROP TABLE "notifications";
ALTER TABLE "new_notifications" RENAME TO "notifications";
CREATE TABLE "new_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "barcode" TEXT,
    "unit_type" TEXT NOT NULL DEFAULT 'single',
    "carton_size" INTEGER,
    "price_per_carton" REAL,
    "unit_price" REAL NOT NULL,
    "cost_price" REAL NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "min_stock" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "products_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_products" ("barcode", "carton_size", "cost_price", "created_at", "id", "min_stock", "name", "price_per_carton", "unit_price", "unit_type", "warehouse_id") SELECT "barcode", "carton_size", "cost_price", "created_at", "id", "min_stock", "name", "price_per_carton", "unit_price", "unit_type", "warehouse_id" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");
CREATE TABLE "new_warehouses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "manager_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_warehouses" ("address", "created_at", "id", "manager_id", "name") SELECT "address", "created_at", "id", "manager_id", "name" FROM "warehouses";
DROP TABLE "warehouses";
ALTER TABLE "new_warehouses" RENAME TO "warehouses";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "inventory_product_id_key" ON "inventory"("product_id");
