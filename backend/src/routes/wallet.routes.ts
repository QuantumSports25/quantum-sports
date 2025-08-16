import { Router } from 'express';
import { WalletController } from '../controllers/wallet-controller/wallet.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Wallet Routes
router.get('/balance/:userId', authMiddleware, WalletController.getWalletBalance);
router.get('/user/:userId', authMiddleware, WalletController.getUserWallet);
router.post('/add-credits', authMiddleware, WalletController.addCredits);
router.post('/deduct-credits', authMiddleware, WalletController.deductCredits);
router.get('/history', authMiddleware, WalletController.getWalletHistory);

export default router; 