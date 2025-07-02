import api from './api';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  department?: string;
  status?: string;
  type?: string;
  format?: 'json' | 'csv' | 'excel';
}

export const reportService = {
  generateEmployeeReport: (filters: ReportFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    if (filters.format === 'csv' || filters.format === 'excel') {
      // For file downloads, we need to handle the response differently
      window.open(`${api.defaults.baseURL}/reports/employees?${params.toString()}`, '_blank');
      return Promise.resolve();
    }
    
    return api.get(`/reports/employees?${params.toString()}`);
  },

  generateLeaveReport: (filters: ReportFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    if (filters.format === 'csv' || filters.format === 'excel') {
      window.open(`${api.defaults.baseURL}/reports/leaves?${params.toString()}`, '_blank');
      return Promise.resolve();
    }
    
    return api.get(`/reports/leaves?${params.toString()}`);
  },

  generatePerformanceReport: (filters: ReportFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    if (filters.format === 'csv' || filters.format === 'excel') {
      window.open(`${api.defaults.baseURL}/reports/performance?${params.toString()}`, '_blank');
      return Promise.resolve();
    }
    
    return api.get(`/reports/performance?${params.toString()}`);
  },

  getAnalytics: () => api.get('/reports/analytics'),
};