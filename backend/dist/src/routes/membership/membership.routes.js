"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const membership_controller_1 = require("../../controllers/membership-controller/membership.controller");
const membershipPlan_controller_1 = require("../../controllers/membership-controller/membershipPlan.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/create-membership', auth_middleware_1.authMiddleware, membership_controller_1.MembershipController.createMembershipBeforePayment);
router.post('/create-order/:id', auth_middleware_1.authMiddleware, membership_controller_1.MembershipController.createMembershipOrder);
router.post('/verify-payment', auth_middleware_1.authMiddleware, membership_controller_1.MembershipController.verifyMembershipPayment);
router.get('/user-memberships', auth_middleware_1.authMiddleware, membership_controller_1.MembershipController.getUserMemberships);
router.get('/plans', membershipPlan_controller_1.MembershipPlanController.getActiveMembershipPlans);
router.post('/seed-plans', membership_controller_1.MembershipController.seedMembershipPlans);
exports.default = router;
//# sourceMappingURL=membership.routes.js.map