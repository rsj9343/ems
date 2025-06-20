import api from './api';

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: {
    _id: string;
    name: string;
  };
  dateOfJoining: string;
  salary: number;
  status: 'active' | 'resigned' | 'terminated';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  performanceRating?: number;
  manager?: {
    _id: string;
    name: string;
  };
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  dateOfJoining: string;
  salary: number;
  status?: 'active' | 'resigned' | 'terminated';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  manager?: string;
}

export const employeeService = {
  getAll: (filters: EmployeeFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    return api.get(`/employees?${params.toString()}`);
  },

  getById: (id: string) => api.get(`/employees/${id}`),

  create: (data: CreateEmployeeData) => api.post('/employees', data),

  update: (id: string, data: Partial<CreateEmployeeData>) => 
    api.put(`/employees/${id}`, data),

  delete: (id: string) => api.delete(`/employees/${id}`),

  getStats: () => api.get('/employees/stats'),
};