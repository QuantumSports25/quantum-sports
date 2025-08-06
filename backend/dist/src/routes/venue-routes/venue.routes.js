"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const createVenue_controller_1 = require("../../controllers/venue-controller/createVenue.controller");
const getVenue_controller_1 = require("../../controllers/venue-controller/getVenue.controller");
const updateVenue_controller_1 = require("../../controllers/venue-controller/updateVenue.controller");
const deleteVenue_controller_1 = require("../../controllers/venue-controller/deleteVenue.controller");
const router = (0, express_1.Router)();
router.post('/create-venue', createVenue_controller_1.CreateVenueController.createVenue);
router.get('/get-venue/:id', getVenue_controller_1.GetVenueController.getVenue);
router.get('/get-all-venues-by-partner/', getVenue_controller_1.GetVenueController.getAllVenuesByPartner);
router.put('/update-venue/:id', updateVenue_controller_1.UpdateVenueController.updateVenue);
router.delete('/delete-venue/:id', deleteVenue_controller_1.DeleteVenueController.deleteVenue);
router.get('/get-all-venues', getVenue_controller_1.GetVenueController.getAllVenues);
exports.default = router;
//# sourceMappingURL=venue.routes.js.map