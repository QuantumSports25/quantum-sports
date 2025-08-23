/*
  Warnings:

  - You are about to drop the column `sellerId` on the `ShopOrder` table. All the data in the column will be lost.
  - Added the required column `orderStatus` to the `ShopOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymenntDetails` to the `ShopOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentStatus` to the `ShopOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerIds` to the `ShopOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ShopOrder" DROP COLUMN "sellerId",
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "orderStatus" "public"."BookingStatus" NOT NULL,
ADD COLUMN     "paymenntDetails" JSONB NOT NULL,
ADD COLUMN     "paymentStatus" "public"."PaymentStatus" NOT NULL,
ADD COLUMN     "sellerIds" TEXT NOT NULL;
