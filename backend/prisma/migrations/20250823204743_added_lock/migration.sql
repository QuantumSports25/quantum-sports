/*
  Warnings:

  - Added the required column `customerDetails` to the `ShopOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "lock" JSONB;

-- AlterTable
ALTER TABLE "public"."ShopOrder" ADD COLUMN     "customerDetails" JSONB NOT NULL;
