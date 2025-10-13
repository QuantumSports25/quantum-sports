import { Request, Response } from "express";
import { MembershipExpiryService } from "../../services/membership-services/membershipExpiry.service";

export class MembershipExpiryController {
  /**
   * Manually trigger membership expiry check
   * This can be called by a cron job or admin endpoint
   */
  static async checkExpiredMemberships(_req: Request, res: Response) {
    try {
      await MembershipExpiryService.checkAndUpdateExpiredMemberships();
      
      return res.status(200).json({ 
        success: true,
        message: "Expired memberships checked and updated successfully" 
      });
    } catch (error) {
      console.error("Error in checkExpiredMemberships:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to check expired memberships" 
      });
    }
  }

  /**
   * Update member status for a specific user
   */
  static async updateUserMemberStatus(req: Request, res: Response) {
    try {
      const userId = req.params['userId'];

      if (!userId) {
        return res.status(400).json({ 
          success: false,
          message: "User ID is required" 
        });
      }

      const isMember = await MembershipExpiryService.updateUserMemberStatus(userId);
      
      return res.status(200).json({ 
        success: true,
        isMember,
        message: "User member status updated successfully" 
      });
    } catch (error) {
      console.error("Error in updateUserMemberStatus:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to update user member status" 
      });
    }
  }

  /**
   * Get memberships expiring in the next N days
   */
  static async getExpiringMemberships(req: Request, res: Response) {
    try {
      const days = parseInt(req.query['days'] as string) || 7;

      const expiringMemberships = await MembershipExpiryService.getMembershipsExpiringInDays(days);
      
      return res.status(200).json({ 
        success: true,
        data: expiringMemberships,
        message: `Found ${expiringMemberships.length} memberships expiring in ${days} days` 
      });
    } catch (error) {
      console.error("Error in getExpiringMemberships:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to fetch expiring memberships" 
      });
    }
  }
}

