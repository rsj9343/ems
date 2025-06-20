import api from './api';

export interface Department {
  _id: string;
  name: string;
  description?: string;
  head?: {
    _id: string;
    name: string;
    employeeId: string;
  };
  budget: number;
  isActive: boolean;
  employeeCount?: number;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  head?: string;
  budget?: number;
}

export const departmentService = {
  getAll: (active?: boolean) => {
    const params = active !== undefined ? `?active=${active}` : '';
    return api.get(`/departments${params}`);
  },

  getById: (id: string) => api.get(`/departments/${id}`),

  create: (data: CreateDepartmentData) => api.post('/departments', data),

  update: (id: string, data: Partial<CreateDepartmentData & { isActive: boolean }>) =>
    api.put(`/departments/${id}`, data),

  delete: (id: string) => api.delete(`/departments/${id}`),

  getStats: () => api.get('/departments/stats'),
};