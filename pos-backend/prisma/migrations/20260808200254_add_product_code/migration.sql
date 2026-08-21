/*
  Warnings:

  - A unique constraint covering the columns `[product_code]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN "product_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "products_product_code_key" ON "products"("product_code");
