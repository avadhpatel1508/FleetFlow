import express from 'express';
import {
    getTrips,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip
} from '../controllers/tripController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getTrips)
    .post(protect, authorize('Dispatcher', 'Fleet Manager'), createTrip);

router.route('/:id')
    .get(protect, getTripById)
    .put(protect, authorize('Dispatcher', 'Fleet Manager', 'Driver'), updateTrip)
    .delete(protect, authorize('Fleet Manager'), deleteTrip);

export default router;
