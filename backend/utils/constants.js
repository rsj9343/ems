// Application constants
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};

export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  RESIGNED: 'resigned',
  TERMINATED: 'terminated'
};

export const LEAVE_TYPES = {
  SICK: 'sick',
  VACATION: 'vacation',
  PERSONAL: 'personal',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  OTHER: 'other'
};

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
};

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5
};

// Date formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'DD/MM/YYYY',
  DATETIME: 'DD/MM/YYYY HH:mm'
};

// Email templates
export const EMAIL_SUBJECTS = {
  WELCOME: 'Welcome to Employee Management System',
  LEAVE_APPLIED: 'Leave Application Submitted',
  LEAVE_APPROVED: 'Leave Application Approved',
  LEAVE_REJECTED: 'Leave Application Rejected',
  PASSWORD_RESET: 'Password Reset Request'
};