/*
  Warnings:

  - You are about to drop the column `discount` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `ShopOrder` table. All the data in the column will be lost.
  - You are about to drop the column `totalDiscount` on the `ShopOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "discount";

-- AlterTable
ALTER TABLE "public"."ShopOrder" DROP COLUMN "discount",
DROP COLUMN "totalDiscount";
