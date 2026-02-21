import express from 'express';
import { getIncidents, createIncident, deleteIncident } from '../controllers/incidentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('Fleet Manager', 'Safety Officer'), getIncidents)
    .post(protect, authorize('Fleet Manager', 'Safety Officer'), createIncident);

router.route('/:id')
    .delete(protect, authorize('Fleet Manager'), deleteIncident);

export default router;
