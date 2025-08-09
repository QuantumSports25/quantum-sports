-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('All', 'Gaming', 'Technology', 'Music', 'Business', 'Fitness', 'Art');

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "venue" TEXT NOT NULL,
    "venueName" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "registeredUsers" INTEGER NOT NULL,
    "ticketPrice" DOUBLE PRECISION NOT NULL,
    "category" "public"."Category" NOT NULL,
    "images" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "organizer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
