import express from 'express';
import {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
} from '../controllers/vehicleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getVehicles)
    .post(protect, authorize('Fleet Manager', 'Dispatcher'), createVehicle);

router.route('/:id')
    .get(protect, getVehicleById)
    .put(protect, authorize('Fleet Manager', 'Dispatcher'), updateVehicle)
    .delete(protect, authorize('Fleet Manager'), deleteVehicle);

export default router;
