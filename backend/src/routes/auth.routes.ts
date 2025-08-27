import { Router } from 'express';
import { AuthController } from '../controllers/user-controller/auth.controller';
import { AdminUsersController } from '../controllers/admin/users.controller';
import { authMiddleware, isAdmin } from '../middleware/auth.middleware';
import { UserController } from '../controllers/user-controller/user.controller';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/send-otp', AuthController.sendLoginOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/register-partner', AuthController.registerPartner);
router.post('/partner-login', AuthController.partnerLogin);
router.post('/admin-login', AuthController.adminLogin);
router.post('/change-password', authMiddleware, AuthController.changePassword);

// Profile routes
router.get('/users', UserController.getAllUsersByRole);
router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);
router.post('/profile/add-address', authMiddleware, UserController.addAddress);
router.post('/profile/remove-address', authMiddleware, UserController.deleteAddress);
router.get('/profile/addresses', authMiddleware, UserController.getAllAddress);

// Admin user management
router.delete('/admin/users/:id', authMiddleware, isAdmin, AdminUsersController.deleteUser);

export default router;