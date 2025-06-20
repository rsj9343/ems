import api from './api';

export interface AdminDashboardData {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    totalDepartments: number;
    pendingLeaves: number;
  };
  recentEmployees: Array<{
    _id: string;
    name: string;
    position: string;
    department: { name: string };
    createdAt: string;
  }>;
  departmentStats: Array<{
    _id: string;
    count: number;
    active: number;
  }>;
  leaveStats: Array<{
    _id: string;
    count: number;
  }>;
  monthlyGrowth: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
  recentLeaves: Array<{
    _id: string;
    employee: { name: string; employeeId: string };
    type: string;
    status: string;
    createdAt: string;
  }>;
}

export interface EmployeeDashboardData {
  employee: {
    _id: string;
    name: string;
    employeeId: string;
    position: string;
    department: { name: string };
    dateOfJoining: string;
    manager?: { name: string; employeeId: string };
  };
  leaveStats: {
    totalLeaves: number;
    pendingLeaves: number;
    approvedLeaves: number;
  };
  recentLeaves: Array<{
    _id: string;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
    totalDays: number;
  }>;
  tenure: {
    days: number;
    years: number;
    months: number;
  };
  colleaguesCount: number;
}

export const dashboardService = {
  getAdminDashboard: (): Promise<AdminDashboardData> => api.get('/dashboard/admin'),
  
  getEmployeeDashboard: (): Promise<EmployeeDashboardData> => api.get('/dashboard/employee'),
};