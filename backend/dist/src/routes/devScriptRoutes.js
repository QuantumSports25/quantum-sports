"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const unlockAllSlots_1 = require("../dev-script/unlockAllSlots");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/unlock-all-slots', auth_middleware_1.isAdmin, auth_middleware_1.authMiddleware, unlockAllSlots_1.DevScript.unlockAllSlots);
exports.default = router;
//# sourceMappingURL=devScriptRoutes.js.map