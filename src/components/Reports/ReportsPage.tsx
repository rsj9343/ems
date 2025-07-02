import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { BarChart3, Download, Calendar, Users, TrendingUp, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Card from '../Common/Card';
import Button from '../Common/Button';
import { SimpleBarChart, SimplePieChart, SimpleLineChart } from '../Common/Charts';
import toast from 'react-hot-toast';

const ReportsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportFilters, setReportFilters] = useState({
    startDate: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    department: '',
    format: 'json'
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAnalytics();
      setAnalytics(response);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: 'employees' | 'leaves' | 'performance') => {
    try {
      const params = {
        ...reportFilters,
        startDate: reportFilters.startDate,
        endDate: reportFilters.endDate
      };

      let response;
      switch (type) {
        case 'employees':
          response = await reportService.generateEmployeeReport(params);
          break;
        case 'leaves':
          response = await reportService.generateLeaveReport(params);
          break;
        case 'performance':
          response = await reportService.generatePerformanceReport(params);
          break;
      }

      if (reportFilters.format === 'json') {
        // Display data in modal or new page
        console.log(response);
        toast.success('Report generated successfully');
      } else {
        // File download handled by browser
        toast.success('Report downloaded successfully');
      }
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const departmentChartData = analytics?.departmentDistribution?.map((dept: any) => ({
    name: dept._id,
    employees: dept.count,
    avgSalary: Math.round(dept.avgSalary || 0),
    avgRating: dept.avgRating || 0
  })) || [];

  const hiringTrendData = analytics?.hiringTrends?.map((trend: any) => ({
    month: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
    hires: trend.count
  })) || [];

  const performanceData = analytics?.performanceDistribution?.map((perf: any) => ({
    rating: `${perf._id} Stars`,
    count: perf.count
  })) || [];

  const leaveStatusData = analytics?.leaveStats?.map((leave: any) => ({
    status: leave._id,
    count: leave.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and data exports</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.employeeStats?.totalEmployees || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">
                {(analytics?.employeeStats?.avgPerformance || 0).toFixed(1)}/5
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Tenure</p>
              <p className="text-2xl font-bold text-gray-900">
                {(analytics?.employeeStats?.avgTenure || 0).toFixed(1)} yrs
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Salary</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(analytics?.employeeStats?.avgSalary || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
          <SimpleBarChart
            data={departmentChartData}
            xKey="name"
            yKey="employees"
            height={300}
          />
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
          <SimplePieChart
            data={performanceData}
            nameKey="rating"
            valueKey="count"
            height={300}
          />
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Trends</h3>
          <SimpleLineChart
            data={hiringTrendData}
            xKey="month"
            yKey="hires"
            height={300}
          />
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Status</h3>
          <SimplePieChart
            data={leaveStatusData}
            nameKey="status"
            valueKey="count"
            height={300}
          />
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={reportFilters.startDate}
              onChange={(e) => setReportFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={reportFilters.endDate}
              onChange={(e) => setReportFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={reportFilters.format}
              onChange={(e) => setReportFilters(prev => ({ ...prev, format: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="json">View Online</option>
              <option value="csv">Download CSV</option>
              <option value="excel">Download Excel</option>
            </select>
          </div>
        </div>

        {/* Report Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => generateReport('employees')}
            className="flex items-center justify-center space-x-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            <span>Employee Report</span>
          </Button>

          <Button
            onClick={() => generateReport('leaves')}
            className="flex items-center justify-center space-x-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            <span>Leave Report</span>
          </Button>

          <Button
            onClick={() => generateReport('performance')}
            className="flex items-center justify-center space-x-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            <span>Performance Report</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;