"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const membership_controller_1 = require("../../controllers/membership-controller/membership.controller");
const membershipPlan_controller_1 = require("../../controllers/membership-controller/membershipPlan.controller");
const router = (0, express_1.Router)();
router.post('/create-membership-plan', membershipPlan_controller_1.MembershipPlanController.createMembershipPlan);
router.post('/update-membership-plan', membershipPlan_controller_1.MembershipPlanController.updateMembershipPlan);
router.post('/delete-membership-plan', membershipPlan_controller_1.MembershipPlanController.deleteMembershipPlan);
router.get('/get-all-plans', membershipPlan_controller_1.MembershipPlanController.getAllMembershipPlans);
router.get('/get-active-plans', membershipPlan_controller_1.MembershipPlanController.getActiveMembershipPlans);
router.get('/get-plan/:id', membershipPlan_controller_1.MembershipPlanController.getMembershipPlanById);
router.post('/seed-plans', membership_controller_1.MembershipController.seedMembershipPlans);
exports.default = router;
//# sourceMappingURL=membershipPlan.routes.js.map