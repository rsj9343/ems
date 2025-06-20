import express from 'express';
import {
  getAllLeaves,
  getLeaveById,
  createLeave,
  updateLeaveStatus,
  deleteLeave,
  getLeaveStats
} from '../controllers/leaveController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { validateLeave, validateId, validatePagination } from '../middlewares/validation.js';

const router = express.Router();

// All leave routes require authentication
router.use(authenticate);

// Get all leaves with filtering
router.get('/', validatePagination, getAllLeaves);

// Get leave statistics (admin only)
router.get('/stats', requireAdmin, getLeaveStats);

// Get leave by ID
router.get('/:id', validateId, getLeaveById);

// Create new leave application
router.post('/', validateLeave, createLeave);

// Update leave status (admin only)
router.put('/:id/status', requireAdmin, validateId, updateLeaveStatus);

// Delete leave application
router.delete('/:id', validateId, deleteLeave);

export default router;