import { body, param, query } from 'express-validator';

// User validation rules
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('role')
    .optional()
    .isIn(['admin', 'employee'])
    .withMessage('Role must be either admin or employee')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Employee validation rules
export const validateEmployee = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
    
  body('position')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Position must be between 2 and 100 characters'),
    
  body('department')
    .isMongoId()
    .withMessage('Please provide a valid department ID'),
    
  body('dateOfJoining')
    .isISO8601()
    .withMessage('Please provide a valid date of joining'),
    
  body('salary')
    .isNumeric()
    .custom(value => value >= 0)
    .withMessage('Salary must be a positive number'),
    
  body('status')
    .optional()
    .isIn(['active', 'resigned', 'terminated'])
    .withMessage('Status must be active, resigned, or terminated')
];

// Department validation rules
export const validateDepartment = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be between 2 and 100 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
    
  body('head')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid employee ID for department head'),
    
  body('budget')
    .optional()
    .isNumeric()
    .custom(value => value >= 0)
    .withMessage('Budget must be a positive number')
];

// Leave validation rules
export const validateLeave = [
  body('employee')
    .isMongoId()
    .withMessage('Please provide a valid employee ID'),
    
  body('type')
    .isIn(['sick', 'vacation', 'personal', 'maternity', 'paternity', 'other'])
    .withMessage('Please provide a valid leave type'),
    
  body('startDate')
    .isISO8601()
    .custom(value => {
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
    
  body('endDate')
    .isISO8601()
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      
      if (endDate < startDate) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    }),
    
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters')
];

// ID validation
export const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid ID')
];

// Query validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const validateEmployeeQuery = [
  ...validatePagination,
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
    
  query('department')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid department ID'),
    
  query('status')
    .optional()
    .isIn(['active', 'resigned', 'terminated'])
    .withMessage('Status must be active, resigned, or terminated'),
    
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'position', 'dateOfJoining', 'salary'])
    .withMessage('Invalid sort field'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];