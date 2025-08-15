/*
  Warnings:

  - The `registeredUsers` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "bookedSeats" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "registeredUsers",
ADD COLUMN     "registeredUsers" TEXT[];
