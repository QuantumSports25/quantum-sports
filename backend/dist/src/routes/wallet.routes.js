"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_controller_1 = require("../controllers/wallet-controller/wallet.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/balance/:userId', auth_middleware_1.authMiddleware, wallet_controller_1.WalletController.getWalletBalance);
router.get('/user/:userId', auth_middleware_1.authMiddleware, wallet_controller_1.WalletController.getUserWallet);
router.post('/add-credits', auth_middleware_1.authMiddleware, wallet_controller_1.WalletController.addCredits);
router.post('/deduct-credits', auth_middleware_1.authMiddleware, wallet_controller_1.WalletController.deductCredits);
exports.default = router;
//# sourceMappingURL=wallet.routes.js.map