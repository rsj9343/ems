import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService, AdminDashboardData, EmployeeDashboardData } from '../../services/dashboardService';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import LoadingSpinner from '../Common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<AdminDashboardData | EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (isAdmin) {
          const adminData = await dashboardService.getAdminDashboard();
          setData(adminData);
        } else {
          const employeeData = await dashboardService.getEmployeeDashboard();
          setData(employeeData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {isAdmin ? (
        <AdminDashboard data={data as AdminDashboardData} />
      ) : (
        <EmployeeDashboard data={data as EmployeeDashboardData} />
      )}
    </div>
  );
};

export default Dashboard;