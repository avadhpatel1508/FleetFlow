import express from 'express';
import {
    getDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver
} from '../controllers/driverController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getDrivers)
    .post(protect, authorize('Fleet Manager', 'Dispatcher'), createDriver);

router.route('/:id')
    .get(protect, getDriverById)
    .put(protect, authorize('Fleet Manager', 'Dispatcher', 'Safety Officer'), updateDriver)
    .delete(protect, authorize('Fleet Manager'), deleteDriver);

export default router;
