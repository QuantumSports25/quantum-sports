/*
  Warnings:

  - You are about to drop the column `duration` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfSlots` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."bookings" DROP COLUMN "duration",
DROP COLUMN "endTime",
DROP COLUMN "numberOfSlots",
DROP COLUMN "startTime";
