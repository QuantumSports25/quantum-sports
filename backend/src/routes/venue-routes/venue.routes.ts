import { Router } from 'express';
import { CreateVenueController } from '../../controllers/venue-controller/createVenue.controller';
import { GetVenueController } from '../../controllers/venue-controller/getVenue.controller';
import { UpdateVenueController } from '../../controllers/venue-controller/updateVenue.controller';
import { DeleteVenueController } from '../../controllers/venue-controller/deleteVenue.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Venue Routes
router.post('/create-venue',authMiddleware, CreateVenueController.createVenue);
router.get('/get-venue/:id', GetVenueController.getVenue);
router.get('/get-all-venues-by-partner/', GetVenueController.getAllVenuesByPartner);
router.put('/update-venue/:id',authMiddleware, UpdateVenueController.updateVenue);
router.delete('/delete-venue/:id', authMiddleware, DeleteVenueController.deleteVenue);
router.get('/get-all-venues', GetVenueController.getAllVenues);

export default router;