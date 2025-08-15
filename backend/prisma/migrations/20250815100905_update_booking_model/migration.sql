/*
  Warnings:

  - You are about to drop the column `activityId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `facilityId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `partnerId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `venueId` on the `bookings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."bookings" DROP COLUMN "activityId",
DROP COLUMN "facilityId",
DROP COLUMN "partnerId",
DROP COLUMN "venueId",
ADD COLUMN     "bookingData" JSONB,
ADD COLUMN     "type" TEXT;
