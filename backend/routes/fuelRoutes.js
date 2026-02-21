import express from 'express';
import {
    getFuelLogs,
    createFuelLog,
    updateFuelLog,
    deleteFuelLog
} from '../controllers/fuelController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getFuelLogs)
    .post(protect, authorize('Fleet Manager', 'Dispatcher'), createFuelLog);

router.route('/:id')
    .put(protect, authorize('Fleet Manager'), updateFuelLog)
    .delete(protect, authorize('Fleet Manager'), deleteFuelLog);

export default router;
