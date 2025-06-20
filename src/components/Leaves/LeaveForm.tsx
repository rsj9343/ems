import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { leaveService, CreateLeaveData, Leave } from '../../services/leaveService';
import { employeeService } from '../../services/employeeService';
import { Calendar, ArrowLeft, Save, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../Common/Card';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';

const LeaveForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const isViewing = Boolean(id);
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateLeaveData>();

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
    if (isViewing) {
      fetchLeave();
    }
  }, [id, isViewing, isAdmin]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAll({ limit: 100 });
      setEmployees(response.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchLeave = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await leaveService.getById(id);
      setLeave(response.leave);
    } catch (error) {
      console.error('Error fetching leave:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };

  const onSubmit = async (data: CreateLeaveData) => {
    try {
      setSubmitting(true);
      
      // If user is employee and not admin, set employee to their own ID
      if (!isAdmin && user?.employeeId) {
        data.employee = user.employeeId;
      }
      
      await leaveService.create(data);
      navigate('/leaves');
    } catch (error) {
      console.error('Error creating leave:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading leave details..." />;
  }

  // If viewing existing leave
  if (isViewing && leave) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/leaves')}
            variant="outline"
            size="small"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Application</h1>
              <p className="text-gray-600">View leave details</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Leave Details</h3>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                  {leave.status}
                </span>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                    <p className="text-gray-900">{leave.employee.name} ({leave.employee.employeeId})</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                    <p className="text-gray-900 capitalize">{leave.type}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <p className="text-gray-900">{new Date(leave.startDate).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <p className="text-gray-900">{new Date(leave.endDate).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Days</label>
                    <p className="text-gray-900">{leave.totalDays} days</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Applied On</label>
                    <p className="text-gray-900">{new Date(leave.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{leave.reason}</p>
                </div>

                {leave.rejectionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                    <p className="text-red-700 bg-red-50 p-4 rounded-lg">{leave.rejectionReason}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>

                {leave.approvedBy && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Approved By</span>
                    <span className="text-sm text-gray-900">{leave.approvedBy.name}</span>
                  </div>
                )}

                {leave.approvedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Approved On</span>
                    <span className="text-sm text-gray-900">
                      {new Date(leave.approvedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => navigate('/leaves')}
          variant="outline"
          size="small"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
            <p className="text-gray-600">Submit a new leave application</p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Employee Selection (Admin only) */}
          {isAdmin && (
            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-2">
                Employee *
              </label>
              <select
                {...register('employee', { required: 'Employee is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
              {errors.employee && (
                <p className="mt-1 text-sm text-red-600">{errors.employee.message}</p>
              )}
            </div>
          )}

          {/* Leave Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type *
            </label>
            <select
              {...register('type', { required: 'Leave type is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Leave Type</option>
              <option value="sick">Sick Leave</option>
              <option value="vacation">Vacation</option>
              <option value="personal">Personal Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
              <option value="other">Other</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                {...register('startDate', { required: 'Start date is required' })}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                {...register('endDate', { required: 'End date is required' })}
                type="date"
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {startDate && endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Total Duration: {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <textarea
              {...register('reason', {
                required: 'Reason is required',
                minLength: { value: 10, message: 'Reason must be at least 10 characters' }
              })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide a detailed reason for your leave request..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/leaves')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LeaveForm;