import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Leave from '../models/Leave.js';
import PerformanceReview from '../models/PerformanceReview.js';
import { Parser } from 'json2csv';
import XLSX from 'xlsx';

// Generate employee report
export const generateEmployeeReport = async (req, res) => {
  try {
    const {
      format = 'json',
      department,
      status,
      employmentType,
      startDate,
      endDate
    } = req.query;

    // Build filter
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (employmentType) filter.employmentType = employmentType;
    if (startDate && endDate) {
      filter.dateOfJoining = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const employees = await Employee.find(filter)
      .populate('department', 'name')
      .populate('manager', 'name employeeId')
      .select('-documents -performanceReviews -workHistory');

    const reportData = employees.map(emp => ({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      position: emp.position,
      department: emp.department?.name || 'N/A',
      manager: emp.manager?.name || 'N/A',
      dateOfJoining: emp.dateOfJoining.toISOString().split('T')[0],
      salary: emp.salary,
      status: emp.status,
      employmentType: emp.employmentType,
      workLocation: emp.workLocation,
      performanceRating: emp.performanceRating,
      age: emp.age,
      tenure: `${emp.tenure.years} years, ${emp.tenure.months} months`
    }));

    if (format === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(reportData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=employee-report.csv');
      return res.send(csv);
    }

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Employees');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=employee-report.xlsx');
      return res.send(buffer);
    }

    res.json({
      reportType: 'Employee Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      filters: { department, status, employmentType, startDate, endDate },
      data: reportData
    });

  } catch (error) {
    console.error('Generate employee report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate leave report
export const generateLeaveReport = async (req, res) => {
  try {
    const {
      format = 'json',
      department,
      status,
      type,
      startDate,
      endDate
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (startDate && endDate) {
      filter.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let leaves = await Leave.find(filter)
      .populate('employee', 'name employeeId department position')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    // Filter by department if specified
    if (department) {
      leaves = leaves.filter(leave => 
        leave.employee.department.toString() === department
      );
    }

    const reportData = leaves.map(leave => ({
      employeeId: leave.employee.employeeId,
      employeeName: leave.employee.name,
      position: leave.employee.position,
      leaveType: leave.type,
      startDate: leave.startDate.toISOString().split('T')[0],
      endDate: leave.endDate.toISOString().split('T')[0],
      totalDays: leave.totalDays,
      status: leave.status,
      appliedDate: leave.createdAt.toISOString().split('T')[0],
      approvedBy: leave.approvedBy?.name || 'N/A',
      approvedDate: leave.approvedDate ? leave.approvedDate.toISOString().split('T')[0] : 'N/A',
      reason: leave.reason,
      rejectionReason: leave.rejectionReason || 'N/A'
    }));

    if (format === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(reportData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leave-report.csv');
      return res.send(csv);
    }

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leaves');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=leave-report.xlsx');
      return res.send(buffer);
    }

    res.json({
      reportType: 'Leave Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      filters: { department, status, type, startDate, endDate },
      data: reportData
    });

  } catch (error) {
    console.error('Generate leave report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate performance report
export const generatePerformanceReport = async (req, res) => {
  try {
    const {
      format = 'json',
      department,
      startDate,
      endDate
    } = req.query;

    // Build filter
    const filter = { status: 'completed' };
    if (startDate && endDate) {
      filter['reviewPeriod.endDate'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let reviews = await PerformanceReview.find(filter)
      .populate('employee', 'name employeeId department position')
      .populate('reviewer', 'name employeeId')
      .sort({ 'reviewPeriod.endDate': -1 });

    // Filter by department if specified
    if (department) {
      reviews = reviews.filter(review => 
        review.employee.department.toString() === department
      );
    }

    const reportData = reviews.map(review => ({
      employeeId: review.employee.employeeId,
      employeeName: review.employee.name,
      position: review.employee.position,
      reviewPeriodStart: review.reviewPeriod.startDate.toISOString().split('T')[0],
      reviewPeriodEnd: review.reviewPeriod.endDate.toISOString().split('T')[0],
      overallRating: review.overallRating,
      reviewer: review.reviewer.name,
      reviewDate: review.updatedAt.toISOString().split('T')[0],
      goalsCompleted: review.goals.filter(g => g.status === 'completed').length,
      totalGoals: review.goals.length,
      achievements: review.achievements.join('; '),
      areasForImprovement: review.areasForImprovement.join('; ')
    }));

    if (format === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(reportData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=performance-report.csv');
      return res.send(csv);
    }

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Performance');
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=performance-report.xlsx');
      return res.send(buffer);
    }

    res.json({
      reportType: 'Performance Report',
      generatedAt: new Date(),
      totalRecords: reportData.length,
      filters: { department, startDate, endDate },
      data: reportData
    });

  } catch (error) {
    console.error('Generate performance report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate analytics dashboard data
export const getAnalyticsDashboard = async (req, res) => {
  try {
    // Employee analytics
    const employeeStats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
          avgAge: { $avg: { $subtract: [new Date().getFullYear(), { $year: '$dateOfBirth' }] } },
          avgTenure: { $avg: { $divide: [{ $subtract: [new Date(), '$dateOfJoining'] }, 365 * 24 * 60 * 60 * 1000] } }
        }
      }
    ]);

    // Department distribution
    const departmentDistribution = await Employee.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept'
        }
      },
      { $unwind: '$dept' },
      {
        $group: {
          _id: '$dept.name',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
          avgRating: { $avg: '$performanceRating' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Hiring trends (last 12 months)
    const hiringTrends = await Employee.aggregate([
      {
        $match: {
          dateOfJoining: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$dateOfJoining' },
            month: { $month: '$dateOfJoining' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Leave trends
    const leaveStats = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDays: { $avg: '$totalDays' }
        }
      }
    ]);

    // Performance distribution
    const performanceDistribution = await Employee.aggregate([
      {
        $group: {
          _id: '$performanceRating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Salary ranges
    const salaryRanges = await Employee.aggregate([
      {
        $bucket: {
          groupBy: '$salary',
          boundaries: [0, 30000, 50000, 70000, 100000, 150000, 999999],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgSalary: { $avg: '$salary' }
          }
        }
      }
    ]);

    res.json({
      employeeStats: employeeStats[0] || {},
      departmentDistribution,
      hiringTrends,
      leaveStats,
      performanceDistribution,
      salaryRanges,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};