import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} from '../controllers/employeeController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { 
  validateEmployee, 
  validateId, 
  validateEmployeeQuery 
} from '../middlewares/validation.js';

const router = express.Router();

// All employee routes require authentication
router.use(authenticate);

// Get all employees with filtering and pagination
router.get('/', validateEmployeeQuery, getAllEmployees);

// Get employee statistics (admin only)
router.get('/stats', requireAdmin, getEmployeeStats);

// Get employee by ID
router.get('/:id', validateId, getEmployeeById);

// Create new employee (admin only)
router.post('/', requireAdmin, validateEmployee, createEmployee);

// Update employee (admin only)
router.put('/:id', requireAdmin, validateId, validateEmployee, updateEmployee);

// Delete employee (admin only)
router.delete('/:id', requireAdmin, validateId, deleteEmployee);

export default router;