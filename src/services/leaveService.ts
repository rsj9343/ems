import api from './api';

export interface Leave {
  _id: string;
  employee: {
    _id: string;
    name: string;
    employeeId: string;
    department: {
      _id: string;
      name: string;
    };
  };
  type: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: {
    _id: string;
    name: string;
  };
  approvedDate?: string;
  rejectionReason?: string;
  totalDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  employee?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateLeaveData {
  employee: string;
  type: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveStatusData {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export const leaveService = {
  getAll: (filters: LeaveFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    return api.get(`/leaves?${params.toString()}`);
  },

  getById: (id: string) => api.get(`/leaves/${id}`),

  create: (data: CreateLeaveData) => api.post('/leaves', data),

  updateStatus: (id: string, data: UpdateLeaveStatusData) =>
    api.put(`/leaves/${id}/status`, data),

  delete: (id: string) => api.delete(`/leaves/${id}`),

  getStats: () => api.get('/leaves/stats'),
};