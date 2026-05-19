/**
 * Script to check and update expired memberships
 * This can be run as a cron job or manually
 * 
 * Usage: npx ts-node src/dev-script/checkExpiredMemberships.ts
 */

import { PrismaClient } from "@prisma/client";
import { MembershipExpiryService } from "../services/membership-services/membershipExpiry.service";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting expired membership check...");
  console.log("Current time:", new Date().toISOString());

  try {
    await MembershipExpiryService.checkAndUpdateExpiredMemberships();
    console.log("✅ Expired membership check completed successfully");
  } catch (error) {
    console.error("❌ Error checking expired memberships:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

