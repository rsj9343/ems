import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} from '../controllers/departmentController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { validateDepartment, validateId } from '../middlewares/validation.js';

const router = express.Router();

// All department routes require authentication
router.use(authenticate);

// Get all departments
router.get('/', getAllDepartments);

// Get department statistics (admin only)
router.get('/stats', requireAdmin, getDepartmentStats);

// Get department by ID
router.get('/:id', validateId, getDepartmentById);

// Create new department (admin only)
router.post('/', requireAdmin, validateDepartment, createDepartment);

// Update department (admin only)
router.put('/:id', requireAdmin, validateId, validateDepartment, updateDepartment);

// Delete department (admin only)
router.delete('/:id', requireAdmin, validateId, deleteDepartment);

export default router;