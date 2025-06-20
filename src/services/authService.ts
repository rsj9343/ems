// src/services/authService.ts
import api from './api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'employee';
  employeeId?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  login: (data: LoginData) => api.post('/auth/login', data),         // returns { token, user }
  register: (data: RegisterData) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),                        // returns { user }
  updateProfile: (data: { name: string; email: string }) => api.put('/auth/profile', data),
  changePassword: (data: ChangePasswordData) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};
