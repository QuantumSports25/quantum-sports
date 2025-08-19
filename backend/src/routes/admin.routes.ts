import { Router } from 'express';
import { AdminUsersController } from '../controllers/admin/users.controller';
import { authMiddleware, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Admin user management
router.delete('/users/:id', authMiddleware, isAdmin, AdminUsersController.deleteUser);

export default router;


