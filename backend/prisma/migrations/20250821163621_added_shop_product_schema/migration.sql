/*
  Warnings:

  - A unique constraint covering the columns `[shopOrderId]` on the table `transaction_history` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."transaction_history" ADD COLUMN     "shopOrderId" TEXT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "shippingAddress" JSONB;

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" JSONB NOT NULL,
    "inventory" INTEGER NOT NULL,
    "category" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopOrder" (
    "id" TEXT NOT NULL,
    "products" JSONB NOT NULL,
    "discount" JSONB NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "totalDiscount" DOUBLE PRECISION NOT NULL,
    "totalItems" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "ShopOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transaction_history_shopOrderId_key" ON "public"."transaction_history"("shopOrderId");
