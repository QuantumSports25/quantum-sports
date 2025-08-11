-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "mapLocationLink" TEXT,
ADD COLUMN     "organizerName" TEXT,
ALTER COLUMN "organizer" DROP NOT NULL;
