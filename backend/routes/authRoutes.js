import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} from '../controllers/authController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { validateRegister, validateLogin } from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.post('/login', validateLogin, login);
router.post('/logout', logout);

// Protected routes
router.post('/register', authenticate, requireAdmin, validateRegister, register);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;