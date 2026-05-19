/**
 * Test script to verify member tag implementation
 * This script tests the isMember functionality
 * 
 * Usage: npx ts-node src/dev-script/testMemberTagImplementation.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testMemberTagImplementation() {
  console.log("🧪 Testing Member Tag Implementation...\n");
  
  try {
    // Test 1: Check if isMember field exists in User model
    console.log("Test 1: Checking User model schema...");
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, isMember: true },
      take: 1
    });
    console.log("✅ User model has isMember field");
    if (users.length > 0) {
      console.log(`   Sample user: ${users[0].email}, isMember: ${users[0].isMember}`);
    }
    
    // Test 2: Check users with active memberships
    console.log("\nTest 2: Checking users with active memberships...");
    const activeMemberships = await prisma.membership.findMany({
      where: { isActive: true },
      include: { 
        plan: true 
      },
      take: 5
    });
    
    console.log(`   Found ${activeMemberships.length} active memberships`);
    
    for (const membership of activeMemberships) {
      const user = await prisma.user.findUnique({
        where: { id: membership.userId },
        select: { email: true, isMember: true }
      });
      
      const expiryStatus = membership.expiresAt 
        ? (membership.expiresAt > new Date() ? "Valid" : "Expired")
        : "No expiry";
      
      console.log(`   User: ${user?.email}`);
      console.log(`     - isMember: ${user?.isMember}`);
      console.log(`     - Membership: ${membership.plan?.name || 'N/A'}`);
      console.log(`     - Expiry: ${expiryStatus}`);
      console.log(`     - Started: ${membership.startedAt.toISOString().split('T')[0]}`);
      
      if (membership.expiresAt && membership.expiresAt <= new Date() && user?.isMember) {
        console.log(`     ⚠️  WARNING: User has expired membership but isMember is still true`);
      } else if (!user?.isMember) {
        console.log(`     ⚠️  WARNING: User has active membership but isMember is false`);
      } else {
        console.log(`     ✅ Status is correct`);
      }
    }
    
    // Test 3: Check for expired memberships
    console.log("\nTest 3: Checking for expired memberships...");
    const expiredMemberships = await prisma.membership.findMany({
      where: {
        isActive: true,
        expiresAt: {
          not: null,
          lt: new Date()
        }
      }
    });
    
    if (expiredMemberships.length > 0) {
      console.log(`   ⚠️  Found ${expiredMemberships.length} expired but still active memberships`);
      console.log(`   💡 Run: npx ts-node src/dev-script/checkExpiredMemberships.ts to fix this`);
    } else {
      console.log(`   ✅ No expired memberships with active status`);
    }
    
    // Test 4: Check users with isMember=true but no active memberships
    console.log("\nTest 4: Checking for inconsistencies...");
    const usersMarkedAsMember = await prisma.user.findMany({
      where: { isMember: true },
      select: { id: true, email: true }
    });
    
    let inconsistencies = 0;
    for (const user of usersMarkedAsMember) {
      const activeMembership = await prisma.membership.findFirst({
        where: {
          userId: user.id,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } }
          ]
        }
      });
      
      if (!activeMembership) {
        console.log(`   ⚠️  User ${user.email} has isMember=true but no active membership`);
        inconsistencies++;
      }
    }
    
    if (inconsistencies === 0) {
      console.log(`   ✅ All users with isMember=true have active memberships`);
    } else {
      console.log(`   Found ${inconsistencies} inconsistencies`);
    }
    
    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Summary:");
    console.log(`   Total users with isMember=true: ${usersMarkedAsMember.length}`);
    console.log(`   Total active memberships: ${activeMemberships.length}`);
    console.log(`   Expired but active memberships: ${expiredMemberships.length}`);
    console.log(`   Inconsistencies found: ${inconsistencies}`);
    
    if (expiredMemberships.length > 0 || inconsistencies > 0) {
      console.log("\n💡 Recommendation: Run the membership expiry check script:");
      console.log("   npx ts-node src/dev-script/checkExpiredMemberships.ts");
    } else {
      console.log("\n✅ All checks passed! Member tag implementation is working correctly.");
    }
    
  } catch (error) {
    console.error("❌ Error during testing:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testMemberTagImplementation();

