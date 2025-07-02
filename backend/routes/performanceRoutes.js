import express from 'express';
import {
  getAllPerformanceReviews,
  getPerformanceReviewById,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
  getPerformanceStats,
  getEmployeePerformanceHistory
} from '../controllers/performanceController.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { validateId } from '../middlewares/validation.js';

const router = express.Router();

// All performance routes require authentication
router.use(authenticate);

// Get all performance reviews
router.get('/', requirePermission('view_reports'), getAllPerformanceReviews);

// Get performance statistics
router.get('/stats', requirePermission('view_reports'), getPerformanceStats);

// Get employee performance history
router.get('/employee/:employeeId', requirePermission('view_reports'), getEmployeePerformanceHistory);

// Get performance review by ID
router.get('/:id', requirePermission('view_reports'), validateId, getPerformanceReviewById);

// Create new performance review
router.post('/', requirePermission('view_reports'), createPerformanceReview);

// Update performance review
router.put('/:id', requirePermission('view_reports'), validateId, updatePerformanceReview);

// Delete performance review
router.delete('/:id', requirePermission('view_reports'), validateId, deletePerformanceReview);

export default router;