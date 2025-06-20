import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { departmentService, CreateDepartmentData } from '../../services/departmentService';
import { employeeService } from '../../services/employeeService';
import { Building2, ArrowLeft, Save } from 'lucide-react';
import Card from '../Common/Card';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';

const DepartmentForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateDepartmentData & { isActive: boolean }>();

  useEffect(() => {
    fetchEmployees();
    if (isEditing) {
      fetchDepartment();
    }
  }, [id, isEditing]);

  const fetchEmployees = async () => {
  try {
    const response = await employeeService.getAll({ limit: 100 });
    console.log("Fetched employees:", response.employees); // ✅ LOG HERE
    setEmployees(response.employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
  }
};


  const fetchDepartment = async () => {
  if (!id) return;

  try {
    setLoading(true);
    const response = await departmentService.getById(id);
    console.log("Fetched department:", response.department); // ✅ LOG HERE
    const department = response.department;

    reset({
      name: department.name,
      description: department.description || '',
      head: department.head?._id || '',
      budget: department.budget,
      isActive: department.isActive
    });
  } catch (error) {
    console.error('Error fetching department:', error);
  } finally {
    setLoading(false);
  }
};


  const onSubmit = async (data: CreateDepartmentData & { isActive: boolean }) => {
  try {
    setSubmitting(true);
    
    console.log("Raw form data:", data); // ✅ LOG 1
    
    const submitData = {
      ...data,
      head: data.head?.trim() || undefined,
      budget: Number(data.budget) || 0
    };

    console.log("Final submitData:", submitData); // ✅ LOG 2

    // Optional: validate if head exists in employees
    if (submitData.head && !employees.find(emp => emp._id === submitData.head)) {
      console.warn("Invalid head selected:", submitData.head); // ✅ LOG 3
      alert("Selected department head is invalid.");
      return;
    }

    if (isEditing && id) {
      await departmentService.update(id, submitData);
    } else {
      await departmentService.create(submitData);
    }

    navigate('/departments');
  } catch (error) {
    console.error('Error saving department:', error); // ✅ LOG 4
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => navigate('/departments')}
          variant="outline"
          size="small"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Department' : 'Add New Department'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update department information' : 'Create a new department'}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Department Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  {...register('name', { required: 'Department name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter department name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="head" className="block text-sm font-medium text-gray-700 mb-2">
                  Department Head
                </label>
                <select
                  {...register('head')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department Head</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget
                </label>
                <input
                  {...register('budget', {
                    min: { value: 0, message: 'Budget must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter budget amount"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
                )}
              </div>

              {isEditing && (
                <div>
                  <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register('isActive')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter department description..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/departments')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Department' : 'Create Department'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DepartmentForm;