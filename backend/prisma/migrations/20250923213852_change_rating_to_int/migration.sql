/*
  Warnings:

  - You are about to alter the column `rating` on the `venues` table. The data in that column could be lost. The data in that column will be cast from `Decimal(2,1)` to `Integer`.
  - Made the column `rating` on table `venues` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."venues" ALTER COLUMN "rating" SET NOT NULL,
ALTER COLUMN "rating" SET DEFAULT 0,
ALTER COLUMN "rating" SET DATA TYPE INTEGER;
