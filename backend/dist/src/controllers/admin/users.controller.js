"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUsersController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AdminUsersController {
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'User ID is required' });
            }
            const requester = req.user;
            if (requester && requester.userId === id) {
                return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
            }
            await prisma.$transaction(async (tx) => {
                await tx.partnerVenueMap.deleteMany({ where: { partnerDetailId: id } });
                await tx.partnerDetails.deleteMany({ where: { userId: id } });
                await tx.membership.deleteMany({ where: { userId: id } });
                await tx.wallet.deleteMany({ where: { userId: id } });
                await tx.user.delete({ where: { id } });
            });
            return res.status(200).json({ success: true, message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
        }
    }
}
exports.AdminUsersController = AdminUsersController;
//# sourceMappingURL=users.controller.js.map