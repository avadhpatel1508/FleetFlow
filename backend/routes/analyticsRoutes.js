import express from 'express';
import { getDashboardKPIs, getMetrics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/kpi', protect, getDashboardKPIs);
router.get('/metrics', protect, authorize('Fleet Manager', 'Financial Analyst'), getMetrics);

export default router;
