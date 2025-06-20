import express from 'express';
import { getAdminDashboard, getEmployeeDashboard } from '../controllers/dashboardController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// Get admin dashboard data
router.get('/admin', requireAdmin, getAdminDashboard);

// Get employee dashboard data
router.get('/employee', getEmployeeDashboard);

export default router;