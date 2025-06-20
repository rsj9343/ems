import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { employeeService, Employee } from '../../services/employeeService';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2, 
  User,
  DollarSign,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../Common/Card';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';

const EmployeeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await employeeService.getById(id);
      setEmployee(response.employee);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resigned': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTenure = () => {
    if (!employee) return '';
    
    const joinDate = new Date(employee.dateOfJoining);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading employee details..." />;
  }

  if (error || !employee) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-sm text-gray-500">{error || 'Employee not found'}</p>
        <Button onClick={() => navigate('/employees')} className="mt-4">
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/employees')}
            variant="outline"
            size="small"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-600">
                {employee.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <p className="text-gray-600">{employee.position}</p>
            </div>
          </div>
        </div>
        {isAdmin && (
          <Link to={`/employees/${employee._id}/edit`}>
            <Button className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Edit Employee</span>
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                {employee.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium text-gray-900">{employee.employeeId}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{employee.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{employee.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium text-gray-900">{employee.department.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Date of Joining</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(employee.dateOfJoining), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {employee.dateOfBirth && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(employee.dateOfBirth), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Address Information */}
          {employee.address && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Address Information</h3>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">
                    {[
                      employee.address.street,
                      employee.address.city,
                      employee.address.state,
                      employee.address.zipCode,
                      employee.address.country
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Emergency Contact */}
          {employee.emergencyContact && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {employee.emergencyContact.name && (
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{employee.emergencyContact.name}</p>
                  </div>
                )}
                {employee.emergencyContact.relationship && (
                  <div>
                    <p className="text-sm text-gray-600">Relationship</p>
                    <p className="font-medium text-gray-900">{employee.emergencyContact.relationship}</p>
                  </div>
                )}
                {employee.emergencyContact.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{employee.emergencyContact.phone}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Job Details</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Salary</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${employee.salary.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Tenure</p>
                  <p className="font-medium text-gray-900">{calculateTenure()}</p>
                </div>
              </div>

              {employee.manager && (
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Manager</p>
                    <p className="font-medium text-gray-900">{employee.manager.name}</p>
                  </div>
                </div>
              )}

              {employee.performanceRating && (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-yellow-400">★</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Performance Rating</p>
                    <p className="font-medium text-gray-900">
                      {employee.performanceRating}/5
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Send Email</span>
              </a>
              <a
                href={`tel:${employee.phone}`}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Call Employee</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;