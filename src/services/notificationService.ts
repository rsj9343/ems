import api from './api';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  priority?: string;
}

export const notificationService = {
  getNotifications: (filters: NotificationFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    return api.get(`/notifications?${params.toString()}`);
  },

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  markAllAsRead: () => api.put('/notifications/mark-all-read'),

  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),

  createNotification: (data: {
    recipient: string;
    type: string;
    title: string;
    message: string;
    priority?: string;
    data?: any;
  }) => api.post('/notifications', data),

  getStats: () => api.get('/notifications/stats'),
};