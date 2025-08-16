-- DropForeignKey
ALTER TABLE "public"."transaction_history" DROP CONSTRAINT "transaction_history_bookingId_fkey";

-- AlterTable
ALTER TABLE "public"."transaction_history" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT 'ee25c462-5ca5-4e9e-bb63-a3fc62b07fd5';
