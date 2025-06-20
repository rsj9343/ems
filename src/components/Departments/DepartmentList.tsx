import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { departmentService, Department } from '../../services/departmentService';
import { Building2, Plus, Users, Edit, Trash2, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../Common/Card';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';

const DepartmentList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetchDepartments();
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAll();
      setDepartments(response.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await departmentService.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching department stats:', error);
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    
    try {
      await departmentService.delete(id);
      fetchDepartments();
      fetchStats();
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading departments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-600">Manage organizational departments</p>
          </div>
        </div>
        {isAdmin && (
          <Link to="/departments/new">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <Card key={department._id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                  <p className="text-sm text-gray-500">
                    {department.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/departments/${department._id}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteDepartment(department._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {department.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {department.description}
              </p>
            )}

            <div className="space-y-3">
              {department.head && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Head:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {department.head.name}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Employees:</span>
                <span className="text-sm font-medium text-gray-900">
                  {department.employeeCount || 0}
                </span>
              </div>

              {department.budget > 0 && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Budget:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${department.budget.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Created by {department.createdBy.name}</span>
                <span>{new Date(department.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {departments.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first department
            </p>
            {isAdmin && (
              <div className="mt-6">
                <Link to="/departments/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Department Statistics */}
      {isAdmin && stats.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Department Statistics</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.map((stat) => (
                  <tr key={stat._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.employeeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.activeEmployees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${stat.budget?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stat.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {stat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DepartmentList;