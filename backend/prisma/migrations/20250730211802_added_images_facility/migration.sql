-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "paymentDetails" JSONB;
