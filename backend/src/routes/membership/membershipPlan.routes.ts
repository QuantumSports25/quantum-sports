import { Router } from 'express';
import { MembershipController } from '../../controllers/membership-controller/membership.controller';
import { MembershipPlanController } from '../../controllers/membership-controller/membershipPlan.controller';

const router = Router();

router.post('/create-membership-plan', MembershipPlanController.createMembershipPlan);
router.post('/update-membership-plan', MembershipPlanController.updateMembershipPlan);
router.post('/delete-membership-plan', MembershipPlanController.deleteMembershipPlan);
router.get('/get-all-plans', MembershipPlanController.getAllMembershipPlans);
router.get('/get-active-plans', MembershipPlanController.getActiveMembershipPlans);
router.get('/get-plan/:id', MembershipPlanController.getMembershipPlanById);

// Development only - seed data
router.post('/seed-plans', MembershipController.seedMembershipPlans);

export default router; 