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

// Profile routes
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.post('/change-password', authMiddleware, AuthController.changePassword);

// Password reset via OTP
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-reset-code', AuthController.verifyResetCode);
router.post('/reset-password', AuthController.resetPassword);

// Admin user management
router.delete('/admin/users/:id', authMiddleware, isAdmin, AdminUsersController.deleteUser);

export default router;