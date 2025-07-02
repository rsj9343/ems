import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
} from '../controllers/authController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { validateRegister, validateLogin } from '../middlewares/validation.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', logout);

// Protected routes
router.post('/register', authenticate, requireAdmin, validateRegister, register);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/upload-avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.put('/change-password', authenticate, changePassword);

export default router;