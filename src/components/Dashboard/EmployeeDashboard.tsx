import React from 'react';
import { Calendar, Clock, Users, Award, MapPin, Mail, Phone } from 'lucide-react';
import { EmployeeDashboardData } from '../../services/dashboardService';
import { format } from 'date-fns';
import Card from '../Common/Card';

interface EmployeeDashboardProps {
  data: EmployeeDashboardData;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const leaveStats = [
    {
      name: 'Total Leaves',
      value: data.leaveStats.totalLeaves,
      icon: Calendar,
      color: 'blue'
    },
    {
      name: 'Pending',
      value: data.leaveStats.pendingLeaves,
      icon: Clock,
      color: 'yellow'
    },
    {
      name: 'Approved',
      value: data.leaveStats.approvedLeaves,
      icon: Award,
      color: 'green'
    },
    {
      name: 'Colleagues',
      value: data.colleaguesCount,
      icon: Users,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {data.employee.name}!</h1>
            <p className="text-blue-100 mt-2">
              {data.employee.position} • {data.employee.department.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100">Employee ID</p>
            <p className="text-2xl font-bold">{data.employee.employeeId}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {leaveStats.map((stat) => (
          <Card key={stat.name}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employee Info */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Information</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-gray-900">{data.employee.department.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Date of Joining</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(data.employee.dateOfJoining), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Work Experience</p>
                <p className="font-medium text-gray-900">
                  {data.tenure.years} years, {data.tenure.months} months
                </p>
              </div>
            </div>

            {data.employee.manager && (
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Manager</p>
                  <p className="font-medium text-gray-900">
                    {data.employee.manager.name} ({data.employee.manager.employeeId})
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Leaves */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leave Applications</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          {data.recentLeaves.length > 0 ? (
            <div className="space-y-4">
              {data.recentLeaves.map((leave) => (
                <div key={leave._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="capitalize font-medium text-gray-900">{leave.type}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="mt-1">{leave.totalDays} days</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leave applications</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't applied for any leaves yet.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;