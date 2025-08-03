import { Router } from 'express';
import { DevScript } from '../dev-script/unlockAllSlots';
import { authMiddleware, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/unlock-all-slots', isAdmin, authMiddleware, DevScript.unlockAllSlots);

export default router; 