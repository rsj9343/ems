import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  uploadEmployeeAvatar,
  uploadEmployeeDocument,
  deleteEmployee,
  getEmployeeStats,
  createEmployeeUser
} from '../controllers/employeeController.js';
import { authenticate, requireAdmin, requirePermission } from '../middlewares/auth.js';
import { 
  validateEmployee, 
  validateId, 
  validateEmployeeQuery 
} from '../middlewares/validation.js';
import { upload, uploadDocument } from '../config/cloudinary.js';

const router = express.Router();

// All employee routes require authentication
router.use(authenticate);

// Get all employees with filtering and pagination
router.get('/', requirePermission('view_employees'), validateEmployeeQuery, getAllEmployees);

// Get employee statistics (admin/hr only)
router.get('/stats', requirePermission('view_reports'), getEmployeeStats);

// Get employee by ID
router.get('/:id', requirePermission('view_employees'), validateId, getEmployeeById);

// Create new employee (admin/hr only)
router.post('/', requirePermission('create_employees'), validateEmployee, createEmployee);

// Update employee (admin/hr only)
router.put('/:id', requirePermission('edit_employees'), validateId, validateEmployee, updateEmployee);

// Upload employee avatar
router.post('/:id/avatar', requirePermission('edit_employees'), validateId, upload.single('avatar'), uploadEmployeeAvatar);

// Upload employee document
router.post('/:id/documents', requirePermission('edit_employees'), validateId, uploadDocument.single('document'), uploadEmployeeDocument);

// Create user account for employee
router.post('/:id/create-user', requireAdmin, validateId, createEmployeeUser);

// Delete employee (admin only)
router.delete('/:id', requirePermission('delete_employees'), validateId, deleteEmployee);

export default router;