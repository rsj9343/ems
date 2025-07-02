import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getNotificationStats
} from '../controllers/notificationController.js';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import { validateId } from '../middlewares/validation.js';

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', getUserNotifications);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Mark notification as read
router.put('/:id/read', validateId, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', validateId, deleteNotification);

// Create notification (admin only)
router.post('/', requireAdmin, createNotification);

export default router;