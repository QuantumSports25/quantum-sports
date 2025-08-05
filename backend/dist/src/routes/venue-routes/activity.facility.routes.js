"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facility_contoller_1 = require("../../controllers/venue-controller/facility-controller/facility.contoller");
const activity_contorller_1 = require("../../controllers/venue-controller/activity-controller/activity.contorller");
const router = (0, express_1.Router)();
router.post('/create-activity', activity_contorller_1.ActivityController.createActivity);
router.get('/get-activities-by-venue/:venueId', activity_contorller_1.ActivityController.getActivitiesByVenue);
router.get('/get-activity-by-id/:id', activity_contorller_1.ActivityController.getActivityById);
router.put('/update-activity/:id', activity_contorller_1.ActivityController.updateActivity);
router.delete('/delete-activity/:id', activity_contorller_1.ActivityController.deleteActivity);
router.post('/create-facility', facility_contoller_1.FacilityController.createFacility);
router.get('/get-facilities-by-activity/:activityId', facility_contoller_1.FacilityController.getFacilitiesByActivity);
router.get('/get-facility-by-id/:id', facility_contoller_1.FacilityController.getFacilityById);
router.put('/update-facility/:id', facility_contoller_1.FacilityController.updateFacility);
router.delete('/delete-facility/:id', facility_contoller_1.FacilityController.deleteFacility);
exports.default = router;
//# sourceMappingURL=activity.facility.routes.js.map