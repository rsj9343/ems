import express from 'express';
import {
  generateEmployeeReport,
  generateLeaveReport,
  generatePerformanceReport,
  getAnalyticsDashboard
} from '../controllers/reportController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';

const router = express.Router();

// All report routes require authentication and view_reports permission
router.use(authenticate);
router.use(requirePermission('view_reports'));

// Generate employee report
router.get('/employees', generateEmployeeReport);

// Generate leave report
router.get('/leaves', generateLeaveReport);

// Generate performance report
router.get('/performance', generatePerformanceReport);

// Get analytics dashboard data
router.get('/analytics', getAnalyticsDashboard);

export default router;