import express from 'express';
import {
    getMaintenanceLogs,
    createMaintenanceLog,
    updateMaintenanceLog,
    deleteMaintenanceLog
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getMaintenanceLogs)
    .post(protect, authorize('Fleet Manager', 'Dispatcher'), createMaintenanceLog);

router.route('/:id')
    .put(protect, authorize('Fleet Manager'), updateMaintenanceLog)
    .delete(protect, authorize('Fleet Manager'), deleteMaintenanceLog);

export default router;
