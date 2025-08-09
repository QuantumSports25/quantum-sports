import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/send-otp', AuthController.sendLoginOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/register-partner', AuthController.registerPartner);
router.post('/partner-login', AuthController.partnerLogin);
router.post('/admin-login', AuthController.adminLogin);
router.get('/users/:role', AuthController.getAllUsersByRole);

export default router;