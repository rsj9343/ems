import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password').populate('employee');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    if (user.isLocked) {
      return res.status(423).json({ message: 'Account is temporarily locked.' });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Check if user has specific permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next(); // Admins have all permissions
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        message: `Access denied. ${permission} permission required.` 
      });
    }

    next();
  };
};

// Check if user is admin or the resource owner
export const requireAdminOrOwner = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }

  // For employee role, check if they're accessing their own data
  const resourceEmployeeId = req.params.employeeId || req.body.employee;
  
  if (req.user.employee && 
      req.user.employee._id.toString() === resourceEmployeeId) {
    return next();
  }

  return res.status(403).json({ message: 'Access denied. Insufficient privileges.' });
};

// Check multiple roles
export const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. One of these roles required: ${roles.join(', ')}` 
      });
    }
    next();
  };
};

// Optional authentication (for public/private routes)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password').populate('employee');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }

    next();

  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};