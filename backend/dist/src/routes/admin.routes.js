"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/admin/users.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.delete('/users/:id', auth_middleware_1.authMiddleware, auth_middleware_1.isAdmin, users_controller_1.AdminUsersController.deleteUser);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map