import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AdminUsersController } from '../controllers/admin/users.controller';
import { authMiddleware, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/send-otp', AuthController.sendLoginOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/register-partner', AuthController.registerPartner);
router.post('/partner-login', AuthController.partnerLogin);
router.post('/admin-login', AuthController.adminLogin);
router.get('/users', AuthController.getAllUsersByRole);

// Admin user management
router.delete('/admin/users/:id', authMiddleware, isAdmin, AdminUsersController.deleteUser);

export default router;