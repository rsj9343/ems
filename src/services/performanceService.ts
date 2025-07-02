import api from './api';

export interface PerformanceReview {
  _id: string;
  employee: {
    _id: string;
    name: string;
    employeeId: string;
    position: string;
    department: string;
  };
  reviewer: {
    _id: string;
    name: string;
    employeeId: string;
    position: string;
  };
  reviewPeriod: {
    startDate: string;
    endDate: string;
  };
  overallRating: number;
  categories: Array<{
    name: string;
    rating: number;
    comments: string;
  }>;
  goals: Array<{
    description: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'exceeded';
    dueDate?: string;
    completedDate?: string;
  }>;
  achievements: string[];
  areasForImprovement: string[];
  developmentPlan: Array<{
    skill: string;
    action: string;
    timeline: string;
    resources: string[];
  }>;
  employeeComments?: string;
  reviewerComments?: string;
  status: 'draft' | 'pending_employee_review' | 'completed' | 'approved';
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceFilters {
  page?: number;
  limit?: number;
  employee?: string;
  reviewer?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePerformanceData {
  employee: string;
  reviewer: string;
  reviewPeriod: {
    startDate: string;
    endDate: string;
  };
  overallRating: number;
  categories: Array<{
    name: string;
    rating: number;
    comments: string;
  }>;
  goals: Array<{
    description: string;
    status: string;
    dueDate?: string;
  }>;
  achievements: string[];
  areasForImprovement: string[];
  developmentPlan: Array<{
    skill: string;
    action: string;
    timeline: string;
    resources: string[];
  }>;
  employeeComments?: string;
  reviewerComments?: string;
  status?: string;
  nextReviewDate?: string;
}

export const performanceService = {
  getAll: (filters: PerformanceFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    return api.get(`/performance?${params.toString()}`);
  },

  getById: (id: string) => api.get(`/performance/${id}`),

  create: (data: CreatePerformanceData) => api.post('/performance', data),

  update: (id: string, data: Partial<CreatePerformanceData>) =>
    api.put(`/performance/${id}`, data),

  delete: (id: string) => api.delete(`/performance/${id}`),

  getStats: () => api.get('/performance/stats'),

  getEmployeeHistory: (employeeId: string) =>
    api.get(`/performance/employee/${employeeId}`),
};