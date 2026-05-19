import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class MembershipExpiryService {
  /**
   * Check and update expired memberships
   * Sets isActive to false for expired memberships
   * Sets isMember to false for users with no active memberships
   */
  static async checkAndUpdateExpiredMemberships(): Promise<void> {
    try {
      const now = new Date();

      // Find all active memberships that have expired
      const expiredMemberships = await prisma.membership.findMany({
        where: {
          isActive: true,
          expiresAt: {
            not: null,
            lt: now, // expiresAt is less than current time
          },
        },
        select: {
          id: true,
          userId: true,
        },
      });

      console.log(`Found ${expiredMemberships.length} expired memberships to process`);

      // Process each expired membership
      for (const membership of expiredMemberships) {
        await prisma.$transaction(async (tx) => {
          // Mark membership as inactive
          await tx.membership.update({
            where: { id: membership.id },
            data: { isActive: false },
          });

          // Check if user has any other active memberships
          const activeUserMemberships = await tx.membership.findMany({
            where: {
              userId: membership.userId,
              isActive: true,
              OR: [
                { expiresAt: null }, // No expiry
                { expiresAt: { gte: now } }, // Not yet expired
              ],
            },
          });

          // If user has no active memberships, set isMember to false
          if (activeUserMemberships.length === 0) {
            await tx.user.update({
              where: { id: membership.userId },
              data: { isMember: false },
            });
            console.log(`User ${membership.userId} member status set to false`);
          }
        });
      }

      console.log(`Successfully processed ${expiredMemberships.length} expired memberships`);
    } catch (error) {
      console.error("Error checking and updating expired memberships:", error);
      throw error;
    }
  }

  /**
   * Check if a specific user has active membership
   * Updates isMember field accordingly
   */
  static async updateUserMemberStatus(userId: string): Promise<boolean> {
    try {
      const now = new Date();

      const activeMemberships = await prisma.membership.findMany({
        where: {
          userId,
          isActive: true,
          OR: [
            { expiresAt: null }, // No expiry
            { expiresAt: { gte: now } }, // Not yet expired
          ],
        },
      });

      const isMember = activeMemberships.length > 0;

      await prisma.user.update({
        where: { id: userId },
        data: { isMember },
      });

      return isMember;
    } catch (error) {
      console.error(`Error updating member status for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get all users whose memberships are about to expire
   * Useful for sending reminder emails
   */
  static async getMembershipsExpiringInDays(days: number): Promise<any[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const expiringMemberships = await prisma.membership.findMany({
        where: {
          isActive: true,
          expiresAt: {
            not: null,
            gte: now,
            lte: futureDate,
          },
        },
        include: {
          plan: true,
        },
      });

      return expiringMemberships;
    } catch (error) {
      console.error(`Error fetching memberships expiring in ${days} days:`, error);
      throw error;
    }
  }
}

