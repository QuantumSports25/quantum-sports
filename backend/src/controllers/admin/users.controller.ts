import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminUsersController {
	static async deleteUser(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				return res.status(400).json({ success: false, message: 'User ID is required' });
			}

			// Optional: Prevent deleting self (admin performing the request)
			const requester: any = (req as any).user;
			if (requester && requester.userId === id) {
				return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
			}

			// Clean up dependent data as needed (soft delete or cascade deletes could be better)
			// For safety, remove memberships and wallet, partnerDetails, mappings, etc., before deleting user
			await prisma.$transaction(async (tx) => {
				await tx.partnerVenueMap.deleteMany({ where: { partnerDetailId: id } });
				await tx.partnerDetails.deleteMany({ where: { userId: id } });
				await tx.membership.deleteMany({ where: { userId: id } });
				await tx.wallet.deleteMany({ where: { userId: id } });
				// Finally, delete the user
				await tx.user.delete({ where: { id } });
			});

			return res.status(200).json({ success: true, message: 'User deleted successfully' });
		} catch (error: any) {
			console.error('Error deleting user:', error);
			return res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
		}
	}
}
