/*
  Warnings:

  - You are about to drop the column `paymenntDetails` on the `ShopOrder` table. All the data in the column will be lost.
  - You are about to drop the column `sellerIds` on the `ShopOrder` table. All the data in the column will be lost.
  - Added the required column `paymentDetails` to the `ShopOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `ShopOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ShopOrder" DROP COLUMN "paymenntDetails",
DROP COLUMN "sellerIds",
ADD COLUMN     "paymentDetails" JSONB NOT NULL,
ADD COLUMN     "sellerId" TEXT NOT NULL;
